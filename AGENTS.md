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
- **Run model evals:** None yet (planned for Build 4)

## 3. Non-Negotiable Engineering Rules
1. **Plan before coding:** Before touching multiple files, propose a brief plan and wait for approval.
2. **Small batches:** Make small, focused changes that can be reviewed and explained by a human in a single Pull Request.
3. **Explainability:** Avoid unnecessary abstractions or dependencies. Help the human builder understand the main components, what changed, why it matters, what could break, and how it was checked.
4. **Verify changes:** Run relevant checks. For a reproducible logic bug, use a failing test to demonstrate the fix when practical. Record manual checks and known limitations; follow the selected Build 4 evaluation track.
5. **Zero secrets in code:** Never hardcode API keys, tokens, or credentials. Always read from environment variables (`.env`) and update `.env.example` when new variables are needed. Exception: public analytics project tokens (e.g., PostHog `phc_...`) may be hardcoded in client code because they are public by design; never hardcode secret or personal API keys.
6. **Stop when looping:** If a fix fails twice in a row, stop, summarize what failed, and ask the human before trying a third approach.
