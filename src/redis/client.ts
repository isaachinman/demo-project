import { Redis } from 'ioredis'

import { config } from '@demo-project/config'
import { log } from '@demo-project/lib'

// BullMQ needs maxRetriesPerRequest: null. family 0 also resolves IPv6, which Railway's private network uses.
export const redis = new Redis(config.REDIS_URL, {
  family: 0,
  maxRetriesPerRequest: null,
})

redis.on('error', err => log.error({ err }, 'redis: connection error'))
