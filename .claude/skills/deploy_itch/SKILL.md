---
name: deploy_itch
description: Understand or troubleshoot the itch.io deploy (GitHub Actions + Butler) for Snake Odyssey. Use when asked about the itch.io build, a failed itch deploy, or to manually trigger/re-push it.
---

# Deploy to itch.io

Snake Odyssey publishes to https://lanternforgestudios.itch.io/snake-odyssey via
`.github/workflows/deploy-itch.yml`, which runs automatically on every push to `main`
that touches `index.html` or `frontend/**` — the same trigger surface that GitHub Pages
already serves live with no workflow at all. There is nothing to run locally for a normal
deploy; a `git push` to `main` is the whole flow.

## What the workflow does

1. Checks out the repo.
2. Copies `index.html` and `frontend/` into a `build/` staging directory (nothing else —
   `backend/`, `tests/`, `.claude/`, and the design docs aren't part of the game build).
3. Downloads [Butler](https://itch.io/docs/butler/) (itch.io's CLI) fresh each run via
   `broth.itch.zone` — no cached/pinned version.
4. Runs `butler push build lanternforgestudios/snake-odyssey:html5 --userversion <short-sha>`,
   authenticated via the `BUTLER_CREDENTIALS` repository secret (set as `BUTLER_API_KEY`
   env var, which Butler reads directly — no `butler login` needed in CI).

## Manual re-trigger

From the GitHub repo: Actions tab > "Deploy to itch.io" > Run workflow (it has
`workflow_dispatch` enabled), or push an empty/trivial commit touching `frontend/**`.

## Troubleshooting

- **Auth failure from Butler** — `BUTLER_CREDENTIALS` repo secret is missing, expired, or
  was regenerated on itch.io without updating the secret (Settings > Secrets and
  variables > Actions on the GitHub repo).
- **Butler push succeeds but the live itch.io page doesn't change** — itch.io channels
  need the pushed build's "This file will be played in the browser" flag set once via the
  itch.io dashboard (Edit game > uploads) if it was ever unset; check there first.
- **Game loads on itch.io but sign-in / cloud features silently don't work** — itch.io
  serves HTML5 games from an iframe on an `*.itch.zone`/`hwcdn.net` CDN domain, not
  `lanternforgestudios.itch.io` itself. That real serving domain needs to be in both
  Firebase Auth's Authorized Domains and the App Check reCAPTCHA Enterprise key's allowed
  domains (see root README's App Check section and `backend/README.md`) - find it via
  browser devtools on the live itch.io page (the iframe's `src`).
