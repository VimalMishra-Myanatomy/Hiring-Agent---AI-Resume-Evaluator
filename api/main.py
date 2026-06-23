"""FastAPI server for the Hiring Agent resume evaluation pipeline."""

from __future__ import annotations

import logging
import os
import shutil
import threading
from pathlib import Path

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from api.gemini_key import validate_gemini_api_key
from api.jobs import job_store
from pipeline import result_to_dict, run_analysis
from prompt import GEMINI_API_KEY

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
os.makedirs("cache", exist_ok=True)

_DEFAULT_ORIGINS = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "http://localhost:4173"
)


def _cors_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", _DEFAULT_ORIGINS)
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    return origins or ["*"]


_cors = _cors_origins()
_allow_credentials = "*" not in _cors

app = FastAPI(
    title="Hiring Agent API",
    description="AI-powered resume evaluation pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _map_error(exc: Exception) -> tuple[str, str]:
    msg = str(exc)
    lower = msg.lower()
    if "pdf" in lower and ("read" in lower or "corrupt" in lower or "password" in lower):
        return "invalid_pdf", msg
    if "extract" in lower or "section" in lower or "scanned" in lower:
        return "parse_failed", msg
    if "rate" in lower or "403" in lower:
        return "github_rate_limit", msg
    if "timeout" in lower:
        return "timeout", msg
    if "api" in lower or "model" in lower or "gemini" in lower or "ollama" in lower:
        return "api_failure", msg
    return "api_failure", msg


def _run_job(job_id: str) -> None:
    job = job_store.get(job_id)
    if not job:
        return

    try:
        job_store.update_progress(
            job_id,
            {
                "step": "parse",
                "stepIndex": 0,
                "progress": 2,
                "etaSeconds": 60,
                "message": "Starting pipeline…",
            },
        )

        def on_progress(data: dict) -> None:
            job_store.update_progress(job_id, data)

        result = run_analysis(
            job.pdf_path,
            include_github=job.include_github,
            on_progress=on_progress,
            gemini_api_key=job.gemini_api_key,
        )
        job_store.complete(job_id, result_to_dict(result))
    except Exception as exc:
        logger.exception("Job %s failed", job_id)
        error_type, message = _map_error(exc)
        job_store.fail(job_id, message, error_type)
    finally:
        job_store.clear_sensitive(job_id)
        try:
            Path(job.pdf_path).unlink(missing_ok=True)
        except OSError:
            pass


@app.get("/api/health")
def health():
    from prompt import DEFAULT_MODEL, PROVIDER

    return {
        "status": "ok",
        "provider": PROVIDER,
        "model": DEFAULT_MODEL,
        "geminiConfigured": bool(GEMINI_API_KEY),
        "requiresUserKey": not bool(GEMINI_API_KEY),
    }


class ValidateKeyBody(BaseModel):
    apiKey: str = Field(..., min_length=1)


@app.post("/api/validate-key")
def validate_key(body: ValidateKeyBody):
    valid, message = validate_gemini_api_key(body.apiKey)
    if not valid:
        return JSONResponse(
            status_code=400,
            content={"valid": False, "message": message},
        )
    return {"valid": True, "message": message}


@app.post("/api/analyze")
async def start_analysis(
    file: UploadFile = File(...),
    include_github: str = Form("true"),
    x_gemini_api_key: str | None = Header(default=None, alias="X-Gemini-Api-Key"),
):
    include_gh = include_github.lower() in ("true", "1", "yes")
    user_key = (x_gemini_api_key or "").strip() or None

    if not user_key and not GEMINI_API_KEY:
        raise HTTPException(
            status_code=400,
            detail="Gemini API key required. Add your key on the upload screen.",
        )
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 10 MB")

    if len(content) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty or invalid")

    job = job_store.create(file.filename, "", include_gh, gemini_api_key=user_key)
    pdf_path = UPLOAD_DIR / f"{job.id}.pdf"
    pdf_path.write_bytes(content)
    job.pdf_path = str(pdf_path)

    thread = threading.Thread(target=_run_job, args=(job.id,), daemon=True)
    thread.start()

    return {"jobId": job.id, "fileName": file.filename}


@app.get("/api/analyze/{job_id}/status")
def get_status(job_id: str):
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.to_status()


@app.get("/api/analyze/{job_id}/result")
def get_result(job_id: str):
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "failed":
        return JSONResponse(
            status_code=422,
            content={
                "error": job.error,
                "errorType": job.error_type,
            },
        )

    if job.status != "completed":
        raise HTTPException(status_code=202, detail="Job still in progress")

    return job.to_result()
