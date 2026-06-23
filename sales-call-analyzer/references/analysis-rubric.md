# Analysis rubric — what the report measures and how to customize it

The operative version of all of this lives in `assets/app/prompts/analysis-prompt.md` — that's the
file the tool actually sends to the model. This document explains it in human terms so you can
customize safely. **If you change scoring, edit the prompt file, not this one.**

## The seven scoring criteria

Each is scored 1–10 and must be backed by evidence from the transcript:

1. **פתיחה ויצירת חיבור** — did a human connection and trust form before diving in?
2. **גילוי צורך וכאב** — how deeply did they explore the lead's situation, pain, and goal?
3. **הקשבה ואמפתיה** — talk/listen ratio, reflection, letting the lead lead.
4. **הצגת הפתרון והערך** — did they tie the solution to the *specific* pain raised, not a generic pitch?
5. **טיפול בהתנגדויות** — did they surface objections (price, time, doubt) and soften them without pushing?
6. **סגירה וקריאה לפעולה** — was there a clear, committed next step (a meeting booked, a decision framed)?
7. **בהירות ההצעה והמחיר** — was the offer and price delivered with confidence and clarity?

## What the report returns

A single JSON object the page renders into the report:

- `call_type`, `outcome` — quick classification.
- `summary` — 2–4 sentences.
- `insights` — the few things that actually decided the call.
- `scores` — the seven criteria above, each with a 1–10 score, evidence, and one tip.
- `overall_score` — 0–100 overall quality / likelihood-to-close read.
- `strengths`, `improvements` — improvements ranked most-impactful first.
- `objections` — each objection, how it was handled, and a better response next time.
- `follow_up_tasks` — concrete next actions for this specific lead, with priority.
- `full_report_markdown` — everything combined, presentation-ready.

## The non-negotiables (keep these if you edit)

- **Grounding in evidence.** A score without a quote/paraphrase is a vibe, and vibes erode trust in the
  whole report. This is the single most important rule.
- **Specific, ranked improvements.** "Open by naming the pain she mentioned in minute 2" beats "build
  rapport". People can act on the former.
- **No fabrication.** Short, garbled, or off-topic transcript → the report says so rather than inventing
  findings. A confidently-wrong report is worse than an honest "not enough here".
- **Hebrew, practical, kind.** The reader just got graded on their selling. Sharp but supportive coach,
  not a cold scorecard.

## Customizing to a user's own methodology

If the user has their own sales/diagnostic playbook, you have two safe levers:

1. **Add emphasis without breaking structure (recommended).** Paste their methodology into the
   `## תוספת מתודולוגיה של הלקוח` section at the bottom of `prompts/analysis-prompt.md`. It gets extra
   weight in the analysis but doesn't replace the seven criteria or the JSON shape — so the page keeps
   rendering correctly.

2. **Reframe a criterion.** If their world uses different language (e.g. they call discovery "מיפוי"),
   you can rename a criterion's label in the prompt. Keep it to **exactly seven** criteria in the same
   order, or the page's score list and the prompt will drift apart.

Avoid changing the JSON field names or the number of criteria — the page (`public/app.js`) reads those
fields by name and expects seven scores. If a user genuinely needs a different shape, update both the
prompt and the renderer together, and re-test with the sample call.
