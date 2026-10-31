import { callModel } from '@demo-project/ai'

import { EXTRACTION_SYSTEM, extractionPrompt } from './extractionPrompt'
import { type ExtractionInput, ExtractionResult } from './extractionSchema'

// Pure core: one model call, no database. The eval harness runs it against in-memory state.
export const extractMemories = async (input: ExtractionInput) => {
  const result = await callModel({
    prompt: extractionPrompt(input),
    schema: ExtractionResult,
    system: EXTRACTION_SYSTEM,
  })

  // Throwing lets BullMQ retry; after the last attempt the job stays failed and is logged.
  return result.ok ? result.output : Promise.reject(new Error(`extraction failed: ${result.reason}`))
}
