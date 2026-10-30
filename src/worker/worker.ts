import { Worker } from 'bullmq'

import { log } from '@demo-project/lib'
import { redis } from '@demo-project/redis'
import type { JobPayload, JobType } from '@demo-project/types'
import { handlers } from '@demo-project/worker/handlers'
import { JOBS_QUEUE } from '@demo-project/worker/queue'

const runJob = <T extends JobType>(data: JobPayload<T>) => handlers[data.jobType](data)

export const createJobsWorker = () => {
  const worker = new Worker<JobPayload>(
    JOBS_QUEUE,
    async job => {
      await runJob(job.data)
    },
    {
      concurrency: 5,
      connection: redis,
    },
  )

  worker.on('failed', (job, error) =>
    log.error(
      {
        attemptsMade: job?.attemptsMade ?? null,
        err: error,
        jobId: job?.id ?? null,
        jobType: job?.data.jobType ?? null,
      },
      'worker: job failed',
    ),
  )

  worker.on('error', error => log.error({ err: error }, 'worker: error'))

  return worker
}
