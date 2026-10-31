import { defineRailway, github, postgres, preserve, project, redis, service } from 'railway/iac'

// The API, the jobs worker and their backing services. The web app deploys separately, from Cloudflare Pages.
export default defineRailway(() => {
  const db = postgres('demo-project-postgres')
  const cache = redis('demo-project-redis')

  // Every push to main deploys, once GitHub CI has passed.
  const source = github('isaachinman/demo-project', { branch: 'main', checkSuites: true })

  const env = {
    DATABASE_URL: db.env.DATABASE_URL,
    OPENROUTER_API_KEY: preserve(),
    REDIS_URL: cache.env.REDIS_URL,
  }

  const server = service('demo-project-server', {
    deploy: {
      limitOverride: {
        containers: {
          cpu: 2,
          memoryBytes: 2_000_000_000,
        },
      },
    },
    env,
    healthcheck: '/health',
    preDeploy: 'node dist/app/scripts/init.js',
    source,
  })

  const worker = service('demo-project-worker', {
    // Time for in-flight jobs to finish after SIGTERM before the old deployment is killed.
    deploy: { drainingSeconds: 60 },
    env,
    source,
    start: 'node dist/app/worker/index.js',
  })

  return project('Demo Project', {
    resources: [db, cache, server, worker],
  })
})
