import { OpenRouter } from '@openrouter/sdk'
import { toJsonSchema } from '@valibot/to-json-schema'

import { config } from '@demo-project/config'
import { v } from '@demo-project/lib'
import type { ModelRequest, ModelResult } from '@demo-project/types'
import { toMS } from '@demo-project/utils/data/toMS'

// Structured outputs constrain the JSON shape at the API; valibot still validates the result
// before anything is returned.

const MAX_TOKENS = 16_000

// Structured outputs accept anyOf but not oneOf (which valibot's variant produces). Variants
// discriminated by a literal key make anyOf equivalent. The API also has no use for the draft
// marker.
const jsonSchemaFor = (schema: v.GenericSchema) => {
  const { $schema, ...jsonSchema } = toJsonSchema(schema, {
    overrideSchema: ({ jsonSchema: { oneOf, ...rest } }) =>
      oneOf
        ? {
            ...rest,
            anyOf: oneOf,
          }
        : undefined,
  })

  return jsonSchema
}

// The SDK's retry budget is time-based: a fast transient failure is retried about once, rather than
// holding a request open across several attempts.
export const openRouter = new OpenRouter({
  apiKey: config.OPENROUTER_API_KEY ?? 'missing',
  retryConfig: {
    backoff: {
      exponent: 1,
      initialInterval: toMS.seconds(1),
      maxElapsedTime: toMS.seconds(2),
      maxInterval: toMS.seconds(1),
    },
    retryConnectionErrors: true,
    strategy: 'backoff',
  },
  timeoutMs: toMS.seconds(120),
})

const parseJson = (text: string): { ok: true; json: unknown } | { ok: false } => {
  try {
    return { json: JSON.parse(text), ok: true }
  } catch {
    return { ok: false }
  }
}

const textOf = (content: unknown) => (typeof content === 'string' ? content : '')

export const callModel = async <T extends v.GenericSchema>({
  schema,
  system,
  prompt,
  model = config.BACKGROUND_MODEL,
}: ModelRequest<T>): Promise<ModelResult<T>> => {
  const response = await openRouter.chat.send({
    chatRequest: {
      maxTokens: MAX_TOKENS,
      messages: [
        {
          content: system,
          role: 'system',
        },
        {
          content: prompt,
          role: 'user',
        },
      ],
      model,
      responseFormat: {
        jsonSchema: {
          name: 'output',
          schema: jsonSchemaFor(schema),
          strict: true,
        },
        type: 'json_schema',
      },
      stream: false,
    },
  })

  // Non-streaming requests always resolve to a ChatResult; the SDK types both shapes as one union.
  const result = 'choices' in response ? response : null
  const choice = result?.choices[0] ?? null
  const text = textOf(choice?.message.content)
  const usage = { ...result?.usage }
  const finishReason = choice?.finishReason ?? null
  const json = finishReason === 'stop' ? parseJson(text) : null
  const parsed = json?.ok ? v.safeParse(schema, json.json) : null
  const failure = json && !json.ok ? 'output was not JSON' : `model stopped with ${finishReason}`

  return parsed?.success
    ? { model: result?.model ?? model, ok: true, output: parsed.output, usage }
    : {
        model: result?.model ?? model,
        ok: false,
        reason: parsed ? 'output failed validation' : failure,
        text,
        usage,
      }
}
