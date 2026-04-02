from __future__ import annotations

import json
import os
import sys
from functools import lru_cache
from pathlib import Path


class LLMClientError(Exception):
    pass


def _mock_response(prompt: str) -> str:
    sample_pytest = """import pytest

def test_happy_path():
    \"\"\"Basic sanity test for provided input.\"\"\"
    assert True
"""

    sample_junit = """import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GeneratedTests {
  @Test
  void happyPath() {
    assertTrue(true);
  }
}
"""

    sample_jest = """test('happy path', () => {
  expect(true).toBe(true);
});
"""
    return "\n".join(
        [
            "===PYTEST===",
            sample_pytest.strip(),
            "===JUNIT===",
            sample_junit.strip(),
            "===JEST===",
            sample_jest.strip(),
        ]
    )


def _normalize_provider(provider: str | None) -> str:
    provider = (provider or os.getenv("LLM_PROVIDER", "mock")).lower().strip()
    if provider == "api":
        return "groq"
    return provider


@lru_cache(maxsize=1)
def _get_local_model():
    backend_dir = Path(__file__).resolve().parent.parent
    model_dir = backend_dir / "TCG_Model_Export"
    if not model_dir.exists():
        raise LLMClientError("TCG_Model_Export folder is missing in backend.")

    sys.path.insert(0, str(model_dir))
    try:
        from model_engine import TCGModel
    except ModuleNotFoundError as exc:
        if exc.name == "mlx_lm":
            raise LLMClientError(
                "Local model runtime is missing. Install 'mlx-lm' in the backend environment."
            ) from exc
        raise LLMClientError(f"Failed to import local model engine: {exc}") from exc
    except Exception as exc:
        raise LLMClientError(f"Failed to load local model engine: {exc}") from exc

    try:
        return TCGModel()
    except Exception as exc:
        raise LLMClientError(f"Failed to initialize local model: {exc}") from exc


def _extract_language_from_prompt(prompt: str) -> str:
    marker = "Language: "
    for line in prompt.splitlines():
        if line.startswith(marker):
            return line.split(marker, 1)[1].strip().lower()
    return "python"


def _extract_source_from_prompt(prompt: str) -> str:
    sections = ["SOURCE CODE:\n", "INTERFACE / CONTRACT:\n", "FAILING TEST:\n"]
    terminators = ["\n\nREQUIREMENTS:", "\n\nRULES (strict):", "\n\nERROR MESSAGE:"]

    for section, terminator in zip(sections, terminators):
        if section in prompt:
            content = prompt.split(section, 1)[1]
            if terminator in content:
                content = content.split(terminator, 1)[0]
            return content.strip()

    if "Code:\n" in prompt:
        return prompt.split("Code:\n", 1)[1].strip()

    return prompt.strip()


def _normalize_local_response(response) -> str:
    if isinstance(response, dict):
        if response.get("error"):
            raise LLMClientError(f"Local model error: {response['error']}")

        pytest_text = (
            response.get("pytest")
            or response.get("PYTEST")
            or response.get("pytest_tests")
            or response.get("python")
            or response.get("Python")
            or response.get("tests")
            or response.get("testcases")
            or ""
        )
        junit_text = (
            response.get("junit")
            or response.get("JUNIT")
            or response.get("java")
            or response.get("Java")
            or ""
        )
        jest_text = (
            response.get("jest")
            or response.get("JEST")
            or response.get("javascript")
            or response.get("JavaScript")
            or ""
        )

        if pytest_text or junit_text or jest_text:
            return "\n".join(
                [
                    "===PYTEST===",
                    str(pytest_text).strip(),
                    "===JUNIT===",
                    str(junit_text).strip(),
                    "===JEST===",
                    str(jest_text).strip(),
                ]
            )

        return json.dumps(response)

    return str(response).strip()


def call_llm(prompt: str, provider: str | None = None) -> str:
    provider = _normalize_provider(provider)

    if provider == "mock":
        return _mock_response(prompt)

    if provider == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            raise LLMClientError("OPENAI_API_KEY is missing.")

        try:
            from openai import OpenAI

            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Return only the requested output format."},
                    {"role": "user", "content": prompt},
                ],
                temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.2")),
            )
            return resp.choices[0].message.content or ""
        except Exception as exc:
            raise LLMClientError(f"OpenAI request failed: {exc}") from exc

    if provider == "groq":
        if not os.getenv("GROQ_API_KEY"):
            raise LLMClientError("GROQ_API_KEY is missing.")

        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=os.getenv("GROQ_API_KEY"),
                base_url="https://api.groq.com/openai/v1",
            )
            resp = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[
                    {"role": "system", "content": "Return only the requested output format."},
                    {"role": "user", "content": prompt},
                ],
                temperature=float(os.getenv("GROQ_TEMPERATURE", "0.2")),
            )
            text = (resp.choices[0].message.content or "").strip()
            if not text:
                raise LLMClientError("Groq returned an empty response.")
            return text
        except LLMClientError:
            raise
        except Exception as exc:
            raise LLMClientError(f"Groq request failed: {exc}") from exc

    if provider == "local":
        try:
            model = _get_local_model()
            source = _extract_source_from_prompt(prompt)
            response = model.generate_test(
                source,
                language=_extract_language_from_prompt(prompt),
            )
            text = _normalize_local_response(response)
            if not text:
                raise LLMClientError("Local model returned an empty response.")
            return text
        except LLMClientError:
            raise
        except Exception as exc:
            raise LLMClientError(f"Local model request failed: {exc}") from exc

    raise LLMClientError(f"Unsupported LLM_PROVIDER '{provider}'.")
