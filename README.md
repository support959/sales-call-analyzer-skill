# Sales Call Analyzer — סקיל ל-Claude Code

סקיל ל-Claude Code שמקים על המחשב שלך **דף קטן** שאליו זורקים הקלטת שיחת מכירה / אבחון —
ומקבלים דוח ניתוח מלא בעברית:

- 📋 **סיכום + תובנות** — מה קרה בשיחה והדברים שבאמת קבעו אותה
- 📊 **ציון איכות** — ציון לכל חלק בשיחה (פתיחה, גילוי צורך, ערך, התנגדויות, סגירה), מעוגן בציטוטים
- ✅ **משימות המשך** — מה לעשות עם הליד הזה עכשיו
- 📄 **דוח מלא** — הכל יחד, מוכן להצגה

הסקיל תומך ב-3 דרכי קלט: **הקלטת אודיו** (מתומללת אוטומטית), **קובץ תמליל מוכן**, או **הדבקת טקסט**.

---

## התקנה (אצל הלקוח)

הסקיל הוא תיקייה אחת. כדי להתקין, מעתיקים את התיקייה `sales-call-analyzer` אל תיקיית הסקילים של
Claude Code:

- **Windows:** `C:\Users\<שם המשתמש>\.claude\skills\`
- **macOS / Linux:** `~/.claude/skills/`

כך שבסוף יהיה קובץ בכתובת `…/.claude/skills/sales-call-analyzer/SKILL.md`.

**הדרך הכי קלה:** לפתוח את Claude Code בתיקייה הזו ולכתוב:
> "תתקין את הסקיל `sales-call-analyzer` בתיקיית הסקילים שלי"

ו-Claude Code יעתיק את התיקייה למקום הנכון.

---

## שימוש

אחרי ההתקנה, פותחים Claude Code ופשוט מבקשים, למשל:

> "תקים לי את מנתח השיחות"  ·  "אני רוצה לנתח שיחת מכירה"  ·  "נתח לי את ההקלטה הזו"

הסקיל יידלק לבד, ילווה אותך בהקמה (פעם אחת), ואז תהיה לך כתובת מקומית שאליה זורקים שיחות ומקבלים דוח.

### מה צריך פעם אחת

- **Node.js 18+** — מ-https://nodejs.org (כפתור LTS)
- **מפתח Anthropic** — חובה, מ-https://console.anthropic.com ← API Keys
- **מפתח OpenAI** — רק אם רוצים לנתח הקלטות אודיו (לא צריך אם מדביקים תמליל), מ-https://platform.openai.com/api-keys

המפתחות נשמרים **רק במחשב שלך** ולא נשלחים לשום מקום מלבד שירותי התמלול והניתוח שלך.

---

## פרטיות

הכל רץ מקומית. ההקלטה/התמליל נשלחים רק ל-OpenAI (תמלול) ול-Anthropic (ניתוח), עם המפתחות של המשתמש.
קובצי `.env` (מפתחות) והקלטות לא נכנסים לגיט (מוגדר ב-`.gitignore`).

---

## מבנה התיקייה

```
sales-call-analyzer/
├── SKILL.md                      ← מה Claude Code קורא ועושה לפיו
├── references/
│   ├── analysis-rubric.md        ← הקריטריונים לציון + איך להתאים אישית
│   └── architecture.md           ← איך הכלי בנוי + הקמה בטוחה אם רוצים לארח
└── assets/app/                   ← הכלי עצמו, מוכן להרצה (זה מה שמותקן אצל המשתמש)
    ├── server.mjs                ← הדף + התמלול + הניתוח, בלי תלויות חיצוניות
    ├── prompts/analysis-prompt.md← ה"מוח": רובריקת הניתוח ומבנה הדוח
    ├── public/                   ← הדף עצמו (עברית, RTL)
    ├── samples/                  ← שיחת דוגמה לבדיקה בלי הקלטה
    └── .env.example              ← תבנית המפתחות וההגדרות
```

---

## English (quick)

A Claude Code skill that sets up a small **local** page where you drop a sales / diagnostic call
recording and get back a full Hebrew analysis report (summary + insights, quality score, objections,
follow-up tasks). Audio is transcribed with the user's own OpenAI key; analysis runs on the user's own
Anthropic key. Transcript files and pasted text work too — no audio required.

**Install:** copy the `sales-call-analyzer/` folder into `~/.claude/skills/` (Windows:
`C:\Users\<you>\.claude\skills\`). Then open Claude Code and say "set up the sales call analyzer".

**Needs:** Node 18+, an Anthropic API key (always), an OpenAI API key (only for audio). Everything runs
locally; keys never leave the machine except to those two services.
