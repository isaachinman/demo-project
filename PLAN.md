# PLAN: Voice companion that gets to know you

Simulated Linear tickets for SPEC.md, written to the `linear-ticket-definition` format. Prefix `DEMO`, team `DEMO` (simulated), assignee Isaac Hinman.

## Decisions

- **Voice loop: ElevenLabs Agents.** ElevenLabs owns the mic, WebRTC, speech-to-text, turn-taking, interruptions and text-to-speech. We do not build any audio plumbing.
- **LLM: OpenRouter, for both the live and the background model.**
  - The ElevenLabs agent uses OpenRouter as a "custom LLM", which must be an OpenAI-compatible Chat Completions endpoint that streams SSE.
  - Our own background calls (`callModel`) also move from the Anthropic SDK to OpenRouter.
- **Memory is ours, in Postgres.**
  - It is loaded once at call start and sent to ElevenLabs as per-conversation overrides of the system prompt and first message.
  - It is updated after the call from the ElevenLabs post-call webhook, by a BullMQ job.
  - Nothing memory-related runs on the live turn path.
- **Behaviour is driven by the system prompt.**
  - The agent's main goal is to **get to know the user**, and it must **never repeat itself**.
  - The prompt is fed data that makes "never repeat" checkable across calls: what it already knows, what it has already asked, and its previous openers.
- **Identity: three seeded users with a dropdown.** No auth. Users are Alex, Sam and Priya, and the agent is told the selected user's name.
- **UI: devl `assistant-start`, voice only.**
  - Kept: the sidebar shell, the greeting and the gooey orb.
  - Removed: the prompt box, tools, models, apps, suggestions and the chat thread.
  - No text input and no transcript on screen.
- **Agent persona name: Robin.** It is a single constant, so it is cheap to change.
- **Out of scope for this plan:**
  - Telephony.
  - Speaker recognition.
  - Updating memory mid-call (ElevenLabs `sendContextualUpdate` would allow it later).
  - Our own `/v1/chat/completions` proxy in front of OpenRouter.

## Architecture

```
Browser (Cloudflare Pages)                 API (Hono, Railway)                 ElevenLabs            OpenRouter
───────────────────────────                ───────────────────                 ──────────            ──────────
pick user in dropdown ──GET /api/users──▶  users table
tap orb ──POST /api/sessions {userId}──▶   load memory → buildAgentPrompt
                                           GET /v1/convai/conversation/token ─▶
         ◀── { conversationToken, prompt, firstMessage }
startSession({ conversationToken, userId, overrides }) ═══ WebRTC audio ═══▶  STT → turn-taking
                                                                              ── chat/completions (SSE) ─▶ live model
                                                                              ◀──────────────────────────
                                                     ◀═══ TTS audio ═══════
hang up ─────────────────────────────────────────────────────────────────▶  post-call webhook
                                           POST /api/webhooks/elevenlabs ◀── (HMAC signed)
                                           store conversation + turns
                                           addJob(extractMemories) ──▶ Worker (BullMQ)
                                                                        callModel (OpenRouter, structured output)
                                                                        → memories, follow-ups, summary, next opener
```

## How we get "fast, natural and engaging"

The system prompt drives the behaviour, but a prompt is a request, not a guarantee. Each quality therefore has a mechanism, a number, and a ticket that measures it.

| Quality | Mechanism | Measured by | Target |
|-|-|-|-|
| Fast | Small fast live model picked by bake-off; OpenRouter account-default provider sort `latency`; no reasoning; replies capped at about 40 words; prompt size bounded; memory work happens after the call | ElevenLabs per-turn `convai_llm_service_ttfb` and `convai_llm_service_ttf_sentence`, stored on every agent turn (DEMO-5, DEMO-9) | Time to first sentence: p50 ≤ 0.6s, p90 ≤ 1.0s |
| Natural | Spoken-style prompt rules (short, contractions, no lists or markdown, varied acknowledgements); ElevenLabs handles barge-in and turn-taking; low-latency TTS voice | Eval judge score; manual listening checklist (DEMO-10) | Naturalness averages ≥ 4/5 |
| Engaging / gets to know the user | Goal-first prompt; one open question per turn; follow-ups and a personal opener generated from the last call | Eval: correct new facts learned per call; follow-up threads picked up (DEMO-10) | ≥ 3 new correct facts per simulated call; the opener references the previous call |
| Never repeats | Prompt lists known facts, questions already asked and previous openers, and forbids reusing them; the extraction job records them | Eval: deterministic similarity check across every agent turn for a user, plus a judge check (DEMO-10) | Zero repeated questions or openers across 3 simulated calls |

## Ticket order

```
DEMO-1 OpenRouter callModel ─────────────────────────────┐
DEMO-2 Data model + users ─┬─ DEMO-3 Agent + sessions ─┬─ DEMO-4 Voice screen ─┬─ DEMO-8 Memory sidebar
                           │                           │                       │
                           └─ DEMO-5 Webhook ──────────┴─ DEMO-6 Extraction ◀──┘ (needs DEMO-1)
                                                            │
                                                     DEMO-7 System prompt (needs DEMO-6 data shapes)
                                                            │
                                         DEMO-9 Latency bake-off ── DEMO-10 Eval harness
```

DEMO-1 and DEMO-2 can run in parallel. DEMO-4 and DEMO-5 can run in parallel once DEMO-3 lands.

## Readiness gates

| Gate | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|-|-|-|-|-|-|-|-|-|-|-|
| Objective and product area | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Users and permissions | N/A | PASS | PASS | PASS | PASS | N/A | N/A | PASS | N/A | N/A |
| Current and desired behaviour | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Scope and split | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Repo evidence | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| UX | N/A | N/A | N/A | PASS | N/A | N/A | N/A | PASS | N/A | N/A |
| Data and backend | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Acceptance and tests | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Rollout | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Linear metadata | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| User approval | Pending review of this plan | | | | | | | | | |
| Open questions | None | None | None | None | None | None | None | None | None | None |

Shared rollout for every ticket: there is no feature flag. The branch merges to `main`. Railway deploys the API and worker after CI, and Cloudflare Pages deploys the web app. Rollback means reverting the merge commit, and Isaac validates.

---

# DEMO-1 [AI] Route callModel through OpenRouter

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Swap the Anthropic SDK in `callModel` for OpenRouter's official TypeScript SDK. Structured output and valibot validation keep working unchanged for callers.

## Problem
All model access goes through OpenRouter, but `src/ai/client.ts` calls Anthropic directly and `config` expects `ANTHROPIC_API_KEY`.

## Goal
`callModel({ schema, system, prompt, model? })` calls OpenRouter Chat Completions with `response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } }`. It returns the same `ModelResult`.

