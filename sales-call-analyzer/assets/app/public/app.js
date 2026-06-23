const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

let mode = 'audio';
let audioFile = null;

// Pull config (brand + whether audio is wired up) so the page guides correctly.
fetch('/config.json')
  .then((r) => r.json())
  .then((cfg) => { if (cfg && cfg.audioEnabled === false) $('#audioHint').hidden = false; })
  .catch(() => {});

// Tabs
$$('.tab').forEach((t) =>
  t.addEventListener('click', () => {
    mode = t.dataset.tab;
    $$('.tab').forEach((x) => x.classList.toggle('is-active', x === t));
    $$('.pane').forEach((p) => (p.hidden = p.dataset.pane !== mode));
    hideErr();
  })
);

// File drop / pick
const drop = $('#drop');
const audioInput = $('#audioInput');
['dragover', 'dragenter'].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); })
);
['dragleave', 'drop'].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); })
);
drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });
audioInput.addEventListener('change', () => { if (audioInput.files[0]) setFile(audioInput.files[0]); });

function setFile(f) {
  audioFile = f;
  $('#fileName').textContent = `📎 ${f.name} (${(f.size / 1048576).toFixed(1)}MB)`;
  $('#fileName').hidden = false;
  if (f.size > 25 * 1048576) showErr('הקובץ מעל 25MB — ייצא כ-MP3 מונו ~64kbps ונסה שוב.');
  else hideErr();
}

// Sample
$('#useSample').addEventListener('click', async () => {
  const t = await fetch('/sample').then((r) => r.text()).catch(() => '');
  $('#textInput').value = t;
});

// Analyze
$('#analyzeBtn').addEventListener('click', run);
async function run() {
  hideErr();
  let payload;
  if (mode === 'text') {
    const transcript = $('#textInput').value.trim();
    if (!transcript) return showErr('אין טקסט לניתוח. הדביקו תמליל או טענו שיחת דוגמה.');
    payload = { kind: 'text', transcript };
    setStatus('מנתח את השיחה...');
  } else {
    if (!audioFile) return showErr('בחרו קובץ הקלטה, או עברו ללשונית "טקסט".');
    setStatus('ממיר הקלטה לטקסט ומנתח... זה יכול לקחת דקה.');
    const dataBase64 = await fileToBase64(audioFile);
    payload = { kind: 'audio', filename: audioFile.name, mime: audioFile.type, dataBase64 };
  }
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'שגיאה לא צפויה');
    renderReport(data.report, data.transcript);
  } catch (e) {
    showErr(String(e.message || e));
  } finally {
    clearStatus();
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function setStatus(t) { $('#status').hidden = false; $('#statusText').textContent = t; $('#analyzeBtn').disabled = true; }
function clearStatus() { $('#status').hidden = true; $('#analyzeBtn').disabled = false; }
function showErr(t) { const e = $('#err'); e.textContent = t; e.hidden = false; }
function hideErr() { $('#err').hidden = true; }

function scoreColor(n) { // n on a 1–10 scale
  if (n >= 8) return '#2e7d32';
  if (n >= 6) return '#b8902e';
  if (n >= 4) return '#e08a00';
  return '#c0392b';
}

function renderReport(r, transcript) {
  if (!r) return showErr('לא התקבל דוח.');
  const el = $('#report');
  el.hidden = false;

  const overall = Number(r.overall_score) || 0;
  const scores = Array.isArray(r.scores) ? r.scores : [];
  const focus = Array.isArray(r.focus_points) ? r.focus_points : [];
  const insights = Array.isArray(r.insights) ? r.insights : [];
  const strengths = Array.isArray(r.strengths) ? r.strengths : [];
  const improvements = Array.isArray(r.improvements) ? r.improvements : [];
  const objections = Array.isArray(r.objections) ? r.objections : [];
  const tasks = Array.isArray(r.follow_up_tasks) ? r.follow_up_tasks : [];

  el.innerHTML = `
    <div class="report-head">
      <div class="gauge" style="--c:${scoreColor(overall / 10)}"><span>${overall}</span><small>מתוך 100</small></div>
      <div class="report-head-text">
        <div class="badges">
          <span class="badge">${esc(r.call_type || 'שיחה')}</span>
          ${r.outcome ? `<span class="badge badge-out">${esc(r.outcome)}</span>` : ''}
        </div>
        <p class="summary">${esc(r.summary || '')}</p>
      </div>
    </div>

    ${focus.length ? `<div class="focus"><div class="focus-title">🎯 נקודות פוקוס לשיחה הבאה</div><ul>${focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}

    ${insights.length ? `<h3>תובנות מפתח</h3><ul class="bullets">${insights.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}

    <h3>ציוני איכות</h3>
    <div class="scores">${scores.map(scoreRow).join('')}</div>

    <div class="two-col">
      ${strengths.length ? `<div><h3>מה עבד</h3><ul class="bullets good">${strengths.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
      ${improvements.length ? `<div><h3>מה לשפר</h3><ol class="bullets fix">${improvements.map((i) => `<li>${esc(i)}</li>`).join('')}</ol></div>` : ''}
    </div>

    ${objections.length ? `<h3>התנגדויות</h3>${objections.map((o) => `
      <div class="obj">
        <p class="obj-q">❓ ${esc(o.objection || '')}${o.type ? ` <span class="obj-type">${esc(o.type)}</span>` : ''}</p>
        <p><b>איך טופל:</b> ${esc(o.how_handled || '')}</p>
        <p class="obj-better"><b>תשובה טובה יותר:</b> ${esc(o.better_response || '')}</p>
      </div>`).join('')}` : ''}

    ${tasks.length ? `<h3>משימות המשך</h3>${tasks.map((t) => `
      <div class="task pri-${prioClass(t.priority)}">
        <span class="pri">${esc(t.priority || '')}</span>
        <div><p class="task-t">${esc(t.task || '')}</p><p class="task-w">${esc(t.why || '')}</p></div>
      </div>`).join('')}` : ''}

    <div class="report-actions">
      <button class="ghost" type="button" onclick="window.print()">🖨️ הדפס / שמור כ-PDF</button>
      <button class="ghost" type="button" id="copyBtn">📋 העתק דוח</button>
      ${r.full_report_markdown ? `<details class="raw"><summary>הצג דוח מלא (טקסט)</summary><pre>${esc(r.full_report_markdown)}</pre></details>` : ''}
      ${transcript ? `<details class="raw"><summary>הצג תמליל</summary><pre>${esc(transcript)}</pre></details>` : ''}
    </div>
  `;

  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(r.full_report_markdown || el.innerText).then(() => {
        copyBtn.textContent = '✓ הועתק';
      }).catch(() => {});
    });
  }
  el.scrollIntoView({ behavior: 'smooth' });
}

function scoreRow(s) {
  const n = Number(s.score) || 0;
  return `<div class="score-row">
    <div class="score-top"><span class="crit">${esc(s.criterion || '')}</span><span class="num" style="color:${scoreColor(n)}">${n}/10</span></div>
    <div class="bar"><i style="width:${n * 10}%;background:${scoreColor(n)}"></i></div>
    ${s.evidence ? `<p class="ev">"${esc(s.evidence)}"</p>` : ''}
    ${s.tip ? `<p class="tip">💡 ${esc(s.tip)}</p>` : ''}
  </div>`;
}

function prioClass(p) {
  if (p && p.includes('גבוה')) return 'hi';
  if (p && p.includes('בינ')) return 'mid';
  return 'lo';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
