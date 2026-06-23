"""Per-request Gemini API key (in-memory only, never persisted server-side)."""

from __future__ import annotations

import contextvars
from typing import Optional

_gemini_api_key: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "gemini_api_key", default=None
)


def set_gemini_api_key(key: Optional[str]) -> contextvars.Token:
    return _gemini_api_key.set(key.strip() if key else None)


def reset_gemini_api_key(token: contextvars.Token) -> None:
    _gemini_api_key.reset(token)


def get_gemini_api_key() -> Optional[str]:
    return _gemini_api_key.get()
