# SceneSpeak UI spec (v2, mobile-first), Nov 28, 2026

Claude Code: this is the target UI for app/index.html. Reference screens (from the approved design prototype) are in
`design/prototype/` (1-feed, 2-paragraph, 3-phrase-card). They are design files, not app code:
read them for layout, sizes, colors and copy, then rebuild in plain HTML/CSS/JS inside app/index.html.
Prototype canvas (Jenny can view it): https://claude.ai/artifact/Ek76h3h58RCZLiDehAMiGk

## Design tokens
- Background (stage): #e6ebf0 · Card (paper): #ffffff · Ink (text, primary buttons): #1b2430
- Ink soft: #4a5666 · Muted text: #56616f · Lines: #c9d2dc / #e3e8ee
- Highlighter (phrases inside paragraphs only): #ffe46b, drawn as a marker stripe
- Feed card tops: soft pastels, rotating: #e3edfa, #e2f3ea, #fbeee0, #ece9fa
- Feedback good: text #24704a on #e7f4ec · Tip: #8a5300 on #fdf1dc · Goal note: #5c4a00 on #fff8d6
- Fonts: Atkinson Hyperlegible (all UI), Courier Prime (scene dialogue and the learner's reply only). Google Fonts.
- Buttons: pill shape, primary = ink fill + white text, secondary = 2px ink outline. Min touch target 44px.
- Light theme only. No emoji. Icons = inline stroke SVG.

## Screens (one page app, phone width ~390px; must also look fine on desktop, centered max ~480px)
1. **Feed (home)**
   - Header: "SceneSpeak". Title "Tech chats & meetings", one-line subtitle.
   - Scrollable list of tall cards. Card top (pastel): "Lenny's Podcast · [guest]" + one key sentence with its phrases highlighted.
     Card bottom: episode description or guest, "N phrases · about M min", 2-step progress bar (Learn · Speak), one button: Learn / Continue / Review.
   - Fixed bottom tab bar: **Feed · Your text (+, emphasized) · Phrasebook (count badge)**.
2. **Paragraph (full page, App Store style)**
   - Pastel header with close (X) back to feed, source line, guest, "N phrases · about M min".
   - Full paragraph with all phrases highlighted. Link: "Read the full episode" (post_url or youtube_url).
   - "What you'll do": 1 Learn (meaning, the sentence, a short scene), 2 Speak (flip the card, reply to an AI coworker).
   - Phrase chips. Fixed bottom button: "Start learning".
3. **Phrase card (one per phrase, flip card)**
   - Top bar: back arrow (top-left) + "1 of N" with dots (tap a dot to jump). Nothing else.
   - Inside the card, top: two thin progress lines "Learn" / "Speak" (not tabs).
   - **Front (Learn):** phrase (large) + speaker icon (hear the phrase), meaning, "In the paragraph" sentence with the phrase highlighted,
     "Scene: …" with left-aligned dialogue (speaker name above, line below, Courier Prime) and a small "Listen" button.
     Bottom row: bookmark button (bottom-left) + primary "Flip to speak" (with flip icon). Tapping empty card space also flips.
   - **Back (Speak):** top row has bookmark + flip-back icons (top-right). Phrase name, "Reply 1 of 3".
     Yellow goal note: "Goal: use the phrase within 3 replies to complete it."
     Chat: AI coworker bubble (left), learner bubble (right), feedback bubble (green). Input: keyboard text box + send
     (voice/mic button can be a disabled placeholder in v2).
   - Swipe the card left/right = next/previous phrase. Small hint bottom-right: "Swipe for next ›".
   - 3D flip animation (~0.5s), turned off with prefers-reduced-motion.
4. **Your text tab** = the existing paste flow (paste text → find phrases → cards), restyled with the new tokens.
5. **Phrasebook tab** = the existing saved phrases list, restyled.

## Behavior rules
- Library cards come from a JSON file built from Jenny's approved paragraphs (see docs/content-plan.md). Credit Lenny's Podcast on every card.
- Speak in v2: reuse the existing /api/feedback endpoint (one reply → feedback). Multi-turn 3-reply chat comes later; show "Reply 1 of 3" but it's OK if only one reply is checked for now. Mark success when feedback is ok.
- Saving = the bookmark button (swiping no longer saves). Keep localStorage phrasebook and the known-phrases logic.
- PostHog: keep autocapture, masking and session recording exactly as they are (see AGENTS.md rule 7). Update custom events for the new flow
  (e.g. card_opened, phrase_flipped, phrase_saved, speak_checked, paragraph_completed) — numbers and labels only, never user text.
