"""
Orchestrates resume analysis with progress reporting for the HTTP API.
"""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, Optional

from config import DEVELOPMENT_MODE
from evaluator import ResumeEvaluator
from github import fetch_and_display_github_info
from models import EvaluationData, JSONResume
from pdf import PDFHandler
from prompt import DEFAULT_MODEL, MODEL_PARAMETERS
from score import (
    _evaluate_resume,
    find_profile,
    is_valid_resume_data,
)
from llm_context import reset_gemini_api_key, set_gemini_api_key
from transform import transform_evaluation_response

logger = logging.getLogger(__name__)

PIPELINE_STEPS = [
    {"id": "parse", "label": "Parsing PDF"},
    {"id": "extract", "label": "Extracting Sections"},
    {"id": "github", "label": "Fetching GitHub Data"},
    {"id": "evaluate", "label": "Evaluating Resume"},
]

ProgressCallback = Callable[[Dict[str, Any]], None]


@dataclass
class AnalysisResult:
    resume: JSONResume
    evaluation: EvaluationData
    github: Optional[Dict[str, Any]]
    github_status: str
    file_name: str


@dataclass
class ProgressState:
    step_id: str = "parse"
    step_index: int = 0
    progress: int = 0
    eta_seconds: int = 60
    message: str = "Starting analysis…"
    started_at: float = field(default_factory=time.time)

    def emit(self, callback: Optional[ProgressCallback]) -> None:
        if callback:
            callback(self.to_dict())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step_id,
            "stepIndex": self.step_index,
            "progress": self.progress,
            "etaSeconds": self.eta_seconds,
            "message": self.message,
        }


def _steps_for_run(include_github: bool) -> list:
    if include_github:
        return PIPELINE_STEPS
    return [s for s in PIPELINE_STEPS if s["id"] != "github"]


def _cache_paths(pdf_path: str) -> tuple[str, str]:
    base = os.path.basename(pdf_path).replace(".pdf", "")
    return (
        f"cache/resumecache_{base}.json",
        f"cache/githubcache_{base}.json",
    )


def _report(
    state: ProgressState,
    callback: Optional[ProgressCallback],
    *,
    step_id: str,
    step_index: int,
    progress: int,
    eta_seconds: int,
    message: str,
) -> None:
    state.step_id = step_id
    state.step_index = step_index
    state.progress = progress
    state.eta_seconds = eta_seconds
    state.message = message
    state.emit(callback)


