// server.mjs — the whole tool, in one small Node process. No third-party packages.
// Serves the page, transcribes audio (OpenAI), analyzes the transcript (Anthropic),
// and returns the report. Run with:  node server.mjs   (or  npm start)
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { loadEnv } from './lib/env.mjs';
import { transcribe } from './lib/transcribe.mjs';
import { analyze } from './lib/analyze.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv(join(__dirname, '.env'));

const PORT = parseInt(process.env.PORT || '4848', 10);
const PUBLIC_DIR = join(__dirname, 'public');
const MAX_BODY = 50 * 1024 * 1024; // 50MB ceiling on the incoming request

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const BRAND = {
  name: (process.env.BRAND_NAME || 'מנתח שיחות מכירה').trim(),
  color: (process.env.BRAND_COLOR || '#b8902e').trim(),
};

const server = http.createServer(async (req, res) => {
  try {
    const path = (req.url || '/').split('?')[0];
    if (req.method === 'GET' && (path === '/' || path === '/index.html')) return serveIndex(res);
    if (req.method === 'GET' && path === '/config.json') {
      return sendJson(res, 200, { brand: BRAND, audioEnabled: !!(process.env.OPENAI_API_KEY || '').trim() });
    }
    if (req.method === 'GET' && path === '/sample') return serveSample(res);
    if (req.method === 'POST' && path === '/api/analyze') return handleAnalyze(req, res);
    if (req.method === 'GET') return serveStatic(path, res);
    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    sendJson(res, 500, { error: String((err && err.message) || err) });
  }
});

function serveIndex(res) {
  let html = readFileSync(join(PUBLIC_DIR, 'index.html'), 'utf8');
  html = html.replace(/%%BRAND_NAME%%/g, escapeHtml(BRAND.name)).replace(/%%BRAND_COLOR%%/g, BRAND.color);
  res.writeHead(200, { 'content-type': MIME['.html'] });
  res.end(html);
}

function serveStatic(path, res) {
  const safe = path.replace(/\.\./g, '');
  const filePath = join(PUBLIC_DIR, safe);
  if (!existsSync(filePath)) return sendJson(res, 404, { error: 'not found' });
  res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
}

function serveSample(res) {
  const p = join(__dirname, 'samples', 'sample-call-he.txt');
  if (!existsSync(p)) return sendJson(res, 404, { error: 'no sample' });
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(readFileSync(p));
}

function handleAnalyze(req, res) {
  let size = 0;
  const chunks = [];
  let aborted = false;
  req.on('data', (c) => {
    if (aborted) return;
    size += c.length;
    if (size > MAX_BODY) {
      aborted = true;
      sendJson(res, 413, { error: 'הקובץ גדול מדי. ייצא הקלטה כ-MP3 מונו ~64kbps ונסה שוב.' });
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on('end', async () => {
    if (aborted) return;
    try {
      const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      let transcript = '';
      if (payload.kind === 'text') {
        transcript = (payload.transcript || '').trim();
        if (!transcript) return sendJson(res, 400, { error: 'לא הוזן טקסט לניתוח.' });
      } else if (payload.kind === 'audio') {
        const buf = Buffer.from(payload.dataBase64 || '', 'base64');
        if (!buf.length) return sendJson(res, 400, { error: 'קובץ האודיו ריק או לא תקין.' });
        transcript = await transcribe(buf, payload.filename, payload.mime);
      } else {
        return sendJson(res, 400, { error: 'בקשה לא תקינה.' });
      }
      const report = await analyze(transcript);
      sendJson(res, 200, { transcript, report });
    } catch (err) {
      sendJson(res, 500, { error: String((err && err.message) || err) });
    }
  });
}

function sendJson(res, status, obj) {
  if (res.headersSent) return;
  res.writeHead(status, { 'content-type': MIME['.json'] });
  res.end(JSON.stringify(obj));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

server.listen(PORT, () => {
  console.log(`\n  ✓ ${BRAND.name} פועל בכתובת:  http://localhost:${PORT}`);
  console.log('  (לעצירה: Ctrl+C)\n');
});
