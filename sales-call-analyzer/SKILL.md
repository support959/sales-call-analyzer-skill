---
name: sales-call-analyzer
description: >-
  Set up and run a small local web tool that turns a sales or diagnostic call recording into a
  full Hebrew analysis report — a short summary with insights, a quality score across the parts
  of the call, the objections that came up, and concrete follow-up tasks. Use this skill whenever
  the user wants to analyze sales calls, diagnostic / discovery / "שיחת אבחון" calls, or coaching
  consultations; asks to "build a page where I drop a call recording and get a report"; wants to
  transcribe and score a call; or says things like "נתח לי שיחת מכירה", "תבנה לי כלי שמנתח הקלטות
  שיחות", "אני רוצה לנתח שיחות אבחון", "ציון לשיחת מכירה", "תקים לי מנתח שיחות", "analyze my sales
  call", or "score this discovery call". Trigger even if the user only drops an audio file or a
  call transcript and asks "what could I have done better" — set up the analyzer and produce the
  report. The tool transcribes audio with the user's own OpenAI key and analyzes with the user's
  own Anthropic key, and it also accepts a ready transcript file or pasted text (no audio needed).
---

# Sales Call Analyzer — setup & run

## What this skill does

This skill helps you stand up a **small local web page** on the user's own machine. The user drops
in a recording of a sales call or a diagnostic ("אבחון") call, and the page hands back a clean
Hebrew report:

1. **סיכום + תובנות** — what happened on the call and the few things that mattered most.
2. **ציון איכות** — a score for each part of the call (opening, discovery, value, objections,
   close) and an overall score, each backed by evidence from what was actually said.
3. **משימות המשך** — concrete next actions for this specific lead.
4. **דוח מלא** — everything together, presentation-ready.

The page runs **locally** on the user's machine. Audio is transcribed with the user's **own OpenAI
key**; the analysis is written with the user's **own Anthropic key**. Nothing is sent anywhere
else, and the recording never leaves the machine except to those two services for processing.

You are not writing this app from scratch — a complete, tested version already ships inside this
skill at `assets/app/`. Your job is to **install it, wire in the user's keys, run it, and prove it
works** with a real or sample call. Doing it from the bundled template (instead of hand-rolling it)
is what makes every install identical and reliable.

## Who you're talking to

The person running this is often **not a developer**. Explain things by what they will *see and do*,
not by the plumbing. Avoid words like "server", "endpoint", "env var", "API" when a plain phrase
works ("the page", "where the page runs", "your secret key"). Keep it in Hebrew if they write in
Hebrew. When you need a key from them, tell them exactly where to get it and that it stays on their
computer.

## What the user needs (tell them up front)

- **Node.js 18 or newer** — this is what runs the page. If `node --version` fails or prints a number
  below 18, point them to https://nodejs.org (the "LTS" button) and have them install it, then retry.
- **An Anthropic API key** (for the analysis) — from https://console.anthropic.com → *API Keys*.
  Required for every report.
- **An OpenAI API key** (only if they want to drop in *audio*) — from
  https://platform.openai.com/api-keys. **Not needed** if they will paste text or hand you a
  transcript file. Say so, so audio-shy users aren't blocked.

These keys are pasted into a local settings file and **never leave the machine** except to call the
respective service. Reassure the user of this — it's usually their first worry.

## Workflow

Follow these steps in order. Don't dump all of it on the user at once — walk them through it.

### Step 1 — Confirm what they have and what they want

Ask (or infer from what they already gave you):
- Do they have an **audio recording**, a **transcript file**, or do they want to **paste text**?
  This decides whether they need the OpenAI key.
- Roughly what kind of call is it — a sales pitch, a discovery/diagnostic call, a follow-up? The
  report adapts, but it helps to know.
- Optional: do they have their **own call methodology or script** (e.g. their objection-handling
  playbook)? If yes, you can fold it into the scoring — see Step 3.

### Step 2 — Put the tool in place

1. Check Node: run `node --version`. If it's missing or < 18, stop and help them install it first.
2. Pick a folder for the tool. Default to `./sales-call-analyzer-app` in the current directory unless
   the user wants it elsewhere. Tell them where it's going.
3. **Copy the entire `assets/app/` folder from this skill into that target folder.** Copy it whole —
   don't recreate the files by hand, and don't skip the `public/`, `lib/`, `prompts/`, or `samples/`
   subfolders. (Use whatever copy command fits the platform: `cp -r` on macOS/Linux, `Copy-Item -Recurse`
   on Windows PowerShell.)

There is **nothing to install** — the tool has zero third-party dependencies and runs straight on
Node. That's deliberate: no `npm install`, no lockfiles, nothing to break.

### Step 3 — Settings & keys

1. In the target folder, copy `.env.example` to `.env`.
2. Fill in the keys the user gave you:
   - `ANTHROPIC_API_KEY=` — always.
   - `OPENAI_API_KEY=` — only if they'll use audio. Leave blank otherwise.