def run_analysis(
    pdf_path: str,
    *,
    include_github: bool = True,
    use_cache: bool = DEVELOPMENT_MODE,
    on_progress: Optional[ProgressCallback] = None,
    gemini_api_key: Optional[str] = None,
) -> AnalysisResult:
    """Run the full resume analysis pipeline."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    token = set_gemini_api_key(gemini_api_key)
    try:
        return _run_analysis_inner(
            pdf_path,
            include_github=include_github,
            use_cache=use_cache,
            on_progress=on_progress,
        )
    finally:
        reset_gemini_api_key(token)


def _run_analysis_inner(
    pdf_path: str,
    *,
    include_github: bool = True,
    use_cache: bool = DEVELOPMENT_MODE,
    on_progress: Optional[ProgressCallback] = None,
) -> AnalysisResult:

    file_name = os.path.basename(pdf_path)
    steps = _steps_for_run(include_github)
    state = ProgressState()
    cache_filename, github_cache_filename = _cache_paths(pdf_path)

    # --- Step 1: Parse PDF to text ---
    _report(
        state,
        on_progress,
        step_id="parse",
        step_index=0,
        progress=5,
        eta_seconds=55,
        message="Converting PDF to text…",
    )

    pdf_handler = PDFHandler()
    resume_text = pdf_handler.extract_text_from_pdf(pdf_path)
    if not resume_text:
        raise ValueError(
            "Failed to read PDF. The file may be corrupted or password-protected."
        )

    _report(
        state,
        on_progress,
        step_id="parse",
        step_index=0,
        progress=12,
        eta_seconds=50,
        message="PDF parsed successfully",
    )

    # --- Step 2: Extract sections via LLM ---
    _report(
        state,
        on_progress,
        step_id="extract",
        step_index=1,
        progress=15,
        eta_seconds=48,
        message="Extracting resume sections with AI…",
    )

    resume_data: Optional[JSONResume] = None
    cache_loaded = False

    if use_cache and os.path.exists(cache_filename):
        try:
            cached_data = json.loads(Path(cache_filename).read_text(encoding="utf-8"))
            loaded_resume = JSONResume(**cached_data)
            if is_valid_resume_data(loaded_resume):
                resume_data = loaded_resume
                cache_loaded = True
        except Exception as exc:
            logger.warning("Invalid resume cache %s: %s", cache_filename, exc)

    if not cache_loaded:
        resume_data = pdf_handler._extract_all_sections_separately(resume_text)
        if resume_data is None:
            raise ValueError(
                "Failed to extract resume sections. The PDF may be scanned, image-only, or poorly formatted."
            )
        if use_cache and is_valid_resume_data(resume_data):
            os.makedirs(os.path.dirname(cache_filename), exist_ok=True)
            Path(cache_filename).write_text(
                json.dumps(resume_data.model_dump(), indent=2, ensure_ascii=False),
                encoding="utf-8",
            )

    _report(
        state,
        on_progress,
        step_id="extract",
        step_index=1,
        progress=50,
        eta_seconds=35,
        message="Resume sections extracted",
    )

    # --- Step 3: GitHub enrichment ---
    github_data: Dict[str, Any] = {}
    github_status = "skipped"

    github_step_index = next(
        (i for i, s in enumerate(steps) if s["id"] == "github"), -1
    )

    if include_github:
        _report(
            state,
            on_progress,
            step_id="github",
            step_index=github_step_index,
            progress=55,
            eta_seconds=28,
            message="Looking for GitHub profile…",
        )

        profiles = []
        if resume_data.basics and resume_data.basics.profiles:
            profiles = resume_data.basics.profiles

        github_profile = find_profile(profiles, "Github")

        if not github_profile:
            github_status = "not_found"
            _report(
                state,
                on_progress,
                step_id="github",
                step_index=github_step_index,
                progress=70,
                eta_seconds=22,
                message="No GitHub profile found on resume",
            )
        else:
            github_cache_loaded = False
            if use_cache and os.path.exists(github_cache_filename):
                try:
                    loaded_github = json.loads(
                        Path(github_cache_filename).read_text(encoding="utf-8")
                    )
                    if (
                        isinstance(loaded_github, dict)
                        and loaded_github.get("profile")
                    ):
                        github_data = loaded_github
                        github_cache_loaded = True
                except Exception as exc:
                    logger.warning("Invalid GitHub cache: %s", exc)

            if not github_cache_loaded:
                try:
                    github_data = fetch_and_display_github_info(github_profile.url)
                except Exception as exc:
                    err = str(exc).lower()
                    if "rate" in err or "403" in err:
                        github_status = "rate_limit"
                        github_data = {}
                    else:
                        logger.error("GitHub fetch error: %s", exc)
                        github_data = {}

                if (
                    use_cache
                    and github_data
                    and isinstance(github_data, dict)
                    and github_data.get("profile")
                ):
                    os.makedirs(os.path.dirname(github_cache_filename), exist_ok=True)
                    Path(github_cache_filename).write_text(
                        json.dumps(github_data, indent=2, ensure_ascii=False),
                        encoding="utf-8",
                    )

            if github_status != "rate_limit":
                if github_data and github_data.get("profile"):
                    github_status = "success"
                else:
                    github_status = "not_found"

            _report(
                state,
                on_progress,
                step_id="github",
                step_index=github_step_index,
                progress=72,
                eta_seconds=18,
                message=(
                    "GitHub data fetched"
                    if github_status == "success"
                    else f"GitHub: {github_status.replace('_', ' ')}"
                ),
            )

    # --- Step 4: Evaluate ---
    evaluate_index = next(
        (i for i, s in enumerate(steps) if s["id"] == "evaluate"), len(steps) - 1
    )
    _report(
        state,
        on_progress,
        step_id="evaluate",
        step_index=evaluate_index,
        progress=78,
        eta_seconds=15,
        message="Running AI evaluation…",
    )

    evaluation = _evaluate_resume(
        resume_data,
        github_data if github_status == "success" else None,
    )
    if evaluation is None:
        raise RuntimeError("Evaluation failed. Check LLM provider configuration.")

    _report(
        state,
        on_progress,
        step_id="evaluate",
        step_index=evaluate_index,
        progress=95,
        eta_seconds=2,
        message="Finalizing results…",
    )

    if use_cache:
        try:
            csv_row = transform_evaluation_response(
                file_name=file_name,
                evaluation=evaluation,
                resume_data=resume_data,
                github_data=github_data if github_data else None,
            )
            csv_path = "resume_evaluations.csv"
            file_exists = os.path.exists(csv_path)
            import csv

            with open(csv_path, "a", newline="", encoding="utf-8") as csvfile:
                fieldnames = list(csv_row.keys())
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                if not file_exists:
                    writer.writeheader()
                writer.writerow(csv_row)
        except Exception as exc:
            logger.warning("CSV export failed: %s", exc)

    _report(
        state,
        on_progress,
        step_id="evaluate",
        step_index=evaluate_index,
        progress=100,
        eta_seconds=0,
        message="Complete",
    )

    return AnalysisResult(
        resume=resume_data,
        evaluation=evaluation,
        github=github_data if github_status == "success" else None,
        github_status=github_status,
        file_name=file_name,
    )


def result_to_dict(result: AnalysisResult) -> Dict[str, Any]:
    """Serialize pipeline result for JSON API responses."""
    return {
        "resume": result.resume.model_dump(),
        "evaluation": result.evaluation.model_dump(),
        "github": result.github,
        "githubStatus": result.github_status,
        "fileName": result.file_name,
    }
