// ניסוח התובנה: Gemini החינמי דרך פונקציית Edge, Claude רק כגיבוי, ובלי רשת: ניסוח מקומי מתבנית.
// לשרת עולים רק מספרים ושמות חוזקות. הציור עצמו לא נשלח לשום מקום.
import type { Revelation } from '../engine/reveal'
import type { Directive } from '../data/directives'
import type { AiText } from './store'

const FN = 'https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/tzior-insight'
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function localText(r: Revelation, d: Directive): AiText {
  const s = r.top.strength
  const sh = r.shadow.reading.strength.shadow
  const dm = r.dormant?.strength
  return {
    insight: `**${s.name}** מובילה את הקו.`,
    explanation: `${r.top.rule.sign.strength}, ${r.top.rule.label} **${r.top.value}${r.top.rule.unit === '%' ? '%' : ''}**, והצל הקרוב הוא **${sh.name}**${dm ? `, בעוד **${dm.name}** ממתינה` : ''}.`,
    questions: [
      `${d.question} איפה ה${s.name} שראית בדף פועלת אצלך גם ביום־יום?`,
      `מתי ה${s.name} נמתחת עד שהיא הופכת ל${sh.name}?`,
      dm ? `מה היה קורה בציור הבא, אילו ה${dm.name} הייתה מקבלת מקום?` : 'מה היית משנה בציור, אילו היית מצייר/ת אותו שוב מחר?',
    ],
    haiku: ['קו אחד נמתח', `${s.name} באור הדף`, `${sh.name} בשוליים`],
    by: 'local',
  }
}

export async function aiText(r: Revelation, d: Directive): Promise<AiText> {
  const payload = {
    directive: { title: d.title, question: d.question },
    strength: { name: r.top.strength.name, sign: r.top.rule.sign.strength, measure: r.top.rule.label, value: r.top.value, unit: r.top.rule.unit },
    shadow: { name: r.shadow.reading.strength.shadow.name, of: r.shadow.reading.strength.name, active: r.shadow.active, sign: r.shadow.active ? r.shadow.reading.rule.sign.shadow : '' },
    dormant: r.dormant ? { name: r.dormant.strength.name, sign: r.dormant.rule.sign.dormant } : null,
    counts: r.counts,
  }
  if (!ANON) return localText(r, d)
  try {
    const res = await fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(40000),
    })
    if (!res.ok) throw new Error(String(res.status))
    const j = await res.json()
    if (!j.insight || !Array.isArray(j.questions)) throw new Error('bad')
    return { insight: j.insight, explanation: j.explanation ?? '', questions: j.questions.slice(0, 3), haiku: Array.isArray(j.haiku) ? j.haiku.slice(0, 3) : [], by: j.by === 'claude' ? 'claude' : 'gemini' }
  } catch {
    return localText(r, d)
  }
}
