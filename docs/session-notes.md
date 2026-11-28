# SceneSpeak session notes, Nov 28, 2026

Read this with `AGENTS.md`, `docs/content-plan.md` and `docs/ui-spec.md`. This file is public (the repo is public), so it holds no transcript text.

## What we did today
1. **Phrase extraction** (`scripts/extract-phrases.js`): splits transcripts in code, then asks a model for phrases. Ran on the Mosseri episode only.
2. **Model comparison and blind review:** Gemini 2.5 Flash Lite, Gemini 3.8 Flash and Claude Sonnet 5.5 on 10 paragraphs, then 5 more with 3.8 Flash. Decided: 3.8 Flash, pass = 4+ phrases as a shortlist, Jenny makes the card decision.
3. **Mosseri results:** 27 of 62 sent paragraphs passed; Jenny approved 6 cards. New go/no-go rule: at least 4 approved cards per episode.
4. **Library** (`scripts/build-library.js`): built `app/library.json` with 6 cards and 21 saved phrases.
5. **New UI** (`app/index.html`): feed, paragraph page, Learn/Speak flip card, swipe, bookmark, Your text and Phrasebook tabs. `server.js` serves `/library.json`.
6. **Speak feedback:** new prompt plus `tests/feedback-check.js`. It did not fix the problem (see below).

AI spend in these runs was about $0.40, partly estimated, not counting Jenny's own use of the app.

## Branches
| Branch | State |
|---|---|
| `main` | Unchanged today (`0ab814f`). This is what Render deploys, so the live app has none of today's work. |
| `content-fit-test` | Pushed (`608ca42`): extraction script, content plan, UI spec, design screens. No pull request. |
| `new-ui` | Branched from `content-fit-test`. Holds the new UI, library script, feedback prompt, feedback check and these notes. Pushed at the end of the session. No pull request. |

## Only on Jenny's computer (gitignored, not backed up by Git)
- `content-test/`: extraction output, review answers (`review.json`, `review-2.json`), saved library answers.
- `app/library.json`: needed for the feed. `node scripts/build-library.js --force` rebuilds it from the saved answers in `content-test/library-raw.json` with no new AI calls. It overwrites any hand edits.

## Speak feedback eval
Test: `node tests/feedback-check.js` with the server running (real, paid calls; `--dry-run` is free). Model: Gemini 2.5 Flash Lite.

| Case | Old prompt (1 run) | New prompt (3 runs) |
|---|---|---|
| Wrong tense and two spelling mistakes (Jenny's example) | fail | 0 of 3 |
| Already right | pass | 3 of 3 |
| Wrong meaning (should not complete) | pass | 0 of 3: not completed, but 5 sentences |
| Phrase missing (should not complete) | pass | 0 of 3: not completed, good tense lesson, but 4 sentences |
| Reply tries to give orders (should not complete) | pass | 3 of 3 |
| **Total** | **4 of 5** | **6 of 15** |

The totals are not a like-for-like score: the old prompt ran once, and the checks were written for the new rules.

On Jenny's example the new prompt still:
- marks the reply not completed (it should be completed);
- keeps "we don't have" in the better version, so the present perfect is never taught;
- advises moving the phrase, which is not needed;
- catches "dont" but misses "brandwith".

With temperature 0, the three runs of each case were identical, so one run per case is enough.

**The new prompt is committed on `new-ui` but is not a proven improvement.** Do not merge it as a fix.

### Proposal: test two other models (not approved, not run)
Same prompt, same 5 cases, once each.

| Model | Rough cost per learner reply | 5 test calls |
|---|---|---|
| `anthropic/claude-haiku-5.5` | about $0.0002 (about twice today's) | about $0.001 |
| `google/gemini-3.8-flash` | about $0.004 (about 40 times today's), likely slower | about $0.025 |

- 10 calls, about $0.03, at most about $0.04.
- Needs optional `FEEDBACK_MODEL` and token-cap settings in `server.js` (feedback only; 1500 cap for the test, since 3.8 Flash would likely be cut off at 300). Add them to `.env.example`.
- Claude Code is a Claude model, so Jenny should judge the Haiku answers.
- Alternative: one more prompt revision on Flash Lite with worked examples. If that fails too, stop revising.

## Open decisions
1. Run the model test, revise the prompt once more, or restore the old prompt?
2. How do library cards get to Render before Build 5 (Dec 7)? (Also in `docs/content-plan.md`.)
3. Session replays mask the whole card screen, including podcast text, so replies stay private without changing PostHog settings. Change the masking to show podcast text? (Needs approval, AGENTS.md rule 7.)
4. Long key lines fill most of a feed card. Smaller font, or shorten around the phrase?
5. When to resume the other four episodes (paused).

## Known issues
**From Jenny's testing**
- Speak feedback does not teach the target phrase: grammar around it is changed silently or not explained, and spelling mistakes are not mentioned.

**Noted during development**
- Weak library lines worth editing: "that chemistry bit" (unnatural scene line), "That said" (odd use in the scene), "that's about it" and "common misconceptions" (the question can be answered without the phrase).
- Some library paragraphs contain transcript errors, shown as they are.
- On longer cards and small phones, part of the scene is below the fold.
- Chat history and pasted-text cards disappear on reload (progress and bookmarks stay).
- All six feed cards show the same episode description.
- Speak checks one reply at a time; there is no multi-turn chat, and voice is a disabled placeholder.
- `extract-phrases.js` still needs temperature 0 and a 3000-token cap before the next runs.
- Not verified: real phone behavior (Safari flip animation, on-screen keyboard) and sound. Headless browser checks used a fake AI, and their scripts are not saved in the repo.

## PostHog: funnel changes to make
Keep the old "SceneSpeak core funnel" for history (it relies on `card_swiped`, which changed meaning) and create:
- **Library:** Pageview → `card_opened` → `phrase_flipped` (source=library, side=speak) → `feedback_checked` (source=library) → `feedback_checked` (source=library, ok=true).
- **Your text:** Pageview → `paste_submitted` → `phrases_generated` → `phrase_flipped` (source=text, side=speak) → `phrase_saved` (source=text).
- Track `paragraph_completed` as its own trend. `review_finished` is no longer sent. Older events have no `source` property. Screen changes do not count as pageviews.

## Next steps
1. Decide open decision 1 and fix Speak feedback.
2. Test the new UI on a real phone and note problems.
3. Edit the weak library lines.
4. Decide how the library reaches Render, then open a pull request for `new-ui`, merge, and run the smoke test in AGENTS.md section 4.
5. Update the PostHog funnels.
6. Update the build log and PRD in `docs/index.html`.
