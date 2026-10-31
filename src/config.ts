import { v } from '@demo-project/lib'
import { parseEnv } from '@demo-project/utils/env/parseEnv'

// Server-only configuration. Never import this from src/web.
// Secrets and service endpoints come from the environment; everything else is a constant.

const OptionalString = v.pipe(
  v.optional(v.string(), ''),
  v.transform(value => (value.trim() === '' ? null : value.trim())),
)

const Env = v.object({
  DATABASE_URL: v.string(),
  ELEVENLABS_AGENT_ID: OptionalString,
  ELEVENLABS_API_KEY: OptionalString,
  OPENROUTER_API_KEY: OptionalString,
  PORT: v.pipe(v.optional(v.string(), '3000'), v.toNumber(), v.integer()),
  REDIS_URL: v.string(),
})

export const config = {
  ...parseEnv(Env, process.env),
  // OpenRouter slug for Claude Sonnet 5.5, which supports structured outputs.
  BACKGROUND_MODEL: 'anthropic/claude-sonnet-5.5',
  // The Cloudflare Pages origin allowed to call /api in production.
  WEB_ORIGIN: 'https://demo-project.pages.dev',
}
