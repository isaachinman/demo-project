# Demo Project

## UI work

- Route every UI change (anything under `src/web`, including styles) through the `impeccable` skill.
- `PRODUCT.md` holds product context and `DESIGN.md` holds the visual system: tokens, type, depth, motion and component rules. `.impeccable/design.json` carries the extras DESIGN.md can't (shadows, motion, component snippets). Follow them; don't restate or override them.
- The visual reference is devl.dev (coss ui: Base UI and Tailwind). When a devl component fits, fetch it from `https://devl.dev/r/<name>.json` and port it to this repo's conventions rather than inventing one.
- Style with Tailwind v4 utilities. The theme tokens are defined in `src/web/styles.css`.
- If the visual system changes, update DESIGN.md with `/impeccable document`.

<!-- encephalon:managed-instructions:start eyJmb3JtYXRWZXJzaW9uIjoxLCJsaW5lRW5kaW5nIjoiTEYiLCJvcmlnaW5hbEZpbGVFeGlzdGVkIjp0cnVlLCJzZXBhcmF0b3JCYXNlNjQiOiJDZz09In0 -->
## Encephalon
Read and follow the repository-memory skill before making repository assumptions or recording durable knowledge:
./node_modules/encephalon/skills/encephalon/SKILL.md
<!-- encephalon:managed-instructions:end -->
