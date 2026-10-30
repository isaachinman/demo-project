import { log } from '@demo-project/lib'
import type { JobHandler } from '@demo-project/types'

export const ping: JobHandler<'ping'> = ({ text }) => {
  log.info({ text }, 'job: ping')
}
