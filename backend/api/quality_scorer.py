from __future__ import annotations

import json
import os
import re

from .llm_client import LLMClientError, call_llm


_DEFAULT_SCORES = {
    "coverage": 0,
    "edge_cases": 0,
    "security": 0,
    "readability": 0,
    "overall": 0,
    "suggestions": ["Scoring failed: model returned invalid JSON."],
}


def _extract_json_object(raw: str) -> dict | None:
    raw = (raw or "").strip()
    if not raw:
        return None

    candidates = [raw]
    fenced = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", raw, flags=re.DOTALL)
    candidates.extend(fenced)

    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidates.append(raw[start : end + 1])

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except Exception:
            continue
        if isinstance(parsed, dict):
            return parsed
    return None


def score_tests(tests: dict, provider: str | None = None) -> dict:
    provider_name = (provider or os.getenv("LLM_PROVIDER", "mock")).lower().strip()
    if provider_name == "mock":
        return {
            "coverage": 65,
            "edge_cases": 55,
            "security": 50,
            "readability": 70,
            "overall": 60,
            "suggestions": [
                "Add explicit boundary value tests.",
                "Include at least one negative/security scenario per input type.",
            ],
        }

    prompt = f"""
Rate the following test suite on a scale of 0-100 for each dimension.
Return ONLY valid JSON — no markdown, no explanation.

TESTS:
{json.dumps(tests)}

JSON FORMAT:
{{
  "coverage": 0-100,
  "edge_cases": 0-100,
  "security": 0-100,
  "readability": 0-100,
  "overall": 0-100,
  "suggestions": ["...", "..."]
}}
    """.strip()

    try:
        raw = call_llm(prompt, provider=provider)
    except LLMClientError as exc:
        return {**_DEFAULT_SCORES, "suggestions": [f"Scoring failed: {exc}"]}

    parsed = _extract_json_object(raw)
    if not parsed:
        return _DEFAULT_SCORES

    try:
        return {
            "coverage": int(parsed["coverage"]),
            "edge_cases": int(parsed["edge_cases"]),
            "security": int(parsed["security"]),
            "readability": int(parsed["readability"]),
            "overall": int(parsed["overall"]),
            "suggestions": list(parsed.get("suggestions", []))[:5],
        }
    except Exception:
        return _DEFAULT_SCORES
