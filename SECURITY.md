# SECURITY.md

**App type:** AI app. A plain Node server (`server.js`) calls OpenRouter on the visitor's behalf, plus a static page (`app/index.html`). **No database, no accounts, no login.** Learner data (phrasebook, known list) lives only in the visitor's own browser `localStorage`. The one secret is `OPENROUTER_API_KEY`, which stays on the server.

*Status: draft for Build 3 (Go Live & Security Audit). Checked locally on 2026-11-24. Live at https://scenespeak-svse.onrender.com (Render free Web Service, commit `50bde8b`, `TRUST_PROXY=1`); the live rate-limit test passed. Still to confirm: that a visitor on a different network gets their own allowance.*

## What was checked

| Check | How | Result |
|---|---|---|
| Secrets in the repo | Searched all files for `sb_secret_`, `service_role`, `sk-or-`, `sk-ant-`, `sk-proj-`, `sk_live_` | Only hit: the placeholder `sk-or-v1-replace-with-your-key` in `.env.example` |
| Secrets in Git history | `git log -S"sk-or-"` over all commits | Only that same placeholder, in the initial commit |
| `.env` ignored | `git check-ignore -v .env`, `git ls-files` | Ignored (`.gitignore` line 2); not tracked |
| XSS from model or user text | Searched `app/index.html` for `innerHTML` / `eval` | None found; text is rendered as text |
| File access / path tricks | `GET /.env`, `/../server.js`, `/%2e%2e/server.js`, `/app/index.html` | All 404; the server only serves one fixed page |
| Bad input | Malformed JSON, `null`, arrays, wrong types, 5,000-char fields | All 400, no crash |
| Oversized body | 300 KB POST to both endpoints | See "Found" (was a dropped connection) |
| Cross-site / non-JSON POSTs | `text/plain` and no Content-Type | Was accepted; see "Found" |
| Abuse volume | `tests/rate-limit-check.js` (30 calls) | 400 x20, then 429 from request #21 |
| Spoofed `X-Forwarded-For` | 45 requests with a different header each | Ignored unless `TRUST_PROXY=1`; still limited |
| Security headers | `curl -I /` | Missing before; present now (also seen on the live site) |
| Live rate limit on Render | `tests/rate-limit-check.js` against the live URL | 400 x19, then 429 from request #20 (one earlier request in the window was a phone test), `Retry-After` 568 s, friendly message shown |
| Live phone test | Paste, generate, swipe and save on a phone | Worked |

## Found, and fixed

1. **No rate limit.** Anyone could call `/api/phrases` and `/api/feedback` in a loop and spend the OpenRouter credit. **Fixed:** per-IP limit in memory, 20 per 10 minutes for `/api/phrases` and 40 for `/api/feedback` (each counted separately), returning `429` with a friendly message and `Retry-After`. The check runs before the request body is read.
2. **Behind Render, every visitor would look like one IP.** **Fixed:** with `TRUST_PROXY=1` the limiter uses the last `X-Forwarded-For` entry (added by the proxy, not forgeable by the client). Off by default, so local runs ignore the header.
3. **API accepted any Content-Type.** A web page on another site could make a visitor's browser POST `text/plain` and burn credit. **Fixed:** API routes require `application/json` (415 otherwise), which forces browsers to do a cross-origin preflight we never allow.
4. **Too-big bodies dropped the connection** instead of returning the friendly 413 message the app expects. **Fixed:** the server now drains the body and answers `413` with `Connection: close`.
5. **No hardening headers.** **Fixed:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` on every response.
6. **No request timeouts** (slow clients could hold connections open). **Fixed:** `headersTimeout` 15 s, `requestTimeout` 30 s. Not load-tested.
7. **Hardcoded port 3000.** **Fixed:** `process.env.PORT || 3000` so Render can assign one.

## Remaining risks (not fixed)

- **Credit drain from many IPs.** A per-IP limit does not stop a spread-out attacker. The real backstop is the spending cap on the OpenRouter key ($2). Keep it, and watch usage after launch.
- **Limiter is in memory.** It resets when the server restarts or sleeps (Render free tier) and is not shared across instances. Fine for one small instance.
- **`TRUST_PROXY` assumes the app is only reachable through Render's proxy.** I have not yet confirmed on the live service how many addresses Render puts in `X-Forwarded-For`. If the last entry turns out to be a shared edge address, all visitors would share one bucket (fails safe for cost, but real users would be blocked). **Verify after deploy** by running the check script from two different networks. Live status: the limit trips correctly from one network (the phone and laptop tests shared one allowance). Still to do: run the script from a second network, such as a phone on cellular data, and confirm it gets its own 20 requests.
- **No authentication.** Anyone with the URL can use the app, by design for now.
- **Prompt injection** is mitigated in the prompts (pasted text and replies are labeled as data, and output is rendered as text, never as HTML). I did not test it against the live model, because that costs money. Worst case is an odd answer for the person who pasted it.
- **Third parties see user text.** Pasted text goes to OpenRouter. PostHog masks all text and inputs in replays and autocapture (AGENTS.md rule 7 protects this), but the phrasebook is only as private as the visitor's browser.
- **No dependency risk today** (no packages). Re-check if packages are ever added.
- **No automated security tests.** The checks above were run by hand; only the rate-limit script is saved (`tests/rate-limit-check.js`).
- **`HEAD /` returns 404** (the server only answers `GET`). Harmless for visitors, but uptime monitors that use `HEAD` would report the site as down. Planned fix in Build 4.
