import { callLlm } from './llmClient.js'

export async function healTest(failingTest, errorMsg, provider = 'mock') {
  if ((provider || 'mock').toLowerCase() === 'local') {
    return `${failingTest.trim()}\n\n# Updated by local fallback: verify assertion target and expected value.\n`
  }

  if ((provider || 'mock').toLowerCase() === 'mock') {
    return `${failingTest.trim()}\n\n# Updated by mock healer: verify assertion target and expected value.\n`
  }

  const prompt = `
You are a test repair engineer.
The test below is failing with the given error.
Identify the root cause and return ONLY the corrected test code.

FAILING TEST:
${failingTest}

ERROR MESSAGE:
${errorMsg}
  `.trim()

  return callLlm(prompt, provider)
}
