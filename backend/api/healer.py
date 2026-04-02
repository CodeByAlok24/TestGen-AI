from __future__ import annotations

import os

from .llm_client import call_llm

HEAL_PROMPT = """
You are a test repair engineer.
The test below is failing with the given error.
Identify the root cause and return ONLY the corrected test code.

FAILING TEST:
{failing_test}

ERROR MESSAGE:
{error_msg}

Return the fixed test with a comment explaining what was wrong.
""".strip()


def heal_test(failing_test: str, error_msg: str, provider: str | None = None) -> str:
    if os.getenv("LLM_PROVIDER", "mock").lower().strip() == "mock":
        return (
            failing_test.strip()
            + "\n\n# NOTE: mock healer: verify expected output / assertion.\n"
        )
    prompt = HEAL_PROMPT.format(failing_test=failing_test, error_msg=error_msg)
    return call_llm(prompt, provider=provider)