## Non-goals

- Streaming from `callModel`. Only the background job uses it.
- The live conversation model, which ElevenLabs calls (DEMO-3).

## Users / permissions

- Primary users: none (server-only).
- Required permissions: none.
- Read-only roles: none.
- Write-capable roles: none.
- Audit/security considerations: `OPENROUTER_API_KEY` stays server-side. `src/config.ts` must never be imported from `src/web`.

## Current state
`callModel` uses `@anthropic-ai/sdk` with `output_config.format`. The model is the constant `claude-sonnet-5-5`.

## Relevant repo findings

- `src/ai/client.ts`: `anthropic` client, `callModel`, and `jsonSchemaFor`, which rewrites oneOf to anyOf and drops `$schema`.
- `src/config.ts`: `Env` with `ANTHROPIC_API_KEY`; `ANTHROPIC_MODEL` constant.
- `src/types/Ai.ts`: `ModelRequest` and `ModelResult`.
- `.railway/railway.ts`: `ANTHROPIC_API_KEY: preserve()` in the shared `env`.
- `.env.example`: lists `ANTHROPIC_API_KEY`.
- `encephalon/decision/f9d9b327-…json`: records the structured-output decision. Update it.

## Scope

### In scope

- Add `@openrouter/sdk`, pinned exactly and at least 14 days old per `bunfig.toml`. Remove `@anthropic-ai/sdk`.
- Env: `OPENROUTER_API_KEY` replaces `ANTHROPIC_API_KEY` in `config.ts`, `.env.example` and `.railway/railway.ts` (`preserve()`).
- Constant `BACKGROUND_MODEL` in `config.ts`: OpenRouter's slug for Claude Sonnet 5.5, confirmed on openrouter.ai/models with the `structured_outputs` filter.
- Optional `model` field on `ModelRequest`, defaulting to `BACKGROUND_MODEL`.
- Keep `jsonSchemaFor`. Pass its output as `json_schema.schema` with `strict: true`.
- Map the finish reason: anything other than `stop` returns `ok: false` with the reason.

### Out of scope

- Retry policy changes. Keep a single SDK retry and the 120s timeout via `toMS`.

## Functional requirements
- On success, `callModel` returns `{ ok: true, output, model, usage }` validated by valibot.
- If parsing or validation fails, or the finish reason is not `stop`, it returns `{ ok: false, reason, text, model, usage }`.

## UX requirements
- N/A

## Data requirements

- Tables/entities: none
- Reads: none
- Writes: none
- Validation: valibot `safeParse` on the model output (unchanged).
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `callModel` signature.
- New endpoints/actions required: none.
- Side effects: OpenRouter request.
- Error handling: SDK errors throw (unchanged); bad outputs return `ok: false`.
- Idempotency/concurrency: N/A

## Edge cases
- The model returns JSON wrapped in prose, so `JSON.parse` throws. Catch it and return `ok: false` with the reason `output was not JSON`.

## Acceptance criteria

- Given a valid key, when `callModel` runs with a valibot object schema, then it returns `ok: true` with typed output.
- Given a schema the model cannot satisfy, when the reply fails validation, then it returns `ok: false` and logs nothing secret.
- Given the repo, when `bun run typecheck && bun run lint && bun run test` runs, then all pass and `@anthropic-ai/sdk` is gone from `package.json` and `bun.lock`.

## Test plan

- Unit: none new. `jsonSchemaFor` behaviour is unchanged.
- Integration: one manual call from a scratch script against OpenRouter.
- E2E/manual: N/A
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: set `OPENROUTER_API_KEY` in Railway, then merge.
- Legacy deprecation: remove `ANTHROPIC_API_KEY` from Railway after deploy.
- Rollback: revert.

## Dependencies

- None

## Open questions
None

---

# DEMO-2 [Data] Conversation and memory schema with three seeded users

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Add the Drizzle tables for users, conversations, turns, memories and follow-ups. Seed Alex, Sam and Priya idempotently, and expose `GET /api/users` so the web app can list them.

## Problem
The schema is empty, and the web app has no way to call the API under `/api` in dev or production.

## Goal
One migration creates every table. `init` seeds the three users on every deploy without creating duplicates. The web app can fetch `/api/users` locally (Vite proxy) and in production (API origin plus CORS).

## Non-goals

- Creating users from the UI.
- Auth.
- Deleting or resetting memory. Wiping the DB is acceptable for this demo.

## Users / permissions

- Primary users: demo viewers.
- Required permissions: none. Anyone with the URL can act as any of the three users.
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: personal conversation data is stored unauthenticated. This is acceptable for a demo; say so in the README section of the PR.

## Current state
`src/db/schema.ts` exports nothing. `init` only runs migrations. Vite proxies only `/health`.

## Relevant repo findings

- `src/db/schema.ts`: "Tables go here; `bun run db:generate` writes the migration."
- `src/db/client.ts`: Drizzle with `casing: 'snake_case'`.
- `src/scripts/init.ts`: idempotent migrate, run as Railway `preDeploy`.
- `vite.config.ts`: `server.proxy` has only `/health`.
- `src/server/app.ts`: Hono app where routes are registered.

## Scope

### In scope

- `users`: `id uuid pk`, `name text not null unique`, `nextOpener text null`, `createdAt timestamptz default now()`.
- `conversations`:
  - `id text pk` (the ElevenLabs `conversation_id`).
  - `userId uuid fk not null`.
  - `startedAt timestamptz not null`, `durationSecs integer not null`.
  - `summary text null`, `opener text null` (the first message actually used), `extractedAt timestamptz null`.
  - Index on `(userId, startedAt desc)`.
- `turns`:
  - `id uuid pk`, `conversationId text fk not null`, `index integer not null`.
  - `role` pgEnum (`user`, `agent`), `message text not null`, `timeInCallSecs integer not null`.
  - `llmTtfbMs integer null`, `llmTtfSentenceMs integer null`.
  - Unique `(conversationId, index)`.
- `memories`:
  - `id uuid pk`, `userId uuid fk not null`.
  - `category` pgEnum (`background`, `people`, `work`, `interests`, `plans`, `preferences`, `feelings`), `fact text not null`.
  - `sourceConversationId text fk not null`, `createdAt`, `supersededAt timestamptz null`.
  - Index on `(userId)` where `supersededAt is null`.
- `followUps`:
  - `id uuid pk`, `userId uuid fk not null`, `question text not null`, `why text not null`.
  - `sourceConversationId text fk not null`, `createdAt`, `resolvedAt timestamptz null`.
