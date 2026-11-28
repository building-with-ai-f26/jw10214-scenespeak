# SceneSpeak: content plan and decisions (updated Nov 28, 2026)

Claude Code: read this file and AGENTS.md before working on the content pipeline.

## Product decisions (from the prototype review)
- **Main use case:** learn from a ready-made library of Lenny's Podcast paragraphs. **Your text** (paste your own) is a persistent tab in the bottom bar.
- **Feed:** tall cards with light pastel tops, one key line with phrases highlighted, a 2-step progress bar (Learn · Speak), and one button (Learn / Continue / Review).
- **Card opens full page** (App Store style), with the full paragraph, phrases and Start.
- **Phrase card:** Learn on the front (meaning, the sentence from the paragraph, scene, Listen). **Flip to speak** on the back: an AI chat, voice by default with a keyboard option. Bookmark and flip are at the top of the Speak side. Swipe left/right = next/previous phrase. Swiping no longer means "save," so update PostHog events.
- **Success rule:** the phrase is completed if the learner uses it correctly within 3 replies.
- Prototype canvas: https://claude.ai/artifact/Ek76h3h58RCZLiDehAMiGk

## Model and pass rule (decided Nov 28, after the blind review)
- **Model:** `google/gemini-3.8-flash` for the content pipeline. The app (`server.js`) is unchanged.
- **Pass:** 4 or more phrases surviving the code checks. This is only a **shortlist**; the model's own yes/no is ignored.
- **Jenny makes the final card decision.**
- **No "about work" filter.** Personal stories can be cards.
- **Evidence (one episode, 10 paragraphs, partly blind):** Jenny picked 3.8 Flash's list best on 5 of 10 (Sonnet 5.5: 3, Flash Lite: 2). With 4+, all 3 of Jenny's cards pass, plus 3 paragraphs Jenny rejected. The threshold was chosen on those same 10, so it still needs testing on new paragraphs.
- **Full Mosseri run with 3.8 Flash:** 27 of 62 sent paragraphs passed (44%), 1 failed (cut off at the 2000-token cap), cost $0.23. This is below the 70% go/no-go line. Results vary between runs: only 2 of Jenny's 3 cards passed this time (`01:03:27` got 3 phrases).

## Content decisions
- **Source:** Lenny's free starter pack, cloned to `~/Desktop/lenny-data` (outside this repo). License: personal, non-commercial use only. Never commit raw transcripts or extracted output (`content-test/` is gitignored). Credit every card.
- **0–8 phrases per paragraph.** Never pad. Pass rule: see above.
- **No minimum word count for a card; maximum 200 words.** One guest answer = one card. Split long answers into roughly equal parts at sentence ends. Don't send paragraphs under 60 words to the AI (mark them "too_short").
- **No title needed.** The card shows the guest name and the episode description from the file's header.
- **Timestamps:** store, don't show. They are each paragraph's ID. Link to `post_url`, or `youtube_url` when present.

## What a good phrase is
- Reusable in many different work conversations (meetings, coffee chats, interviews).
- GOOD examples (not from any test episode): "get buy-in", "circle back", "pick your brain", "low-hanging fruit", "on the same page", "a fair ask".
- BAD: plain nouns or job titles ("product designer"), technical terms ("running code"), chunks tied to one sentence ("adopted what we call pods"), fragments ("It's these sort of").
- Watch for transcription typos (e.g. "reigned in" should be "reined in"). The model's typo check is not reliable yet.

## Go / no-go rule (changed Nov 28)
- **At least 4 cards approved by Jenny per episode.** This replaces the earlier "70% pass and 4+ passing paragraphs" rule.
- Jenny (the human) is the judge. Don't let a model grade its own output.
- Mosseri meets it: 6 approved cards (3 from each review).

## Before the next runs
- The other 4 episodes are **paused**.
- Raise the token cap from 2000 to **3000** (one Mosseri answer was cut off).
- Set **temperature to 0** (results varied between runs).
- Neither change is in the script yet.

## Test episodes
adam-mosseri.md (baseline), nikhyl-singhal-2.md (career advice), molly-graham.md (leadership), simon-willison.md (technical stress test), dr-becky-kennedy.md (originally expected to fail as mostly not about work; there is no longer an "about work" filter).

## Open questions
- **How do library cards get to Render before Build 5 (Dec 7)?** `app/library.json` holds transcript excerpts, so it is gitignored for now and exists only on Jenny's computer. Render deploys from Git, so the live app will not have it.

## Status (end of Nov 28 session)
- `scripts/extract-phrases.js` works: `--dry-run` splits for free, `--ids` and `--model` options, saves raw answers on failure, never overwrites without `--force`.
- First full Mosseri run with Gemini 2.5 Flash Lite: under 1 cent, but many weak phrases.
- 10-paragraph comparison of 3 models (Gemini 2.5 Flash Lite, Gemini 3.8 Flash, Claude Sonnet 5.5): results in `content-test/output/compare.md`.
- Blind review of the 10 paragraphs is done: answers and model reveal in `content-test/review.json`.
- Second review (5 random passing paragraphs outside the first 10, one model, not A/B/C): Jenny made 3 of 5 cards and saved 14 of 22 phrases. Answers in `content-test/review-2.json`.
- **Next:** try the new UI (`docs/ui-spec.md`) with the approved Mosseri cards. Other episodes are paused.
- Content work is committed on branch `content-fit-test`. New UI work goes on branch `new-ui`.
