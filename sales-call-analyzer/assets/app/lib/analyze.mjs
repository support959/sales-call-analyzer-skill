// analyze.mjs — send a transcript to Anthropic and get back the structured report JSON.
// Uses Node 18+ global fetch — no third-party packages.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, '..', 'prompts', 'analysis-prompt.md');

export async function analyze(transcript) {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) {
    throw new Error('חסר ANTHROPIC_API_KEY בקובץ .env (משיגים אותו ב-console.anthropic.com ← API Keys).');
  }

  const model = (process.env.ANALYSIS_MODEL || 'claude-sonnet-4-6').trim();
  const maxTokens = parseInt(process.env.ANALYSIS_MAX_TOKENS || '4096', 10);
  const instructions = readFileSync(PROMPT_PATH, 'utf8');

  const body = {
    model,
    max_tokens: maxTokens,
    system: instructions,
    messages: [
      {
        role: 'user',
        content:
          'להלן תמליל השיחה לניתוח. החזר JSON תקין אחד בלבד לפי המבנה שהוגדר, בלי טקסט נוסף.\n\n' +
          `<תמליל>\n${transcript}\n</תמליל>`,
      },
    ],
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    if (res.status === 401) throw new Error('מפתח ה-Anthropic שגוי או חסר הרשאה (401). בדוק את ANTHROPIC_API_KEY ב-.env.');
    if (res.status === 429) throw new Error('יותר מדי בקשות / חריגה ממכסה (429). נסה שוב בעוד רגע.');
    throw new Error(`הניתוח נכשל (${res.status}). ${detail}`);
  }

  const data = await res.json();
  const text = (data?.content || []).map((b) => b.text || '').join('').trim();
  return parseReport(text);
}

// The prompt asks for raw JSON, but be forgiving: strip code fences and grab the outermost object.
function parseReport(text) {
  let t = (text || '').trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t);
  } catch {
    throw new Error('לא ניתן היה לפענח את הניתוח כ-JSON. ייתכן שהתמליל קצר/לא ברור מדי — נסה שוב.');
  }
}
