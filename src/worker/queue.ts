import type { JobsOptions } from 'bullmq'
import { Queue } from 'bullmq'

import { redis } from '@demo-project/redis'
import type { JobPayload } from '@demo-project/types'
import { toMS } from '@demo-project/utils/data/toMS'

export const JOBS_QUEUE = 'jobs'

export const jobsQueue = new Queue<JobPayload>(JOBS_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      delay: toMS.seconds(1),
      type: 'exponential',
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})

export const addJob = (payload: JobPayload, options?: JobsOptions) => jobsQueue.add(payload.jobType, payload, options)
