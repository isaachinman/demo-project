// Each job type's payload, keyed by its jobType. Add a job by adding an entry here and its handler.
type JobPayloads = {
  ping: {
    text: string
  }
}

export type JobType = keyof JobPayloads

export type JobPayload<T extends JobType = JobType> = {
  [K in T]: JobPayloads[K] & { jobType: K }
}[T]

export type JobHandler<T extends JobType> = (data: JobPayload<T>) => Promise<void> | void
