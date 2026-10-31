import type { v } from '@demo-project/lib'

export type ModelRequest<T extends v.GenericSchema> = {
  schema: T
  system: string
  prompt: string
  // Defaults to config.BACKGROUND_MODEL.
  model?: string
}

export type ModelResult<T extends v.GenericSchema> =
  | {
      ok: true
      output: v.InferOutput<T>
      model: string
      usage: Record<string, unknown>
    }
  | {
      ok: false
      reason: string
      text: string | null
      model: string | null
      usage: Record<string, unknown> | null
    }
