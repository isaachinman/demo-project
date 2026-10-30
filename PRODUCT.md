# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Isaac, starting a new demo. There are no end users yet; each demo built from this starter defines its own.

## Product Purpose

A reusable starter for spinning up demos quickly: a deployed API, background worker, AI calls and a web front end, already wired together. Success means a new demo starts from working infrastructure instead of setup.

## Operating Context

- API: Hono on Node, deployed to Railway with a `/health` readiness route covering Postgres and Redis.
- Worker: BullMQ on Redis, deployed to Railway as its own service.
- AI: Anthropic SDK with structured outputs validated by valibot.
- Database: Postgres via Drizzle, with an empty schema.
- Web: Vite, React and TanStack Router, deployed to Cloudflare Pages.

## Capabilities and Constraints

- The homepage is the only web route.
- Undecided: what each future demo is about, and who its audience is.

## Brand Commitments

- Visual reference, binding per Isaac: devl.dev (built on coss ui: Base UI and Tailwind). Homepage motion: devl's Blur Rise text reveal.
- Styling: Tailwind v4.
- Icons: UntitledUI. Never Inter.

## Evidence on Hand

- Favicon: `public/favicon.png`.
