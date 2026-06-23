// transcribe.mjs — turn an audio buffer into text via OpenAI's transcription API.
// Uses Node 18+ globals (fetch, FormData, Blob) — no third-party packages.

export async function transcribe(buffer, filename, mimeType) {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    throw new Error(
      'חסר OPENAI_API_KEY בקובץ .env — נדרש רק לניתוח הקלטות. אפשר במקום זאת להדביק תמליל כטקסט.'
    );
  }

  const model = (process.env.TRANSCRIBE_MODEL || 'whisper-1').trim();
  const language = (process.env.TRANSCRIBE_LANGUAGE || 'he').trim();

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType || 'application/octet-stream' }), filename || 'call.mp3');
  form.append('model', model);
  if (language) form.append('language', language);
  form.append('response_format', 'text');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    if (res.status === 401) throw new Error('מפתח ה-OpenAI שגוי או חסר הרשאה (401). בדוק את OPENAI_API_KEY ב-.env.');
    if (res.status === 413) throw new Error('ההקלטה גדולה מדי (מעל 25MB). ייצא כ-MP3 מונו ~64kbps ונסה שוב.');
    throw new Error(`התמלול נכשל (${res.status}). ${detail}`);
  }

  // response_format=text → the body is the transcript itself
  const text = await res.text();
  return text.trim();
}
