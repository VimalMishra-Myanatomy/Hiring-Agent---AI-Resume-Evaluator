"""Validate a Google Gemini API key without logging or storing it."""

from __future__ import annotations

from prompt import DEFAULT_MODEL


def validate_gemini_api_key(api_key: str) -> tuple[bool, str]:
    key = (api_key or "").strip()
    if not key:
        return False, "API key is required."

    if len(key) < 20:
        return False, "API key looks too short. Please check and try again."

    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        model = genai.GenerativeModel(model_name=DEFAULT_MODEL)
        response = model.generate_content(
            "Reply with exactly: OK",
            generation_config={"max_output_tokens": 8, "temperature": 0},
        )
        if response and response.text:
            return True, "API key verified successfully."
        return True, "API key verified successfully."
    except Exception as exc:
        message = str(exc).lower()
        if any(
            token in message
            for token in (
                "api key",
                "api_key",
                "invalid",
                "unauthorized",
                "permission",
                "401",
                "403",
                "not valid",
            )
        ):
            return False, "Invalid API key. Please check and try again."
        if "404" in message and "model" in message:
            # Key works but model name issue — still treat as valid key
            return True, "API key verified successfully."
        return False, "Could not validate key. Please try again later."
