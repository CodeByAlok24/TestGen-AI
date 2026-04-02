export function scoreTests(tests, provider = 'mock') {
  const combined = `${tests.pytest}\n${tests.junit}\n${tests.jest}`.trim()
  const lineCount = combined ? combined.split('\n').length : 0
  const hasErrorCase = /raise|throw|reject|error|invalid/i.test(combined)
  const hasAssertions = /assert|expect\(|assertEquals|assertTrue/i.test(combined)

  if (provider === 'mock' || provider === 'local') {
    const coverage = Math.min(95, 45 + lineCount * 2)
    const edgeCases = hasErrorCase ? 72 : 54
    const security = /auth|token|permission|sql|xss|csrf/i.test(combined) ? 76 : 58
    const readability = hasAssertions ? 82 : 61
    const overall = Math.round((coverage + edgeCases + security + readability) / 4)

    return {
      coverage,
      edge_cases: edgeCases,
      security,
      readability,
      overall,
      suggestions: [
        'Add explicit boundary-value assertions for invalid and empty inputs.',
        'Include one security-oriented scenario for authorization or malformed payloads.',
      ],
    }
  }

  return {
    coverage: 65,
    edge_cases: 60,
    security: 60,
    readability: 74,
    overall: 65,
    suggestions: ['Review generated tests and add framework-specific edge cases.'],
  }
}
