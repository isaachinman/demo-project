import { log } from '@demo-project/lib'
import { redis } from '@demo-project/redis'
import { JOBS_QUEUE } from '@demo-project/worker/queue'
import { createJobsWorker } from '@demo-project/worker/worker'

const worker = createJobsWorker()

// Finish in-flight jobs before exiting, so a deploy never abandons one mid-run.
const shutdown = async (signal: string) => {
  log.info({ signal }, 'worker: shutting down')

  await worker.close()
  await redis.quit()

  process.exit(0)
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)

log.info({ queue: JOBS_QUEUE }, 'worker: started')
