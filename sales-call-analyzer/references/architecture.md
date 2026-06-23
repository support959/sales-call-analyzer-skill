# How the tool is wired

A deliberately tiny, zero-dependency Node app. One process does everything; the browser is just the
front end. Nothing is bundled, transpiled, or installed — it runs straight on Node 18+.

## The flow

```
browser (public/) ──POST /api/analyze──▶ server.mjs
   │  audio → base64, or pasted text                │
   │                                                 ├─ audio? → lib/transcribe.mjs → OpenAI Whisper → text
   │                                                 ├─ lib/analyze.mjs → Anthropic Messages API → JSON report
   ◀──────────── { transcript, report } ─────────────┘
   └─ app.js renders the report (scores, objections, tasks, full report)
```

## Files

| File | Role |
|------|------|
| `server.mjs` | The whole server: serves the page, routes `/api/analyze`, injects brand into the HTML. |
| `lib/env.mjs` | Reads `.env` into `process.env`. No `dotenv` dependency. |
| `lib/transcribe.mjs` | Audio buffer → text via OpenAI. Uses Node 18 global `fetch`/`FormData`/`Blob`. |
| `lib/analyze.mjs` | Transcript → structured report via Anthropic. Loads the prompt, parses JSON robustly. |
| `prompts/analysis-prompt.md` | The scoring rubric + output schema sent to the model. The "brain". |
| `public/index.html` · `app.js` · `style.css` | The Hebrew RTL page and report rendering. |
| `samples/sample-call-he.txt` | A fake Hebrew call so the tool can be tested without a recording. |
| `.env.example` | Template for keys and options. Copied to `.env`. |

## Why these choices

- **Zero dependencies** → no `npm install`, no lockfile drift, nothing to break on a client's machine.
  Everything used (`fetch`, `FormData`, `Blob`, `http`) is built into Node 18+.
- **Keys stay server-side.** The browser never sees a key — it posts audio/text to the local server,
  which holds the keys and calls OpenAI/Anthropic. This is why the page must not be exposed publicly
  without protecting the keys (see below).
- **Audio travels as base64 JSON**, not multipart, so the server parses a plain JSON body and forwards
  a clean `FormData` upload to OpenAI. Simpler and fewer edge cases than hand-parsing multipart.

## Hosting it (only if the user insists)

The safe default is **local only**. If the user wants colleagues to reach it:

- The keys must remain **server-side** (they already are) and must **never** be shipped to the browser.
- Put the page **behind a login / private network** — a key-bearing endpoint on the open web will get
  abused and run up the user's bill.
- Any small Node host works (a private VM, Render, Railway, Fly). Set the keys as the host's environment
  variables instead of a committed `.env`. Never commit `.env`.
- If they only need it for themselves, skip all of this and keep it local — it's simpler and safer.

## Known limits

- OpenAI transcription caps at **25 MB** per file → export long calls as mono MP3 ~64 kbps.
- The whole audio file is held in memory during a request (fine for one user on localhost; the request
  body is capped at 50 MB in `server.mjs`).
- Transcription quality follows recording quality — background noise hurts results more than any setting.
