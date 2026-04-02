function levelInstructions(testLevel) {
  const mapping = {
    unit: 'Focus on small isolated behavior with mocked or stubbed dependencies.',
    integration:
      'Focus on interactions between components, modules, or API/database boundaries.',
    acceptance: 'Focus on user-visible business scenarios and expected outcomes.',
    system: 'Focus on end-to-end system behavior, major flows, and environment-level scenarios.',
  }

  return mapping[testLevel] || mapping.unit
}

export function buildPrompt(userInput, inputType, testMode, testLevel) {
  if (testMode === 'white_box') {
    return `
You are a senior engineer performing WHITE BOX testing.
You have FULL access to the source code below.
Analyze branches and return concise runnable tests only.
Testing level: ${testLevel.toUpperCase()}

SOURCE CODE:
${userInput}

REQUIREMENTS:
1. ${levelInstructions(testLevel)}
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
    `.trim()
  }

  return `
You are a QA engineer performing BLACK BOX testing.
You have NO access to internal code implementation.
Treat the following ${inputType} as a sealed black box.
Testing level: ${testLevel.toUpperCase()}

INTERFACE / CONTRACT:
${userInput}

RULES (strict):
- ${levelInstructions(testLevel)}
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
  `.trim()
}
