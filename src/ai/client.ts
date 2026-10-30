import Anthropic from '@anthropic-ai/sdk'
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

// Retry once on transient failures rather than holding a request open for the SDK default
// (10 minutes x 3 attempts).
export const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY ?? 'missing',
  maxRetries: 1,
  timeout: toMS.seconds(120),
})

export const callModel = async <T extends v.GenericSchema>({
  schema,
  system,
  prompt,
}: ModelRequest<T>): Promise<ModelResult<T>> => {
  const response = await anthropic.messages.create({
    max_tokens: MAX_TOKENS,
    messages: [
      {
        content: prompt,
        role: 'user',
      },
    ],
    model: config.ANTHROPIC_MODEL,
    output_config: {
      format: {
        schema: jsonSchemaFor(schema),
        type: 'json_schema',
      },
    },
    system,
  })

  const text = response.content.flatMap(block => (block.type === 'text' ? [block.text] : [])).join('')
  const usage = { ...response.usage }
  const parsed = response.stop_reason === 'end_turn' ? v.safeParse(schema, JSON.parse(text)) : null

  return parsed?.success
    ? { model: response.model, ok: true, output: parsed.output, usage }
    : {
        model: response.model,
        ok: false,
        reason: parsed ? 'output failed validation' : `model stopped with ${response.stop_reason}`,
        text,
        usage,
      }
}