- Seed: three fixed UUIDs (Alex, Sam, Priya) as constants, inserted by `init` with `onConflictDoNothing`.
- `GET /api/users` returns `[{ id, name }]` ordered by name.
- Vite proxy gains `/api`.
- Production: the web app reads `VITE_API_ORIGIN` (empty in dev), and Hono `cors()` on `/api/*` allows the Cloudflare Pages origin (constant in `config.ts`).
- Record the schema shape in Encephalon.

### Out of scope

- Memory read endpoints (DEMO-8).

## Functional requirements
- `init`, run twice, leaves exactly three users.
- `GET /api/users` responds in under 50ms locally.

## UX requirements
- N/A

## Data requirements

- Tables/entities: as listed above.
- Reads: users.
- Writes: user seed.
- Validation: DB constraints (FKs, unique, enums, not null).
- Migrations/backfills: one generated migration; no backfill.
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `app` in `src/server/app.ts`.
- New endpoints/actions required: `GET /api/users`.
- Side effects: none
- Error handling: DB failure returns 500, logged with `{ err }`.
- Idempotency/concurrency: the seed uses `onConflictDoNothing`.

## Edge cases
- A Railway preDeploy rerun must not duplicate users. Covered by fixed ids and the conflict clause.

## Acceptance criteria

- Given a fresh DB, when `init` runs, then all five tables exist and three users are present.
- Given the dev stack, when the browser fetches `/api/users`, then it receives Alex, Priya and Sam.
- Given production, when the Pages app fetches `${VITE_API_ORIGIN}/api/users`, then CORS allows it.

## Test plan

- Unit: none (DB constraints and types cover it).
- Integration: run `init` twice locally and count users.
- E2E/manual: fetch from the deployed Pages app.
- Permission tests: N/A
- Migration/backfill validation: `bun run db:generate` produces one migration; review the SQL before merge.

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: set `VITE_API_ORIGIN` in Cloudflare Pages, then merge.
- Legacy deprecation: N/A
- Rollback: revert and drop the tables (pre-release, so wiping is acceptable).

## Dependencies

- Explicit approval of the schema change before applying the migration (per CLAUDE.md).

## Open questions
None

---

# DEMO-3 [Voice] ElevenLabs agent and session endpoint

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Configure ElevenLabs agents that use OpenRouter as their LLM. Add `POST /api/sessions`, which returns a WebRTC conversation token plus the per-user system prompt and first message.

## Problem
Nothing connects a browser to a voice agent, and nothing gives the agent per-user context.

## Goal
Posting a seeded user's id returns everything the browser needs to start an authenticated voice conversation, already personalised with a persona-only prompt. DEMO-7 adds memory.

## Non-goals

- Memory content in the prompt (DEMO-7).
- UI (DEMO-4).
- A self-hosted LLM proxy. If the spike fails, that becomes a new ticket.

## Users / permissions

- Primary users: demo viewers.
- Required permissions: none.
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations:
  - `ELEVENLABS_API_KEY` stays server-side. Agents are set to require authentication, so they only start with a token from our API.
  - The prompt override is visible in the browser, which is acceptable for a demo.

## Current state
`ELEVENLABS_API_KEY` and `OPENROUTER_API_KEY` exist in local `.env` only. No ElevenLabs agent or SDK.

## Relevant repo findings

- `src/config.ts`: add `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` to `Env`; persona constants go here.
- `src/server/app.ts`: route registration.
- `.railway/railway.ts`: shared `env` for server and worker; add `preserve()` entries.
- `src/lib/valibot.ts`: `v` for request body validation.

## Scope

### In scope

- **Agents as code with the ElevenLabs CLI** (`brew install elevenlabs/tap/elevenlabs`; it reads `ELEVENLABS_API_KEY` from `.env`). Commit the files in an `elevenlabs/` directory, and record the workflow in Encephalon:
  1. `elevenlabs agents init` creates `agents.json` and `agent_configs/`.
  2. `elevenlabs agents add "robin-dev"` and `elevenlabs agents add "robin-prod"`.
  3. Edit both configs.
  4. `elevenlabs agents push --dry-run`, then `elevenlabs agents push`, creates the agents on ElevenLabs. Take the agent IDs from the push output or `elevenlabs agents status`.
  5. Later changes are edits to the configs followed by `push`. Dashboard edits are pulled back with `elevenlabs agents pull --update`.
- **One-time workspace secret:** create `OPENROUTER_API_KEY` as an ElevenLabs workspace secret, via the dashboard or the secrets API. Agent configs reference it by `secret_id`, so no key is committed.
- **Agent config** (both agents identical except the post-call webhook, DEMO-5):
  - `conversation_config.agent.prompt`:
    - `custom_llm`: `{ url: 'https://openrouter.ai/api/v1', model_id: <candidate slug>, api_key: { secret_id: <OPENROUTER_API_KEY secret id> }, api_type: 'chat_completions' }`;
    - `max_tokens: 150`, `temperature: 0.8`;
    - system tool `end_call` enabled;
    - placeholder prompt (always overridden per session).
  - `platform_settings.overrides.conversation_config_override.agent`: `{ first_message: true, prompt: { prompt: true } }`, and nothing else overridable.
  - Authentication required, so sessions only start with a token from our API.
  - `conversation_config.tts`: lowest-latency model; voice tuned in DEMO-9.
- **Spike first:** push `robin-dev`, then run "Test AI Agent" in the dashboard. Continue only if OpenRouter replies stream back.
- `ELEVENLABS_AGENT_ID` env var: dev agent ID in `.env`, prod agent ID on Railway.
- `POST /api/sessions` with body `{ userId }`, validated with valibot:
  1. Load the user (404 if unknown).
  2. Build `{ prompt, firstMessage }` with `buildAgentPrompt` (persona-only version here, filled in DEMO-7).
  3. Call ElevenLabs `GET /v1/convai/conversation/token?agent_id=…` with `xi-api-key`.
  4. Respond `{ conversationToken, prompt, firstMessage }`.
- Use `@elevenlabs/elevenlabs-js` for the token call if it exposes it; otherwise `fetch`. Pin exactly.
- First-meeting opener when the user has no `nextOpener`: `Hey {name}, I'm Robin. I don't think we've properly met yet. How's your day going?`

### Out of scope

- Voice selection tuning (DEMO-9).

## Functional requirements
- The token endpoint responds in under 500ms p90 (one ElevenLabs round trip plus one DB read).

## UX requirements
- N/A

## Data requirements

- Tables/entities: `users`
- Reads: user by id (memory reads are added in DEMO-7).
- Writes: none
- Validation: `userId` is a UUID.
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: none
- New endpoints/actions required: `POST /api/sessions`
- Side effects: an ElevenLabs token is minted.
- Error handling:
  - ElevenLabs non-2xx: log the status and return 502 with `{ error: 'voice_unavailable' }`.
  - Unknown user: 404.
