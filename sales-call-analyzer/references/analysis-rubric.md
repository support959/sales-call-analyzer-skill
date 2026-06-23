# Analysis rubric — the method the report scores against

The operative version lives in `assets/app/prompts/analysis-prompt.md` — that's what the tool sends to
the model. This document explains it in human terms so you can customize safely. **If you change
scoring, edit the prompt file, not this one.**

The report scores a call against a **leadership-based sales/diagnostic method** (the skeleton below).
The guiding principle: the goal of the call is *not* to force a close — it's to help the lead take the
next right step, from a calm leadership stance. A call where the lead genuinely wasn't a fit and the
seller reflected that honestly (no push) is a *good* call even if nothing "closed".

## The seven scoring criteria (skeleton)

Each is scored 1–10 and must be backed by evidence from the transcript:

1. **מיינדסט מנהיגות (גישת הרווארד)** — a calm "examining fit" stance, not chasing/manipulating; the
   frame is "I'm here to help you to the right step", not "I must close".
2. **שלב החיבור והאג'נדה** — opened into what the lead wants from the call (no forced small talk) and
   set a clear agenda (seller leads with questions; ends by checking "can this help you?").
3. **חקירת עומק רגשי (שאלות העמקה)** — deepening questions that get the lead to say their pain and
   desire out loud and reach real emotional depth, not surface.
4. **בחינת התאמה** — surfaced the five fit signals: urgency to change ("burning building"), passion for
   big goals, helplessness/openness to help, time + ability to start now, openness to investment.
5. **הצגת ההצעה / הפגישה הראשונה** — offer tailored to the lead's exact words/pain, clear structure
   (diagnosis → an initial tool/value → a path for continued work), price stated with confidence then
   space, without over-explaining later stages.
6. **טיפול בחששות** — concerns handled from "the same side of the table"; distinguished real concerns
   (value, money) from smoke screens ("need to think", "need to consult", timing).
7. **סגירה וצעד הבא** — a clear, healthy next step that keeps momentum and focus on the next meeting.

## What the report returns

A single JSON object the page renders:

- `call_type`, `outcome`, `summary`.
- `focus_points` — the 1–2 most important things to fix next call. This is the heart of the method's
  feedback style, so the page shows it prominently. Keep it to 1–2.
- `insights` — the few things that decided the call.
- `scores` — the seven criteria above (exact names, in order), each with score, evidence, and a tip.
- `overall_score` — 0–100: how well the call helped the lead take the right step, per the method.
- `strengths`, `improvements` — improvements ranked most-impactful first.
- `objections` — each concern with a `type` (ערך / כסף / מסך עשן), how it was handled, and a better
  response next time.
- `follow_up_tasks` — concrete next actions for this lead, with priority.
- `full_report_markdown` — long, specific coach-style feedback that references moments in the call.

## The non-negotiables (keep these if you edit)

- **Grounding in evidence** — a score without a quote/paraphrase is a vibe, and vibes erode trust.
- **Long, specific, timestamped feedback** — the method's own call-review style: reference minutes or
  quote the moment, and end with 1–2 focus points. Generic notes don't help anyone improve.
- **Don't penalize an honest non-close** — if the lead wasn't a fit and the seller reflected that
  without pushing, that's the method working, not a failure.
- **No fabrication** — short/garbled/off-topic transcript → say so rather than inventing findings.
- **Hebrew, practical, kind** — a sharp but supportive coach, not a cold scorecard.

## Customizing — and the privacy line

The public skill ships the **skeleton** above (stage names + what each criterion checks), not the
verbatim scripts, exact opening lines, or word-for-word framing. That's deliberate: it keeps the
method's depth out of a public repo.

To run the analysis against the **full** method (verbatim scripts, exact wording, specific emphases),
paste those materials into the `## תוספת מתודולוגיה של הלקוח` section at the bottom of
`prompts/analysis-prompt.md`. That file stays on the local machine and is gitignored-by-default
guidance — it does not get published. Keep **exactly seven** criteria in the same order, or the page's
score list and the prompt drift apart. Don't rename the JSON fields — `public/app.js` reads them by name.
