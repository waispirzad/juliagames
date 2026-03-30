# Julia Games — Project Guide

## Local Development
- **Always use port 9000+** for local servers (e.g., `python3 -m http.server 9000`). Ports 8000-8999 are used by other projects.
- No build step — edit files and refresh the browser.
- Test on Samsung tablet: open `http://<mac-ip>:9000` in Chrome (same Wi-Fi).

## Tech Stack
- Vanilla HTML5 / CSS / JavaScript + Canvas — no frameworks, no npm
- Vercel — auto-deploys from GitHub on push to `main`
- Supabase — game event tracking (project ref: `hvlpgqpesdveqrfyhjrt`)

## Project Structure
- `index.html` — Game hub with fullscreen start button
- `js/` — Shared modules (touch, audio, tracker, utils)
- `games/` — Each game has its own `index.html` + `game.js`
- `css/main.css` — All styles (global + game-specific)
- `sw.js` — Service worker for offline PWA

## Key Conventions
- All games use synthetic sounds (Web Audio API) as fallback when MP3s are unavailable
- Touch coordinates normalized to 0-1 range for tracker events
- Back buttons require double-tap (parent-only control)
- Navigation uses `window.location.replace()` — no browser back history
- Every tap must produce visual + audio feedback (no "wrong" answers)

## Git Workflow
- **NEVER commit or push directly to `main` without explicit user approval.**
- Always work on the `dev` branch (or a feature branch off `dev`).
- When work is ready, merge `dev` → `main` **only after user approval**.
- Flow: feature branch → `dev` → (approval) → `main`

## Deployment
- Push to `main` → Vercel auto-deploys to `juliagames.vercel.app`
- Bump `CACHE_NAME` in `sw.js` on every deploy