- Idempotency/concurrency: each call mints a fresh token. That is harmless.

## Edge cases
- Agent misconfigured (overrides disabled): ElevenLabs rejects the override at session start. DEMO-4 surfaces this as a connection error, and the Encephalon settings list prevents it.

## Acceptance criteria

- Given `elevenlabs/agents.json` and both agent configs committed, when `elevenlabs agents push --dry-run` runs, then it reports no changes against the live agents.
- Given the dev agent, when the dashboard test call runs, then OpenRouter-backed replies are heard.
- Given Alex's id, when `POST /api/sessions` is called, then the response holds a token, a prompt containing "Alex", and the first-meeting opener.
- Given a random UUID, when it is posted, then the response is 404.

## Test plan

- Unit: none (prompt tests live in DEMO-7).
- Integration: curl the endpoint locally.
- E2E/manual: covered by DEMO-4.
- Permission tests: confirm that starting with only `agentId` (no token) is refused by ElevenLabs.
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: `elevenlabs agents push`, set `ELEVENLABS_API_KEY` and the prod `ELEVENLABS_AGENT_ID` in Railway, then merge.
- Legacy deprecation: N/A
- Rollback: revert.

## Dependencies

- DEMO-2

## Open questions
None

---

# DEMO-4 [Web] Voice-only home screen from devl Assistant Start

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Port devl's `assistant-start` screen into a voice-only home page. It keeps the sidebar, the time-aware greeting and the gooey orb. The orb is the call button and reacts to live audio. A user dropdown switches between Alex, Sam and Priya.

## Problem
The homepage is a placeholder card, and there is no way to start a voice conversation.

## Goal
Pick a user, tap the orb, talk, tap to hang up. The screen never shows a text input or transcript.

## Non-goals

- Chat, text input or captions.
- Sidebar memory content (DEMO-8). Leave the slots empty.
- Keyboard shortcuts.

## Users / permissions

- Primary users: demo viewers on desktop and mobile browsers.
- Required permissions: browser microphone.
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: none

## Current state
`HomePage` renders a `BlurRise` title card. No coss ui components are installed.

## Relevant repo findings

- `src/web/components/home/HomePage.tsx`: replace its content.
- `src/web/components/text/BlurRise.tsx`: reuse for the greeting.
- `src/web/styles.css`: Tailwind v4 theme tokens to map devl colours onto.
- `DESIGN.md`, `.impeccable/design.json`: binding visual system.
- `CLAUDE.md`: UI work routes through the `impeccable` skill. Port devl components rather than inventing them.

## Scope

### In scope

- **Source:** `https://devl.dev/r/assistant-start.json` (MIT). Port only what's used:
  - the layout shell, `SidebarBody` (nav trimmed to the brand), the header with the mobile sidebar toggle, the greeting, and `GooOrb` with `OrbFilter`;
  - coss ui `avatar`, `button`, `menu` and `tooltip` from their registry JSON.
- **Delete from the port:** `PromptBox`, `SendButton`, `AppPill`, `FadeScroller`, suggestions, tools, models, placeholders, `buildReply`, chat state and the "New chat" action.
- **Repo conventions:**
  - UntitledUI icons instead of `lucide-react`;
  - `type` not `interface`; arrow functions; one component per file;
  - Zustand store (`call.store.ts` plus `call.actions.ts`) for selected user and call status instead of a `useState` cluster;
  - Tailwind tokens, no inline style values except the orb's dynamic transform;
  - motion values for the orb; dependencies pinned exactly.
- **User switcher:** the sidebar account footer becomes a coss `menu` listing the three users (avatar initials plus name). The selection persists in `localStorage` and is disabled during a call.
- **Greeting:** `Good morning/afternoon/evening, {name}` via `BlurRise`, re-run on user change.
- **Call flow** (`@elevenlabs/react`, pinned):
  1. Tap the orb or the "Start talking" button.
  2. `POST /api/sessions`.
  3. `startSession({ conversationToken, userId, overrides: { agent: { prompt: { prompt }, firstMessage } } })`.
  4. Tap again or the "End" button to end the session.
- **Orb states:**
  - idle: slow drift, as in devl;
  - connecting: the `busy` animation;
  - listening: scale follows `getInputVolume()`;
  - speaking: scale follows `getOutputVolume()`, sampled in `requestAnimationFrame` into motion values so React does not re-render each frame.
- **Status line under the orb:** "Tap to talk", "Connecting…", "Listening", "Robin is speaking". A mute toggle shows during a call.
- **Error states:** mic permission denied ("Robin needs your microphone"), session endpoint failure, and an ElevenLabs disconnect. Each shows a retry.
- Run `/impeccable document` afterwards to update DESIGN.md.

### Out of scope

- Sidebar "Recent" and "What Robin knows" content (DEMO-8).

## Functional requirements
- Tapping the orb until the first agent audio plays takes at most 2s on a warm connection, including the session endpoint.
- Switching users while idle changes the greeting and the next session's user. Switching is not possible mid-call.

## UX requirements

- Closest precedent: devl `assistant-start` (full-screen preview at devl.dev/preview/assistant-start).
- States: idle, connecting, listening, speaking, muted, error (mic denied, session failed, disconnected).
- Responsive: the sidebar collapses behind the header toggle under the `md` breakpoint, as devl does. The orb is centred and at least 160px on mobile.
- No text input or transcript anywhere.

## Data requirements

- Tables/entities: none directly.
- Reads: `GET /api/users`, `POST /api/sessions`.
- Writes: none
- Validation: response shapes parsed with valibot.
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `GET /api/users` (DEMO-2), `POST /api/sessions` (DEMO-3).
- New endpoints/actions required: none
- Side effects: an ElevenLabs conversation starts.
- Error handling: as in the error states above.
- Idempotency/concurrency: double taps while connecting are ignored (status guard in the store action).

## Edge cases
- Tab hidden mid-call: the call continues.
- User closes the tab mid-call: ElevenLabs ends the conversation and the webhook still fires.
- Saved user id in `localStorage` no longer exists: fall back to the first user.

## Acceptance criteria

- Given the page loads, when no user was saved, then Alex is selected and the greeting reads "Good {time}, Alex".
- Given idle, when the orb is tapped and the mic is allowed, then status goes connecting → speaking and Robin's first message plays.
- Given a call in progress, when the user speaks, then the orb visibly reacts to their voice; when Robin speaks, it reacts to Robin's audio.
- Given a call in progress, when the user menu is opened, then switching is disabled.
- Given the mic is denied, when the orb is tapped, then the mic error state shows with a retry.
- Given any state, then no text input or transcript is rendered.

