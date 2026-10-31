import { log } from '@demo-project/lib'
import type { JobHandler } from '@demo-project/types'

// Stub until DEMO-6 lands the extraction.
export const extractMemories: JobHandler<'extractMemories'> = ({ conversationId }) => {
  log.info({ conversationId }, 'job: extractMemories (not implemented yet)')
}
