# 🐍 Snake Odyssey

A modern, multi-level take on the classic Snake game — built with vanilla HTML5, CSS, and JavaScript. No build step, no dependencies, no external assets: every visual and sound effect is drawn/synthesized at runtime.

**Play it live:** https://lanternforgestudios.github.io/snake-odyssey/ (GitHub Pages) or https://lanternforgestudios.itch.io/snake-odyssey (itch.io)

## Features

- **Classic Mode** — endless play on a simple board, beat your high score
- **Level Mode** — six themed levels, each with its own objective, hazards, and mechanics (see below)
- **Endless Mode** — speed and hazard density ramp up over time, with teleport portals that relocate throughout the run
- Smooth grid-based movement with keyboard (Arrow keys / WASD), swipe, and on-screen D-pad controls
- Food variety: regular, golden (bonus points), and poison — 1-3 items spawn on the board at once, each on a random 2-10s lifetime, so a poison spawn never forces your hand
- Full power-up set: Shield, Magnet, Double Points, Slow Time, and Ghost Mode, each with HUD icons, countdown timers, and their own expiration/fade-out
- Six unlockable snake skins, each with a distinct trail effect (see below)
- Full menu flow: Main Menu, Level Select, Snake Select, High Scores, Settings, How to Play, Pause, Game Over, Level Complete
- Procedural audio — a distinct musical motif per level/theme (and one for menus), independent music/SFX toggles, and a music volume slider
- Guest play (local-only progress) or a free account (Google or email/password) for cloud-saved, cross-device progress, online leaderboards, and achievements — see [Cloud Accounts](#cloud-accounts-phase-3) below
- Responsive layout for desktop and mobile, with touch controls

### Levels

| # | Level | Theme | Objective | Signature mechanic |
|---|---|---|---|---|
| 1 | Garden Grove | Grass, apples | Collect 10 food | — |
| 2 | Desert Dunes | Sand, cacti | Collect 12 food | Sandstorm visual haze |
| 3 | Snowy Peaks | Ice | Survive 60s | Slippery movement (turns land every other tick) |
| 4 | Jungle Ruins | Vines, ruins | Reach a score goal | Moving bug hazards |
| 5 | Lava Cavern | Volcanic, lava pools | Collect 14 food | Fastest pace, harshest poison |
| 6 | Cyber Grid | Neon grid | Find the key, reach the exit | Toggling laser barriers + teleport portals |

The key on Cyber Grid (and any future key-based level) doesn't sit on the board waiting — it stays hidden for a random 10-30s, then appears for only 3-7s before vanishing again if uncollected, repeating until you grab one. Teleport portals (Cyber Grid and Endless Mode) work the same way: active for 15-25s, then a 3-8s cooldown before a new pair appears elsewhere.

### Snake Skins

| Skin | Unlocks | Notable trait |
|---|---|---|
| Default | Available from the start | — |
| Fire Snake | Complete Lava Cavern | Flame trail |
| Ice Snake | Complete Snowy Peaks | Frost trail |
| Cyber Snake | Complete Cyber Grid | Neon glow trail |
| Golden Snake | Complete all 6 levels | Sparkle trail |
| Odyssey Snake | Score 500+ in Endless Mode | Star-sparkle trail, golden flash on food pickup, and **Navigator's Luck** — every 6s there's a 40% chance the next non-poison food spawns closer to you |

## Tech Stack

Plain HTML5 Canvas + CSS3 + JavaScript (ES modules) — no frameworks, no bundler, no npm install for the frontend. All artwork is drawn procedurally on `<canvas>` and all audio is synthesized with the Web Audio API, so the game itself runs entirely from static files on GitHub Pages.

Cloud accounts are backed by Firebase: Authentication, Cloud Firestore, and Cloud Functions (see `backend/`) — the frontend loads the Firebase SDK from a CDN at runtime, so there's still no local build step for the game.

## Cloud Accounts (Phase 3)

Snake Odyssey supports two ways to play:

- **Guest** — no account needed. Classic and Endless Mode only, with local high scores/settings saved via `localStorage`. Guests can't unlock snakes or enter Level Mode, even if their local stats would otherwise qualify (e.g. a 500+ Endless score) — playing a run that *would* unlock something shows a one-time "create a free account to keep this" message instead.
- **Signed in** (Google or email/password) — full access: Level Mode, snake unlocks, cloud-saved progress that follows you across devices, a global Classic/Endless leaderboard, and achievements. Every authenticated run is validated server-side (Cloud Functions) before it's saved — the client is never trusted to record its own unlocks, high scores, or achievements.

Signing up for the first time offers to import your guest device's local Classic/Endless high scores and settings (never unlocks, Level Mode progress, or achievements, which only ever come from validated authenticated play). Signing out preserves your cloud progress and returns to local guest data.

Achievements (First Bite, Century Club, First Steps, World Explorer, Snake Collector, Endless Legend, Dedicated) are computed entirely server-side from the cloud profile's lifetime stats and progression — there's no client-side achievement logic to tamper with.

## Deployment

The static game (`index.html` + `frontend/`) auto-deploys on every push to `main`:

- **GitHub Pages** — served directly from the branch root, no build/workflow needed.
- **itch.io** (`lanternforgestudios/snake-odyssey`) — `.github/workflows/deploy-itch.yml`
  stages those same files and pushes them with [Butler](https://itch.io/docs/butler/) to
  the `html5` channel, authenticated via the `BUTLER_CREDENTIALS` repo secret.

`backend/` (Cloud Functions, Firestore rules) deploys independently and manually — see
`backend/README.md` and the `deploy_backend` skill.

### App Check

Firebase App Check (reCAPTCHA Enterprise) is wired into the frontend
(`frontend/js/auth.js`/`firebase-config.js`) and the Cloud Functions
(`enforceAppCheck: true` on every callable in `backend/functions/src/`), but is
**inert until finished in the Firebase Console**:

1. App Check > Apps > register the web app > reCAPTCHA Enterprise — copy the resulting
   site key into `frontend/js/firebase-config.js`'s `appCheckSiteKey` (empty = App Check
   never initializes on real domains, so this is safe to leave blank).
2. App Check > Apps > (web app) > Manage debug tokens — register the fixed token in
   `appCheckDebugToken` (`firebase-config.js`) so the emulator-backed `pytest tests/
   --cloud` suite passes App Check once the Cloud Functions enforce it (see
   backend/README.md's Gotchas).
3. Add the domain(s) that actually serve the game to both the reCAPTCHA Enterprise key's
   allowed domains *and* Firebase Auth's Authorized Domains: `lanternforgestudios.github.io`
   plus itch.io's actual serving domain — itch.io runs HTML5 games in an iframe off an
   `*.itch.zone`/`hwcdn.net` CDN domain, not `lanternforgestudios.itch.io` itself, so
   check the iframe's real `src` (devtools) once the game is live there.
4. Only once 1-3 are confirmed working should the backend be redeployed to make
   `enforceAppCheck: true` take effect in production (`deploy_backend` skill) — deploying
   it before the frontend can actually attach a valid token would lock out every player.

## Running Locally

Because the game uses ES module imports (`<script type="module">`), it needs to be served over `http://` rather than opened directly as a `file://` URL (browsers block module imports from the filesystem).

```bash
# from the project root
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Steer the snake |
| Swipe (touch) | Steer the snake |
| On-screen D-pad (touch) | Steer the snake |
| Esc / Space | Pause / Resume |

## Project Structure

```
index.html          Page shell: canvas, HUD, and all menu/screen overlays (frontend deploy entry point)
frontend/
  styles.css           Layout, HUD, D-pad, and responsive styling
  js/
    main.js            App entry point — boot, navigation, event wiring, music-theme syncing
    state.js            Finite state machine for menu/game screens
    engine.js            Fixed-timestep game loop, movement, spawn/expiry cycles, tick logic
    entities.js          Snake, food, power-up, and obstacle data models
    levels.js             Level registry (all 6 levels), Classic/Endless pseudo-levels, difficulty scaling
    snakes.js             Snake skin registry and unlock conditions
    foods.js               Food type registry
    powerups.js             Power-up registry and active-effect handling
    collision.js             Wall / self / obstacle collision detection
    render.js                 Canvas drawing, per-theme visuals, cached backgrounds
    input.js                   Keyboard, swipe, and D-pad input handling
    audio.js                    Procedural SFX and per-theme music
    storage.js                   Guest localStorage + cached cloud-profile save/load (see Cloud Accounts above)
    firebase-config.js            Public Firebase web app config + App Check site key/debug token
    auth.js                        Firebase Authentication wiring (sign in/up/out, session state) + App Check init
    backend.js                      Cloud Functions client wrapper (sessions, submissions, leaderboard, etc.)
    avatars.js                       Preset avatar gallery for email/password sign-up
    achievements.js                    Achievement display metadata (id/name/description) -
                                        earning logic is entirely server-side
    ui.js                             Screen population and HUD updates
    resize.js                          Responsive canvas sizing
backend/              Firebase Cloud Functions, Firestore rules, and cloud backend config - see backend/README.md
.github/workflows/
  deploy-itch.yml        Pushes index.html + frontend/ to itch.io via Butler on every push to main
tests/                How to serve and browser-test this project (Playwright + system Chrome)
  conftest.py          Shared fixtures: dev server, browser, and a fresh page per test
  helpers.py            Save-data builders and debug-hook helpers (see Testing, below)
  test_*.py              Test modules by area (navigation, food/power-ups, level mechanics, skins, audio/settings, progression)
.claude/skills/
  run/                 How to serve/test this project and run the suite (Playwright + system Chrome)
  run_local/           Start/stop a local server for manual play-testing
  cleanup/             Whole-codebase tech-debt/quality review process
  push/                Commit + push shortcut with safety guardrails
  deploy_backend/      Deploy backend/ to the live Firebase project, with required confirmation
  live_smoke_test/     Verify cloud features work against the live (not emulated) backend
```

Levels, skins, food types, and power-ups are each a flat data registry consumed by generic engine/render code — adding new content is a data addition, not a rewrite.

## Testing

The game itself has zero dependencies, but there's a separate, dev-only pytest + Playwright regression suite:

```bash
pip install pytest playwright   # one-time; do NOT run `playwright install` (see .claude/skills/run/SKILL.md)
pytest tests/
```

It drives the game the way a player would (clicking through menus, pressing keys) plus, for assertions that need exact game state, a small debug hook (`window.__debug`) that `frontend/js/main.js` exposes *only* when served from `localhost`/`127.0.0.1` — it's absent in production. The suite starts its own dev server, so `pytest tests/` works standalone. Tests that need an "authenticated" player use `window.__debug.setGuestOverride()` (see `tests/helpers.py:set_authenticated`) rather than signing into real Firebase - fast, but only fakes local UI/gating state, never touches the backend.

For that, there's a separate opt-in suite against the real Cloud Functions/Firestore/Auth (via the local emulators, not production): `pytest tests/ --cloud` (requires Node 20+, a JDK 21+, and the Firebase CLI - see `.claude/skills/run/SKILL.md` and `backend/README.md`).

## Roadmap

Everything in the original Phase 1/2 design spec's core feature list is implemented. Phase 3 (cloud accounts, server-validated progression, leaderboards, achievements, and a Firebase-emulator-backed test suite) is implemented and deployed - see `Odyssey-Snake-Phase3v1.rtf` for the full spec. Still to come:

- Daily challenge mode
- Multiplayer snake battle
- Boss levels
- Coins/shop system
- Progressive Web App install support
