import type { JobHandler, JobType } from '@demo-project/types'

import { extractMemories } from './extractMemories'
import { ping } from './ping'

export const handlers: { [K in JobType]: JobHandler<K> } = {
  extractMemories,
  ping,
}
