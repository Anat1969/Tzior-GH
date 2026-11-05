// tzior-insight: ניסוח תובנה לגילוי של "ציור שמגלה חוזקה".
// Gemini החינמי (GEMINI_API_KEY) קודם, Claude (ANTHROPIC_API_KEY) רק כגיבוי.
// הקלט: שמות חוזקות ומספרים בלבד. הציור עצמו לא מגיע לכאן, ולכן מותר המסלול החינמי.
// ההוראה למודל לפי תקן הזיקוק: https://github.com/Anat1969/Claude-GH/blob/main/docs/ai-text-standard.md
import Anthropic from 'npm:@anthropic-ai/sdk'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const SYSTEM = `את/ה כותב/ת תובנה בעברית לאדם שצייר עכשיו ציור מונחה, ומחפש בו חוזקה וצל.
זקק, אל תתאר. עברית טבעית, קצרה ומקצועית, בפנייה ניטרלית (את/ה). בלי סימני קריאה, בלי אימוג'י, בלי מילים ריקות.
זו קריאה צורנית של קו, צבע, שטח וזמן, לא אבחון ולא פירוש של תוכן הציור. אל תנחש מה צויר.

מבנה קבוע:
1. insight: שורת תובנה עד 8 מילים, שמבטאת את העיקר. מסתיימת בנקודה. המושג המרכזי ב-**כוכביות כפולות**.
2. explanation: משפט הסבר אחד, עד 20 מילים, שמחבר את הסימן בציור לחוזקה ולצל. 2 עד 3 הבלטות ב-**כוכביות**: שם החוזקה, הצל, והמספר.
3. questions: שלוש שאלות שיחה פתוחות, כל אחת עד 16 מילים: על החוזקה ביום־יום, על הרגע שבו היא הופכת לצל, ועל החוזקה הרדומה.
4. haiku: הייקו בשלוש שורות קצרות, על הקו, האור והצל של הציור הזה. בלי כותרת.

עובדות: רק מה שמופיע בקלט. לא ממציאים נתונים, מספרים או שמות.`

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['insight', 'explanation', 'questions', 'haiku'],
  properties: {
    insight: { type: 'string' },
    explanation: { type: 'string' },
    questions: { type: 'array', items: { type: 'string' } },
    haiku: { type: 'array', items: { type: 'string' } },
  },
}
const G_SCHEMA = {
  type: 'OBJECT',
  required: ['insight', 'explanation', 'questions', 'haiku'],
  properties: {
    insight: { type: 'STRING' },
    explanation: { type: 'STRING' },
    questions: { type: 'ARRAY', items: { type: 'STRING' } },
    haiku: { type: 'ARRAY', items: { type: 'STRING' } },
  },
}

type Out = { insight: string; explanation: string; questions: string[]; haiku: string[] }

const MODELS = [...new Set([Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])]

async function viaGemini(key: string, user: string): Promise<Out> {
  let last: unknown
  for (const model of MODELS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: G_SCHEMA },
        }),
        signal: AbortSignal.timeout(20000),
      })
      if (!r.ok) throw Object.assign(new Error(`Gemini ${model} ${r.status}`), { status: r.status })
      const j = await r.json()
      const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
      return JSON.parse(text)
    } catch (err) {
      last = err
      const status = (err as { status?: number }).status
      if (status === 400 || status === 401 || status === 403) throw err
    }
  }
  throw last
}

async function viaClaude(key: string, user: string): Promise<Out> {
  const client = new Anthropic({ apiKey: key })
  const response = await client.messages.create({
    model: 'claude-sonnet-5-5',
    max_tokens: 1500,
    system: SYSTEM,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: user }],
  } as never)
  const text = (response.content as { type: string; text?: string }[]).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('')
  return JSON.parse(text)
}

// מגבלת קצב פשוטה לכל מופע: עד 30 בקשות בדקה
const hits: number[] = []

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST בלבד' }, 405)
  const now = Date.now()
  while (hits.length && now - hits[0] > 60000) hits.shift()
  if (hits.length >= 30) return json({ error: 'יותר מדי בקשות, נסו שוב בעוד דקה' }, 429)
  hits.push(now)

  let b: Record<string, any>
  try {
    b = await req.json()
  } catch {
    return json({ error: 'גוף בקשה לא תקין' }, 400)
  }
  const s = (v: unknown, n = 120) => String(v ?? '').slice(0, n)
  const user = [
    `משימת הציור: ${s(b.directive?.title)}. השאלה: ${s(b.directive?.question)}`,
    `החוזקה הבולטת: ${s(b.strength?.name)}. הסימן בציור: ${s(b.strength?.sign)}. המדד: ${s(b.strength?.measure)} ${s(b.strength?.value, 12)} ${s(b.strength?.unit, 12)}.`,
    b.shadow?.active
      ? `צל פעיל: ${s(b.shadow?.name)} (הצל של ${s(b.shadow?.of)}). הסימן בציור: ${s(b.shadow?.sign)}.`
      : `הצל הקרוב: ${s(b.shadow?.name)}, מה שקורה כש${s(b.shadow?.of)} נמתחת יותר מדי.`,
    b.dormant ? `חוזקה רדומה: ${s(b.dormant?.name)}. הסימן בציור: ${s(b.dormant?.sign)}.` : 'אין חוזקה רדומה בולטת.',
    `מתוך 12 מדדים: ${Number(b.counts?.strength) || 0} באזור החוזקה, ${Number(b.counts?.shadow) || 0} באזור הצל, ${Number(b.counts?.dormant) || 0} רדומים.`,
  ].join('\n')

  const gemini = Deno.env.get('GEMINI_API_KEY')?.trim()
  const claude = Deno.env.get('ANTHROPIC_API_KEY')?.trim()
  const errors: string[] = []
  for (const [label, key, run] of [['gemini', gemini, viaGemini], ['claude', claude, viaClaude]] as const) {
    if (!key) continue
    try {
      const out = await run(key, user)
      if (out?.insight && Array.isArray(out.questions)) return json({ ...out, by: label })
      errors.push(`${label}: תשובה חסרה`)
    } catch (err) {
      const status = (err as { status?: number }).status
      errors.push(status ? `${label} ${status}` : String((err as Error).message ?? err))
    }
  }
  return json({ error: errors.join(', ') || 'אין מפתח ניסוח' }, 502)
})
