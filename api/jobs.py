"""In-memory job store for async analysis tasks."""

from __future__ import annotations

import threading
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional


@dataclass
class Job:
    id: str
    status: str = "pending"  # pending | running | completed | failed
    file_name: str = ""
    include_github: bool = True
    pdf_path: str = ""
    step: str = "parse"
    step_index: int = -1
    progress: int = 0
    eta_seconds: int = 60
    message: str = "Queued"
    error: Optional[str] = None
    error_type: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    gemini_api_key: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None

    def to_status(self) -> Dict[str, Any]:
        return {
            "jobId": self.id,
            "status": self.status,
            "step": self.step,
            "stepIndex": self.step_index,
            "progress": self.progress,
            "etaSeconds": self.eta_seconds,
            "message": self.message,
            "fileName": self.file_name,
            "error": self.error,
            "errorType": self.error_type,
        }

    def to_result(self) -> Dict[str, Any]:
        if self.status != "completed" or not self.result:
            raise ValueError("Job not completed")
        return {
            **self.result,
            "uploadedAt": datetime.fromtimestamp(
                self.completed_at or time.time(), tz=timezone.utc
            ).isoformat(),
        }


class JobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, Job] = {}
        self._lock = threading.Lock()

    def create(
        self,
        file_name: str,
        pdf_path: str,
        include_github: bool,
        gemini_api_key: Optional[str] = None,
    ) -> Job:
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            file_name=file_name,
            pdf_path=pdf_path,
            include_github=include_github,
            gemini_api_key=gemini_api_key,
        )
        with self._lock:
            self._jobs[job_id] = job
        return job

    def get(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def update_progress(self, job_id: str, data: Dict[str, Any]) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return
            job.status = "running"
            job.step = data.get("step", job.step)
            job.step_index = data.get("stepIndex", job.step_index)
            job.progress = data.get("progress", job.progress)
            job.eta_seconds = data.get("etaSeconds", job.eta_seconds)
            job.message = data.get("message", job.message)

    def complete(self, job_id: str, result: Dict[str, Any]) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return
            job.status = "completed"
            job.progress = 100
            job.eta_seconds = 0
            job.result = result
            job.completed_at = time.time()

    def clear_sensitive(self, job_id: str) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.gemini_api_key = None

    def fail(self, job_id: str, message: str, error_type: str = "api_failure") -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return
            job.status = "failed"
            job.error = message
            job.error_type = error_type
            job.completed_at = time.time()


job_store = JobStore()