3. Leave the model defaults as they are unless the user asks for deeper (and pricier) analysis — see
   the comments in `.env.example`. The analysis defaults to a strong, cost-sensible model.
4. **Optional branding:** set `BRAND_NAME` and `BRAND_COLOR` so the page carries the user's name and
   color instead of the neutral default.
5. **Optional custom methodology:** if the user pasted their own call playbook in Step 1, append it to
   `prompts/analysis-prompt.md` under the clearly-marked `## תוספת מתודולוגיה של הלקוח` section at the
   bottom of that file. Keep the existing schema and instructions intact — you're adding their
   emphasis, not replacing the rubric. See `references/analysis-rubric.md` for how the scoring is
   structured before you touch it.

**Never** print a key back to the screen after they give it, and **never** commit `.env` to git — the
bundled `.gitignore` already excludes it. If you ever set this up inside a git repo, double-check
`.env` is ignored before any commit.

### Step 4 — Run it and prove it works

1. From the target folder, start it: `npm start` (or `node server.mjs`).
2. It prints a local address (default `http://localhost:4848`). Open it in a browser.
3. **Test it for real before you call this done.** If they don't have a recording handy, the tool
   ships with `samples/sample-call-he.txt` — a short fake Hebrew sales call. Paste it into the page's
   text box (or drop the file) and run it. Confirm a full report comes back with a score, objections,
   and follow-up tasks.
4. If audio: have them drop a real recording. Watch for the 25 MB ceiling — see Troubleshooting.

Don't ask the user to "verify it works" for you. Run the sample yourself, read the report it produces,
and only then tell them it's ready — and show them what a report looks like.

### Step 5 — Day-to-day use & (optional) sharing

- **Everyday use:** start it with `node server.mjs`, open the page, drop a call, read the report. That's
  the whole loop. Each report costs a little (their own OpenAI + Anthropic usage) — a typical call is a
  few cents.
- **Keep it local by default.** Because the keys live on the machine, the simplest and safest setup is
  to run it locally and not expose it to the internet. If the user insists on hosting it so colleagues
  can reach it, read `references/architecture.md` first — keys must stay server-side and the page must
  be behind a login. Don't put a key-bearing page on the open web.

## The analysis quality bar

The report scores a call against a **leadership-based sales/diagnostic method** (seven criteria —
leadership mindset, connection + agenda, emotional-depth questions, fit examination, the first-meeting
offer, objection handling, and the next step). The operative rubric + output shape live in
`prompts/analysis-prompt.md`; `references/analysis-rubric.md` explains it in human terms. The
non-negotiables, worth keeping if you ever edit them:

- **Every score is grounded in what was actually said** — a quote or close paraphrase, never a vibe.
- **Long, specific, timestamped feedback ending in 1–2 focus points** — reference the minute or quote
  the moment ("when she said 'I start and quit' — that was the moment to dig into urgency"). Generic
  notes don't help anyone improve.
- **Don't penalize an honest non-close.** If the lead wasn't a fit and the seller reflected that without
  pushing, that's the method working — score it well.
- **No fabrication.** Short, garbled, or non-sales transcript → say so plainly instead of inventing.
- **Hebrew, practical, kind.** The reader is a therapist/coach who just got judged on their selling —
  a sharp but supportive coach, not a scorecard.

The public skill ships the **skeleton** of the method (criteria + what each checks), not the verbatim
scripts. To analyze against the full method (exact wording, scripts), paste those materials into the
`## תוספת מתודולוגיה של הלקוח` section at the bottom of `prompts/analysis-prompt.md` — that file stays
on the local machine and is not published.

## Troubleshooting

- **`node` not found / version < 18** → install Node LTS from https://nodejs.org, reopen the terminal,
  retry. The global `fetch`/`FormData` the tool relies on need Node 18+.
- **"missing ANTHROPIC_API_KEY" / "missing OPENAI_API_KEY"** → the `.env` file is missing the key or
  the app was started from the wrong folder. Confirm `.env` sits next to `server.mjs` and was filled in.
- **Audio rejected / "file too large"** → OpenAI's transcription caps at 25 MB. Have them export the
  recording as **mono MP3 at ~64 kbps** (most editors and even WhatsApp voice notes are already small
  enough). A 40-minute call at that setting is well under the limit.
- **Hebrew transcript looks wrong** → confirm `TRANSCRIBE_LANGUAGE=he` in `.env`. For heavy accents or
  background noise, a cleaner recording beats any setting.
- **Report came back thin** → usually the transcript is too short or the call wasn't really a sales
  call. That's the tool being honest, not broken. For deeper analysis on a real call, switch
  `ANALYSIS_MODEL` to the opus model noted in `.env.example`.

## Reference files

- `references/analysis-rubric.md` — what each score means and how to safely customize the scoring to a
  user's own methodology. Read this before editing the prompt.
- `references/architecture.md` — how the tool is wired (page → transcribe → analyze → report), the
  files involved, and the rules for hosting it safely if the user ever wants to.
- `assets/app/` — the complete, ready-to-run tool. This is what you copy in Step 2.