## Test plan

- Unit: none (UI).
- Integration: none
- E2E/manual: desktop Chrome and iOS Safari, covering every state above; screenshot each for the PR.
- Permission tests: deny and then allow the mic.
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge; Pages deploys.
- Legacy deprecation: remove the placeholder `HomePage` copy.
- Rollback: revert.

## Dependencies

- DEMO-3

## Open questions
None

---

# DEMO-5 [Voice] Store calls from the ElevenLabs post-call webhook

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Receive ElevenLabs `post_call_transcription` webhooks and verify their HMAC signature. Store the conversation and its turns, including per-turn LLM latency metrics, and queue memory extraction.

## Problem
Transcripts live only in ElevenLabs, so memory cannot be built.

## Goal
Every finished call appears in `conversations` and `turns` within seconds of hang-up, and exactly one `extractMemories` job is queued.

## Non-goals

- Audio storage (`post_call_audio`).
- Using ElevenLabs' own `transcript_summary`. DEMO-6 writes ours.

## Users / permissions

- Primary users: ElevenLabs (machine caller).
- Required permissions: a valid `ElevenLabs-Signature` HMAC.
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: reject unsigned or invalid requests with 401. `ELEVENLABS_WEBHOOK_SECRET` stays server-side.

## Current state
No webhook route, no `extractMemories` job type.

## Relevant repo findings

- `src/server/app.ts`: route registration; the pino-http middleware already logs requests.
- `src/worker/queue.ts`: `addJob` with retries and backoff.
- `src/types/Jobs.ts`: `JobPayloads` map; add `extractMemories: { conversationId: string }`.
- `src/worker/handlers/index.ts`: handler registry (the handler lands in DEMO-6; register a stub here).

## Scope

### In scope

- `POST /api/webhooks/elevenlabs`:
  1. Read the raw body and verify it with `@elevenlabs/elevenlabs-js` `constructEvent(rawBody, signature, secret)`.
  2. Ignore types other than `post_call_transcription` (200).
  3. Validate the fields used with valibot: `conversation_id`, `user_id`, `metadata.start_time_unix_secs`, `metadata.call_duration_secs`, and `transcript[]` with `role`, `message`, `time_in_call_secs`, `conversation_turn_metrics.convai_llm_service_ttfb.elapsed_time` and `…ttf_sentence.elapsed_time`.
  4. Store the first agent message as `conversations.opener`.
  5. In one transaction, upsert the conversation and insert turns with `onConflictDoNothing` on `(conversationId, index)`.
  6. Call `addJob({ jobType: 'extractMemories', conversationId }, { jobId: conversationId })`.
  7. Respond 200.
- `ELEVENLABS_WEBHOOK_SECRET` env (dev and prod values differ, one per agent).
- **Webhook URLs:** set on each agent as a per-agent webhook override.
  - prod: the Railway server URL;
  - dev: a `cloudflared tunnel --url http://localhost:3000` URL. Document this in Encephalon `dev.local`.

### Out of scope

- Replaying missed webhooks.

## Functional requirements
- The webhook responds 200 within 1s.
- Turns with a null `message` (tool-only turns) are skipped.

## UX requirements
- N/A

## Data requirements

- Tables/entities: `conversations`, `turns`
- Reads: user by `user_id`
- Writes: conversation upsert, turn inserts
- Validation: signature, valibot payload, known `user_id`
- Migrations/backfills: none
- Audit events: log `{ conversationId, userId, turns }` at info.

## API / backend requirements

- Existing endpoints/actions to reuse: `addJob`
- New endpoints/actions required: `POST /api/webhooks/elevenlabs`
- Side effects: a BullMQ job is queued.
- Error handling:
  - bad signature → 401;
  - payload invalid or unknown `user_id` → log a warning and return 200 so ElevenLabs does not retry forever;
  - DB failure → 500 so ElevenLabs retries.
- Idempotency/concurrency: the conversation id is the primary key, turn inserts ignore conflicts, and the job id is the conversation id. Redelivery is a no-op.

## Edge cases
- A call with no user speech still stores the conversation. DEMO-6 skips extraction.
- The same webhook delivered twice queues one job and duplicates no turns.

## Acceptance criteria

- Given a real call via the dev agent, when it ends, then one conversation row and N turn rows exist with latency populated on agent turns.
- Given a tampered body, when posted, then the response is 401 and nothing is written.
- Given the same valid payload posted twice, then row counts are unchanged and one job exists.

## Test plan

- Unit: none (the SDK verifies signatures).
- Integration: post a captured, re-signed payload twice locally and check the counts.
- E2E/manual: a real call through the tunnel.
- Permission tests: unsigned request → 401.
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: set the prod webhook URL and secret on `robin-prod` and in Railway, then merge.
- Legacy deprecation: N/A
- Rollback: revert; remove the webhook URL from the agent.

## Dependencies

- DEMO-2, DEMO-3

## Open questions
None

---

# DEMO-6 [Memory] Extract memories, follow-ups and the next opener after each call

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
A worker job reads a finished conversation and the user's current memory. It asks the background model (via `callModel`) what was learned, what is now outdated, what to follow up on, and how to open the next call, then saves all of it in one transaction.

## Problem
Stored transcripts are not usable memory, and the agent cannot follow up on anything without distilled facts and open threads.

## Goal
After each call the user has an accurate, deduplicated fact list, up to three open follow-ups, a conversation summary and a specific `nextOpener` that differs from all previous openers.

## Non-goals

- Embeddings or vector search. The memory fits in the prompt.
- Memory edits from the UI.

## Users / permissions

- Primary users: none (worker).
- Required permissions: none
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: none

## Current state
The `extractMemories` stub is registered (DEMO-5). `callModel` is on OpenRouter (DEMO-1).

## Relevant repo findings

- `src/ai/client.ts`: `callModel` with valibot schema in, typed output out.
- `src/worker/handlers/index.ts`: handler registry.
- `src/worker/queue.ts`: 5 attempts with exponential backoff, so failures retry automatically.
- `src/db/schema.ts`: tables from DEMO-2.

## Scope

### In scope

- **Split** into a pure core `extractMemories(input) → ExtractionResult` (callModel only, no DB; reused by the DEMO-10 eval) and `applyExtraction(conversationId, result)` (DB writes). Both live in `src/memory/`.
- **Handler steps:**
  1. Load the conversation; skip if `extractedAt` is set.
  2. If the conversation has fewer than 2 user turns, set `extractedAt` and stop.
  3. Load the user's active memories (with ids), open follow-ups (with ids), the last 5 openers and the transcript.
  4. Call the core, then apply.
