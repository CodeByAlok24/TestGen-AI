from __future__ import annotations

import re


_SECTION_RE = re.compile(r"^===([A-Z_]+)===$", re.MULTILINE)
_FENCE_RE = re.compile(r"^```[a-zA-Z0-9_-]*\n(?P<body>.*)\n```$", re.DOTALL)


def _strip_code_fence(text: str) -> str:
    text = (text or "").strip()
    match = _FENCE_RE.match(text)
    if match:
        return match.group("body").strip()
    return text


def parse_output(raw: str) -> dict[str, str]:
    """
    Expected LLM output:
    ===PYTEST===
    ...
    ===JUNIT===
    ...
    ===JEST===
    ...
    """
    raw = (raw or "").strip()
    if not raw:
        return {"pytest": "", "junit": "", "jest": ""}

    parts: dict[str, str] = {}
    matches = list(_SECTION_RE.finditer(raw))
    if not matches:
        return {"pytest": _strip_code_fence(raw), "junit": "", "jest": ""}

    for idx, m in enumerate(matches):
        key = m.group(1).lower()
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(raw)
        parts[key] = _strip_code_fence(raw[start:end])

    return {
        "pytest": parts.get("pytest", ""),
        "junit": parts.get("junit", ""),
        "jest": parts.get("jest", ""),
    }
