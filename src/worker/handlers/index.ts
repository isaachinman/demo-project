import type { JobHandler, JobType } from '@demo-project/types'

import { ping } from './ping'

export const handlers: { [K in JobType]: JobHandler<K> } = {
  ping,
}