- **Output schema (valibot):**
  - `summary`: 2–3 sentences, third person.
  - `newMemories[]`: `{ category, fact }`. One atomic fact each, specific (names, dates, places), and not already known.
  - `supersededMemoryIds[]`: existing facts contradicted or out of date.
  - `resolvedFollowUpIds[]`: follow-ups asked or answered in this call.
  - `followUps[]`, at most 3: `{ question, why }`. Open threads worth returning to: future events ("How did the interview go?"), half-told stories, people mentioned. Never a question whose answer is already known.
  - `opener`: one or two spoken sentences for the next call. It must reference something specific from the user's life and must not resemble any previous opener.
- **Apply step:**
  - Filter returned ids to ids belonging to this user.
  - In one transaction: insert memories, set `supersededAt`, set `resolvedAt`, insert follow-ups, set `conversations.summary` and `extractedAt`, set `users.nextOpener`.
- **Extraction system prompt:** must be precise ("only facts the user stated or clearly implied; never infer sensitive traits"). Kept in `src/memory/extractionPrompt.ts`.

### Out of scope

- Re-extracting old conversations.

## Functional requirements
- The job completes in under 30s for a 10-minute call.
- `callModel` returning `ok: false` throws, so BullMQ retries; after 5 attempts the job stays failed and is logged.

## UX requirements
- N/A

## Data requirements

- Tables/entities: `memories`, `followUps`, `conversations`, `users`, `turns`
- Reads: active memories, open follow-ups, last 5 `conversations.opener`, turns
- Writes: as in the apply step
- Validation: valibot output; id ownership filter
- Migrations/backfills: none
- Audit events: log `{ conversationId, added, superseded, followUps }`

## API / backend requirements

- Existing endpoints/actions to reuse: `callModel`, `addJob`
- New endpoints/actions required: none
- Side effects: OpenRouter call
- Error handling: throw on `ok: false` or a DB error; retries come from queue defaults.
- Idempotency/concurrency: the `extractedAt` guard plus a single transaction. The job id is the conversation id.

## Edge cases
- The user corrects a fact ("I'm actually moving to Leeds, not Bristol"): the old memory is superseded and a new one added.
- The model returns an id from another user: it is filtered out.
- Two calls end close together for the same user: jobs run sequentially per user by ordering on `startedAt`. Acceptable as-is at concurrency 5 for a demo; note it in Encephalon.

## Acceptance criteria

- Given a call where Alex says they have a job interview on Friday, when the job runs, then a `work` or `plans` memory mentions the interview and a follow-up asks how it went.
- Given that follow-up, when the next call covers it, then it is resolved.
- Given a previous opener, when a new opener is generated, then it is not the same sentence.
- Given a 1-turn call, when the job runs, then no memories are written and `extractedAt` is set.

## Test plan

- Unit: one test for `applyExtraction`'s id-ownership filter (pure function on ids).
- Integration: run the handler against a stored real conversation locally and inspect the rows.
- E2E/manual: two calls in a row as Sam; the second opener references the first.
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge; the worker deploys.
- Legacy deprecation: N/A
- Rollback: revert; jobs fail and retry until fixed.

## Dependencies

- DEMO-1, DEMO-5

## Open questions
None

---

# DEMO-7 [Agent] System prompt: get to know the user, never repeat

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Write `buildAgentPrompt`, which turns the persona, the goal and the user's memory into the system prompt and first message sent as ElevenLabs overrides. Behaviour is driven by this prompt.

## Problem
The DEMO-3 prompt is persona-only, so the agent neither remembers nor steers toward getting to know the user.

## Goal
Every session starts with a prompt that:
- makes **getting to know the user** the agent's main goal;
- gives it what it knows and what is still open;
- lists what it must not repeat.

## Non-goals

- Mid-call memory updates.
- Multiple personas.

## Users / permissions

- Primary users: none (server).
- Required permissions: none
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: none

## Current state
`buildAgentPrompt` returns the persona and the first-meeting opener only.

## Relevant repo findings

- `src/config.ts`: persona name constant (`AGENT_NAME = 'Robin'`).
- `src/db/schema.ts`: `memories`, `followUps`, `conversations` (summary, opener).
- `src/utils/data/toMS`: example of the `src/utils/<category>/<name>/` layout to follow (`src/utils/agent/buildAgentPrompt/`).
- `src/server/app.ts`: `POST /api/sessions` (DEMO-3) calls it.

## Scope

### In scope

- `loadAgentContext(userId)` (DB) feeds the pure `buildAgentPrompt(context) → { prompt, firstMessage }`.
- **Context, bounded to keep the prompt small and fast:**
  - the user's name;
  - active memories grouped by category, newest 60;
  - the last 3 conversation summaries with relative dates ("two days ago");
  - up to 3 open follow-ups;
  - the last 5 openers;
  - questions already answered, which are the memories themselves.
- **Prompt sections, in order:**
  1. **Who you are:** Robin, warm, curious, a bit playful. A new friend on a voice call, not an assistant. It doesn't offer help, tasks or information unless asked.
  2. **Your goal: get to know {name}.** Who they are, the people in their life, what they do, what they care about, and what's coming up for them. Every call should leave you knowing something new and specific. Go deeper on what they light up about rather than hopping topics, and don't run through a checklist.
  3. **How you talk:**
     - React to the specifics of what they just said before asking anything.
     - At most one question per turn, and an open one.
     - Share a small opinion or reaction now and then so it isn't an interview.
     - Match their energy and length.
     - 1–3 short sentences, about 40 words at most.
     - Spoken English with contractions.
     - No lists, markdown, emoji or stage directions.
     - Say numbers as they're spoken.
     - Never claim to be human. If asked, say you're an AI, lightly.
  4. **Never repeat yourself:**
     - Never ask anything you already know (see "What you know") or anything already asked this call.
     - Never reuse an opener, question or turn of phrase from earlier in this call or from the "Previous openers" list.
     - Don't parrot their words back.
     - Vary acknowledgements; don't start consecutive turns the same way.
  5. **What you know about {name}:** facts by category. Use them naturally, at most one callback every few turns, and never recite them. If they correct you, accept it and move on.
  6. **Recent conversations:** the summaries.
  7. **Threads to pick up:** follow-ups. Bring up the most relevant one early; others only if natural.
  8. **Previous openers (do not reuse).**
  9. **Ending:** when they want to go, close warmly with something specific to look forward to, then use `end_call`.
- **First call** (no memories): section 5 says "You've just met"; the goal leans toward introductions without sounding like a form.
- **First message:** `users.nextOpener`, or the first-meeting opener if there are no conversations. Returning users always get a specific opener from DEMO-6.
- Store the prompt template in one file (`src/utils/agent/buildAgentPrompt/buildAgentPrompt.ts`) so DEMO-10 iterates on a single place.

