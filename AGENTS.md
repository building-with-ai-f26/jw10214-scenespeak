# AGENTS.md — Coding Agent Operating Manual

> Give this file to your coding agent and check that it is using these instructions. Keep the stack, commands, and ground rules current.

## 1. Project Overview
- **What this repo builds:** SceneSpeak turns pasted real-life text (readings, slides, transcripts) into key English phrases, each with a short scene, AI practice feedback on the learner's reply, and a swipe-to-review flow.
- **Primary user & core workflow:** [See the living PRD in `docs/index.html`]
- **Tech stack:** Plain HTML/JS frontend (`app/index.html`), plain Node server (`server.js`, no packages), OpenRouter (`google/gemini-2.5-flash-lite`), PostHog analytics, browser `localStorage` (phrasebook and known list).

## 2. Commands
- **Install dependencies:** Node 18+ (no packages to install). Then `cp .env.example .env` and add your `OPENROUTER_API_KEY`.
- **Run locally:** `node server.js` then open http://localhost:3000
- **Run deterministic tests:** None yet (manual check in the browser)
- **Rate-limit check (free, never calls the AI):** with the server running, `node tests/rate-limit-check.js` (or pass a URL, e.g. your Render URL). Expect 400s, then 429s from request #21.
- **Run model evals:** with the server running, `node tests/feedback-check.js` (real, paid AI calls: ask first; `--dry-run` is free, `--runs=3` repeats each case). Broader evals are planned for Build 4.

## 3. Non-Negotiable Engineering Rules
1. **Plan before coding:** Before touching multiple files, propose a brief plan and wait for approval.
2. **Small batches:** Make small, focused changes that can be reviewed and explained by a human in a single Pull Request.
3. **Explainability:** Avoid unnecessary abstractions or dependencies. Help the human builder understand the main components, what changed, why it matters, what could break, and how it was checked.
4. **Verify changes:** Run relevant checks. For a reproducible logic bug, use a failing test to demonstrate the fix when practical. Record manual checks and known limitations; follow the selected Build 4 evaluation track.
5. **Zero secrets in code:** Never hardcode API keys, tokens, or credentials. Always read from environment variables (`.env`) and update `.env.example` when new variables are needed. Exception: public analytics project tokens (e.g., PostHog `phc_...`) may be hardcoded in client code because they are public by design; never hardcode secret or personal API keys.
6. **Stop when looping:** If a fix fails twice in a row, stop, summarize what failed, and ask the human before trying a third approach.
7. **Don't turn off PostHog autocapture without asking:** Never set `autocapture: false` (or otherwise disable or narrow autocapture, session recording, or the masking options) in the PostHog init without asking the human first. Custom events like `card_swiped` and `phrase_saved` supplement autocapture, they don't replace it.

## 4. Shipping
SceneSpeak deploys to Render as a Web Service (plain Node, no packages, no database). Check Render's current screen labels if anything below looks different.

**First deploy**
1. Push your work to GitHub and merge to `main`.
2. In Render: New → Web Service → connect this GitHub repo → branch `main`.
3. Settings: Runtime `Node`. Build Command: `echo "no packages to install"`. Start Command: `node server.js`. Instance type: Free.
4. Environment variables (set in the Render dashboard, never in Git):
   - `OPENROUTER_API_KEY` = your key (use a key with a spending cap)
   - `TRUST_PROXY` = `1` (so the rate limit sees each visitor's real IP)
   - `NODE_VERSION` = `20` (any 18+ works)
   - Do not set `PORT`: Render provides it and `server.js` reads it.
5. Create the service and wait for "Live".

**After every deploy (smoke test)**
1. Open the Render URL, paste a short text, and confirm phrase cards appear.
2. Press Check on one practice reply and confirm feedback appears.
3. Run `node tests/rate-limit-check.js https://YOUR-APP.onrender.com`. Expect 400s, then 429s from request #21. Afterwards your IP is blocked for about 10 minutes.
4. Check the Render logs for errors.

**Rollback:** Render dashboard → your service → Events (or Deploys) → pick the last good deploy → Rollback. Then re-run the smoke test. If a secret was ever exposed, rotate the key in OpenRouter first, then update `OPENROUTER_API_KEY` on Render.

**Known behavior:** the free tier sleeps when idle, so the first request after a pause can take about a minute. The rate limit lives in memory and resets on restart.

## 5. Ask me first
Stop and ask the human before doing any of these, even if a task seems to need it:
- **Deleting data:** files, branches, Git history, user data, or anything in localStorage-handling code that could wipe a learner's phrasebook.
- **Keys, secrets, or permissions:** creating, rotating, moving, or printing keys or tokens; editing `.env`; changing who can access a repo, service, or dashboard.
- **Anything that costs money:** real calls to the AI model beyond a single manual check, new paid services or plans, upgrading Render, raising rate limits or token caps.
