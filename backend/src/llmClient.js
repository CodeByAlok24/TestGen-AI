import { config } from './config.js'

export class LLMClientError extends Error {}

function mockResponse() {
  return `===PYTEST===
import pytest

def test_create_order_valid_user_and_item(mocker):
    user_service = mocker.Mock()
    user_service.get_user.return_value = {"id": 1}
    inventory_service = mocker.Mock()
    inventory_service.get_item.return_value = {"id": 1}
    order_repo = mocker.Mock()
    order_repo.save.return_value = {"user": 1, "item": 1}

    result = create_order(user_service, inventory_service, order_repo, 1, 1)

    assert result == {"user": 1, "item": 1}

===JUNIT===
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public class GeneratedTests {
  @Test
  void createsOrderForValidInputs() {
    assertEquals(true, true);
  }
}
===JEST===
test('creates order for valid inputs', () => {
  expect(true).toBe(true);
});
`
}

async function requestOpenAICompatible({ apiKey, baseUrl, model, temperature, prompt }) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: 'Return only the requested output format.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new LLMClientError(text || 'LLM request failed.')
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || ''
}

export async function callLlm(prompt, provider) {
  const normalizedProvider = (provider || config.llmProvider || 'mock').toLowerCase()

  if (normalizedProvider === 'mock' || normalizedProvider === 'local') {
    return mockResponse()
  }

  if (normalizedProvider === 'api' || normalizedProvider === 'groq') {
    if (!config.groqApiKey) {
      throw new LLMClientError('GROQ_API_KEY is missing.')
    }

    return requestOpenAICompatible({
      apiKey: config.groqApiKey,
      baseUrl: 'https://api.groq.com/openai/v1',
      model: config.groqModel,
      temperature: config.groqTemperature,
      prompt,
    })
  }

  if (normalizedProvider === 'openai') {
    if (!config.openAiApiKey) {
      throw new LLMClientError('OPENAI_API_KEY is missing.')
    }

    return requestOpenAICompatible({
      apiKey: config.openAiApiKey,
      baseUrl: 'https://api.openai.com/v1',
      model: config.openAiModel,
      temperature: config.openAiTemperature,
      prompt,
    })
  }

  if (
    normalizedProvider === 'huggingface' ||
    normalizedProvider === 'hf'
  ) {
    if (!config.huggingFaceApiKey) {
      throw new LLMClientError('HUGGINGFACE_API_KEY is missing.')
    }

    return requestOpenAICompatible({
      apiKey: config.huggingFaceApiKey,
      baseUrl: config.huggingFaceBaseUrl,
      model: config.huggingFaceModel,
      temperature: 0.2,
      prompt,
    })
  }

  throw new LLMClientError(`Unsupported provider '${normalizedProvider}'.`)
}