### Out of scope

- Tuning wording against evals (DEMO-10 feeds back into this file).

## Functional requirements
- The prompt is at most about 2,500 tokens for a user with 60 memories, keeping time to first token low.
- Superseded memories and resolved follow-ups never appear.

## UX requirements
- N/A

## Data requirements

- Tables/entities: `users`, `memories`, `followUps`, `conversations`
- Reads: as in the context list above
- Writes: none
- Validation: none
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `POST /api/sessions`
- New endpoints/actions required: none
- Side effects: none
- Error handling: a DB failure returns 500 from the sessions endpoint.
- Idempotency/concurrency: N/A (read-only)

## Edge cases
- A user with conversations but no `nextOpener` (all calls under 2 user turns): use a generic returning opener, "Hey {name}, good to hear from you again. What's been going on?"
- Very long memory lists: cap at the newest 60, so recent facts win.

## Acceptance criteria

- Given a fresh user, when a session starts, then the prompt contains the goal and the "You've just met" variant, and the first message is the first-meeting opener.
- Given Alex with memories and an open follow-up, when a session starts, then the prompt lists the memories by category and the follow-up, and the first message is `nextOpener`.
- Given a superseded memory, then it is absent from the prompt.

## Test plan

- Unit: one `buildAgentPrompt.test.ts` covering superseded/resolved exclusion, the caps, and first-call versus returning selection.
- Integration: none
- E2E/manual: three calls as Priya; the second and third open with a callback and Robin doesn't re-ask known things.
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge.
- Legacy deprecation: N/A
- Rollback: revert.

## Dependencies

- DEMO-3, DEMO-6

## Open questions
None

---

# DEMO-8 [Web] Show past conversations and what Robin knows in the sidebar

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Fill the ported devl sidebar with the selected user's past conversations and the facts Robin has learned (read-only). Memory visibly grows after each call.

## Problem
Memory is invisible, so a demo viewer cannot see that Robin remembers.

## Goal
The sidebar shows:
- **Recent:** one line per past conversation with a relative time;
- **What Robin knows:** facts grouped by category;
- **Open threads:** pending follow-ups.

The sidebar refreshes when extraction finishes after a call.

## Non-goals

- Editing or deleting memories.
- Opening a past conversation's transcript.

## Users / permissions

- Primary users: demo viewers.
- Required permissions: none
- Read-only roles: everyone
- Write-capable roles: none
- Audit/security considerations: memory is readable unauthenticated, as accepted in DEMO-2.

## Current state
DEMO-4 leaves the sidebar's "Recent" and "Projects" slots empty.

## Relevant repo findings

- `src/web/components/home/`: ported sidebar components from DEMO-4.
- `src/server/app.ts`: add the read endpoint.
- `src/db/schema.ts`: `memories`, `followUps`, `conversations`.
- `DESIGN.md`: list and badge styling rules.

## Scope

### In scope

- `GET /api/users/:id/memory` returns:
  - `{ conversations: [{ id, startedAt, summary }] }`, newest 20;
  - `memories: [{ id, category, fact }]`, active only;
  - `followUps: [{ id, question }]`, open only;
  - `pending: boolean`: whether the latest conversation has no `extractedAt`.
- **Sidebar sections** (devl list styling):
  - **Recent:** the first sentence of the summary plus a relative time.
  - **What Robin knows:** category headings with facts, and a count badge (coss `badge`).
  - **Open threads.**
- After a call ends, poll every 3s while `pending` is true, up to 60s, and show "Updating memory…" in the meantime.
- New facts animate in (devl motion values, 200ms ease-out). Through `impeccable`.

### Out of scope

- Search or filtering.

## Functional requirements
- Switching users swaps the sidebar content without a page reload.

## UX requirements

- Closest precedent: devl `SidebarBody` "Recent" list.
- States: loading (skeleton rows), empty ("Robin hasn't met {name} yet"), updating, populated.
- Responsive: the sidebar is a drawer on mobile, from DEMO-4.

## Data requirements

- Tables/entities: `conversations`, `memories`, `followUps`
- Reads: as in the endpoint above
- Writes: none
- Validation: `id` is a UUID
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: none
- New endpoints/actions required: `GET /api/users/:id/memory`
- Side effects: none
- Error handling: 404 for an unknown user; the sidebar shows an inline retry on failure.
- Idempotency/concurrency: N/A

## Edge cases
- Extraction fails permanently: polling stops at 60s and "Updating memory…" disappears.
- A summary-less conversation (under 2 user turns) shows "Short call".

## Acceptance criteria

- Given Sam has never talked, then the sidebar shows the empty state.
- Given a call just ended, when extraction completes, then new facts appear without a reload.
- Given Alex is selected, when switching to Priya, then the sidebar shows Priya's data only.

## Test plan

- Unit: none
- Integration: curl the endpoint for a seeded user with data.
- E2E/manual: call, hang up, watch the facts appear; screenshots for the PR.
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge.
- Legacy deprecation: N/A
- Rollback: revert.

## Dependencies

- DEMO-4, DEMO-6

## Open questions
None

---

# DEMO-9 [Perf] Latency budget, live model bake-off and voice tuning

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
Measure live LLM latency per turn, run a repeatable bake-off across candidate OpenRouter models using the real prompt, and pick the fastest model that passes DEMO-10's quality checks. Then tune the ElevenLabs voice and turn-taking settings.

## Problem
"Fast" is unmeasured. The live model was a guess in DEMO-3.

## Goal
Time to first sentence is at p50 ≤ 0.6s and p90 ≤ 1.0s on real calls, with the evidence in a report.

## Non-goals

- A self-hosted LLM proxy.
- Changing the voice provider.

## Users / permissions

- Primary users: none
- Required permissions: none
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: none

## Current state
`turns.llmTtfbMs` and `llmTtfSentenceMs` are stored (DEMO-5) but nothing reads them.

## Relevant repo findings

- `src/db/schema.ts`: `turns` latency columns.
- `src/scripts/init.ts`: precedent for standalone scripts under `src/scripts/`.
- `package.json`: add `bench:llm` and `report:latency` scripts run with `tsx --env-file=.env`.
- `src/utils/agent/buildAgentPrompt/`: the real prompt to benchmark (DEMO-7).

## Scope

### In scope

