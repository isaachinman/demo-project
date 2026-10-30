FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

# Bun is only the package manager; Node is the runtime.
COPY --from=oven/bun:1.4.4@sha256:9c5d3c92b234b4708198577d2f39aab7397a242a40da7c2f059e51b9dc62b408 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# The API only; the web app deploys to Cloudflare Pages.
COPY tsconfig.json ./
COPY src ./src

RUN bun run build:app

EXPOSE 3000
CMD ["node", "dist/app/server/index.js"]
