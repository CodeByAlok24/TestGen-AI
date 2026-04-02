from __future__ import annotations


def _level_instructions(test_level: str) -> str:
    mapping = {
        "unit": "Focus on small isolated behavior with mocked or stubbed dependencies.",
        "integration": "Focus on interactions between components, modules, or API/database boundaries.",
        "acceptance": "Focus on user-visible business scenarios and expected outcomes.",
        "system": "Focus on end-to-end system behavior, major flows, and environment-level scenarios.",
    }
    return mapping.get(test_level, mapping["unit"])


def build_black_box_prompt(user_input: str, input_type: str, test_level: str) -> str:
    return f"""
You are a QA engineer performing BLACK BOX testing.
You have NO access to internal code implementation.
Treat the following {input_type} as a sealed black box.
Testing level: {test_level.upper()}

INTERFACE / CONTRACT:
{user_input}

RULES (strict):
- {_level_instructions(test_level)}
- Test ONLY external behavior and observable outputs
- Do NOT reference internal variable names or logic
- Keep the response compact and practical
- Write 2 to 3 focused tests per framework
- Cover happy path, boundary values, invalid input, and one security/error case when relevant
- Do NOT repeat the source code
- Do NOT include the implementation under test in the answer
- Use short test names and short assertions
- Do NOT add markdown fences or prose

OUTPUT:
===PYTEST===
<pytest tests here>
===JUNIT===
<junit tests here>
===JEST===
<jest tests here>
""".strip()


def build_white_box_prompt(user_input: str, input_type: str, test_level: str) -> str:
    return f"""
You are a senior engineer performing WHITE BOX testing.
You have FULL access to the source code below.
Analyze branches and return concise runnable tests only.
Testing level: {test_level.upper()}

SOURCE CODE:
{user_input}

REQUIREMENTS:
1. {_level_instructions(test_level)}
2. Write compact runnable tests for the most important branches
3. Keep total output short and practical
4. Use at most 3 tests per framework
5. Prefer direct assertions with no comments or docstrings
6. Do NOT restate the source code
7. Do NOT include the implementation under test in the answer
8. Start immediately with ===PYTEST=== and produce all three sections
9. Do NOT add markdown fences
10. Return ONLY the three required sections below

OUTPUT:
===PYTEST===
<pytest with full branch coverage>
===JUNIT===
<junit with full branch coverage>
===JEST===
<jest with full branch coverage>
""".strip()


def build_prompt(user_input: str, input_type: str, test_mode: str, test_level: str) -> str:
    if test_mode == "white_box":
        return build_white_box_prompt(user_input, input_type, test_level)
    return build_black_box_prompt(user_input, input_type, test_level)