- `src/scripts/latencyReport.ts`: p50 and p90 of `llmTtfbMs` and `llmTtfSentenceMs` for agent turns since a given date, printed as a table.
- `src/scripts/benchLlm.ts`:
  - **Candidates**, with slugs confirmed on openrouter.ai/models: Claude Haiku 5.5, the current Gemini Flash, and the current GPT mini.
  - **Requests:** stream Chat Completions to OpenRouter with the real `buildAgentPrompt` output for a fixture user with about 40 memories, plus 10 scripted user turns, 3 runs each.
  - **Records:** time to first token and time to first sentence-ending punctuation.
  - **Output:** p50/p90 per model.
- Set the OpenRouter account default provider sort to `latency` (account setting, no code).
- **Pick the model:** the fastest candidate that passes DEMO-10 thresholds. Set it as `custom_llm.model_id` in both agent configs, run `elevenlabs agents push`, and record the bake-off table in Encephalon.
- **ElevenLabs tuning, in both agent configs then `push`:**
  - lowest-latency TTS model;
  - voice: a shortlist of 3 auditioned in the dashboard;
  - turn eagerness tested at normal and eager;
  - LLM max tokens 150.
  - Record the final values in Encephalon.

### Out of scope

- Automated latency alerts.

## Functional requirements
- The bench script runs in under 3 minutes and costs under $1 per run.

## UX requirements
- N/A

## Data requirements

- Tables/entities: `turns`
- Reads: latency columns
- Writes: none
- Validation: none
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `buildAgentPrompt`
- New endpoints/actions required: none
- Side effects: OpenRouter calls (bench)
- Error handling: a failed model in the bench is reported as `error` in the table; the run continues.
- Idempotency/concurrency: N/A

## Edge cases
- A candidate's first chunk is whitespace: measure the first non-whitespace token.

## Acceptance criteria

- Given the bench, when run, then a p50/p90 table prints for every candidate.
- Given the chosen model on the dev agent, when 3 real calls are made, then `report:latency` shows time to first sentence at p50 ≤ 0.6s and p90 ≤ 1.0s.

## Test plan

- Unit: none
- Integration: none
- E2E/manual: real calls, then the report.
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge the scripts; change the model on `robin-dev`, verify, then change `robin-prod`.
- Legacy deprecation: N/A
- Rollback: revert the agent config change and run `elevenlabs agents push`.

## Dependencies

- DEMO-5, DEMO-7; DEMO-10 for the quality gate on the final pick.

## Open questions
None

---

# DEMO-10 [Quality] Multi-call conversation eval: gets to know the user, never repeats

## Linear metadata

- Team: DEMO
- Assignee: Isaac Hinman

## Summary
A script simulates three users across three calls each, in text, using the real prompt, the live model and the real extraction core. It scores the agent on getting to know the user, never repeating itself, staying short and spoken, and never inventing memories, and fails when thresholds are missed.

## Problem
"Natural", "engaging" and "never repeats" are judged by ear today, and prompt or model changes can regress them silently.

## Goal
`bun run eval` gives a pass/fail table that is run before merging any change to the prompt, the extraction prompt or the live model.

## Non-goals

- Running in CI (cost and nondeterminism).
- Evaluating audio quality. That stays a manual checklist.

## Users / permissions

- Primary users: Isaac (developer).
- Required permissions: none
- Read-only roles: N/A
- Write-capable roles: N/A
- Audit/security considerations: none

## Current state
No evals.

## Relevant repo findings

- `src/memory/` `extractMemories` core: pure and reusable (DEMO-6).
- `src/utils/agent/buildAgentPrompt/`: pure prompt builder (DEMO-7).
- `src/ai/client.ts`: `callModel` for the judge (structured output).
- `package.json`: add the `eval` script.

## Scope

### In scope

- **Fixtures:** `src/scripts/eval/personas.ts` defines 3 hidden personas, each with about 15 facts and 2 upcoming events. The persona sim only reveals facts when asked or when natural.
- **Loop**, in memory with no DB, for each persona:
  1. Run 3 calls of 10 turns each.
  2. The agent is the live model via OpenRouter with `buildAgentPrompt` on the in-memory state.
  3. The user is a role-play model holding the persona.
  4. After each call, run `extractMemories` and apply the result to the in-memory state.
- **Deterministic checks:**
  - agent turn word count p95 ≤ 45;
  - at most 1 question mark per agent turn;
  - no agent turn with normalised word-trigram Jaccard ≥ 0.5 against any earlier agent turn for the same persona, across all calls;
  - all 3 openers distinct (same metric).
- **Judge checks** (`callModel` with a valibot rubric), per call:
  - new correct facts learned versus the hidden persona;
  - hallucinated facts (claims not in the persona);
  - previous-call thread picked up (yes/no);
  - repeated questions (list);
  - naturalness 1–5;
  - engagement 1–5.
- **Thresholds:**
  - ≥ 3 new correct facts per call;
  - 0 hallucinated memories;
  - 0 repeated questions;
  - a thread picked up in calls 2 and 3;
  - naturalness and engagement average ≥ 4.
- Output a table per persona and call, write transcripts to the scratch `tmp/eval/` directory (gitignored), and exit non-zero on failure.
- Manual voice checklist in Encephalon: 3 real calls per user, checking:
  - the opener is specific;
  - nothing is repeated;
  - interrupting Robin feels natural;
  - there are no long silences.

### Out of scope

- Statistical significance; this is 9 simulated calls per run.

## Functional requirements
- A full run takes under 5 minutes and costs under $3.

## UX requirements
- N/A

## Data requirements

- Tables/entities: none (in memory)
- Reads: fixtures
- Writes: `tmp/eval/*.json` transcripts
- Validation: judge output via valibot
- Migrations/backfills: none
- Audit events: none

## API / backend requirements

- Existing endpoints/actions to reuse: `callModel`, `extractMemories`, `buildAgentPrompt`
- New endpoints/actions required: none
- Side effects: OpenRouter calls
- Error handling: a model error fails that call's row and the run exits non-zero.
- Idempotency/concurrency: personas run in parallel; calls within a persona run sequentially.

## Edge cases
- The persona sim leaks all facts in turn one: the persona prompt forbids volunteering more than one fact per turn.

## Acceptance criteria

- Given the current prompt and model, when `bun run eval` runs, then it prints the table and exits 0 only if every threshold is met.
- Given a prompt deliberately broken to re-ask a known fact, when eval runs, then the repeated-question check fails.

## Test plan

- Unit: one test for the trigram Jaccard similarity function.
- Integration: the eval run itself.
- E2E/manual: the voice checklist above.
- Permission tests: N/A
- Migration/backfill validation: N/A

## Rollout / rollback

- Feature flag: none
- Validation owner: Isaac
- Rollout steps: merge; record the "run eval before prompt/model changes" rule in Encephalon.
- Legacy deprecation: N/A
- Rollback: revert.

## Dependencies

- DEMO-1, DEMO-6, DEMO-7

## Open questions
None
