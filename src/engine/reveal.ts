// מהמדד לחוזקה: מודל "שביל הזהב" של שימוש חסר, מיטבי ועודף בחוזקות
// (Niemiec, R. M., 2019, Finding the golden mean: the overuse, underuse, and optimal use of character strengths,
// Counselling Psychology Quarterly 32(3-4)). כל מדד בציור נקרא על סקאלה של שלושה אזורים:
// רדום (שימוש חסר), חוזקה (שימוש מיטבי) וצל (שימוש עודף). הספים הם כללי עבודה של הכלי, גלויים בדף השיטה.
import type { Measures } from './measure'
import { strengthById, type Strength } from '../data/strengths'
import type { Directive } from '../data/directives'

export type Zone = 'dormant' | 'strength' | 'shadow'

export type Rule = {
  id: string
  measure: keyof Measures
  label: string // מה נמדד, בשפה פשוטה
  unit: string
  lo: number // מתחת: רדום
  hi: number // מעל: צל
  max: number // קצה הסקאלה בתצוגה
  strengthId: number
  feats: string // הפריט ב-FEATS או בתהליך שהמדד מקרב
  sign: { dormant: string; strength: string; shadow: string } // מה רואים בציור בכל אזור
  why: string // הכלל: למה המדד קשור לחוזקה
}

export const RULES: Rule[] = [
  { id: 'space', measure: 'coverage', label: 'שטח הדף שנוצל', unit: '%', lo: 8, hi: 65, max: 100, strengthId: 9, feats: 'Space', sign: { dormant: 'הדף כמעט ריק', strength: 'הציור תופס את מקומו בדף', shadow: 'הדף מלא עד הקצה, בלי מקום לנשום' }, why: 'מילוי הדף מבטא אנרגיה ונוכחות. מילוי מוחלט מבטא דחיסות שאין בה מנוחה.' },
  { id: 'time', measure: 'activeSec', label: 'זמן ציור פעיל', unit: 'שנ׳', lo: 30, hi: 600, max: 900, strengthId: 7, feats: 'Implied Energy', sign: { dormant: 'הציור הסתיים מהר', strength: 'עבודה רציפה עד סיום', shadow: 'עבודה שלא נגמרת' }, why: 'משך העבודה מבטא מחויבות לסיום. משך ארוך מאוד מבטא קושי לשחרר.' },
  { id: 'latency', measure: 'firstStrokeSec', label: 'זמן עד הקו הראשון', unit: 'שנ׳', lo: 2, hi: 30, max: 60, strengthId: 18, feats: 'תהליך', sign: { dormant: 'קפיצה מיידית לדף', strength: 'רגע של שקילה לפני הקו', shadow: 'היסוס ארוך לפני ההתחלה' }, why: 'ההשהיה לפני הקו הראשון היא רגע השקילה. השהיה ארוכה מאוד היא קיפאון.' },
  { id: 'speed', measure: 'speed', label: 'מהירות הקו', unit: 'פ׳/שנ׳', lo: 200, hi: 1600, max: 2400, strengthId: 6, feats: 'Line Quality', sign: { dormant: 'קו איטי וזהיר', strength: 'קו נחרץ ובטוח', shadow: 'קו חפוז, בלי עצירה' }, why: 'מהירות הקו מבטאת נחרצות. מהירות קיצונית מבטאת תנועה בלי בקרה.' },
  { id: 'colors', measure: 'colorCount', label: 'מספר הגוונים', unit: 'גוונים', lo: 2, hi: 7, max: 12, strengthId: 1, feats: 'Prominence of Color', sign: { dormant: 'גוון אחד', strength: 'בחירה במגוון גוונים', shadow: 'כל הצבעים, בלי סדר' }, why: 'מגוון גוונים מבטא חיפוש וחידוש. כל הצבעים יחד מבטאים פיזור.' },
  { id: 'elements', measure: 'elements', label: 'רכיבים נפרדים', unit: 'רכיבים', lo: 2, hi: 10, max: 16, strengthId: 2, feats: 'Details of Objects and Environment', sign: { dormant: 'רכיב אחד', strength: 'כמה מוקדי עניין', shadow: 'הרבה מוקדים, בלי מרכז' }, why: 'ריבוי רכיבים מבטא עניין בעולם. ריבוי קיצוני מבטא קפיצה בלי עומק.' },
  { id: 'erase', measure: 'eraseShare', label: 'קווי מחיקה', unit: '%', lo: 1, hi: 25, max: 50, strengthId: 3, feats: 'תהליך', sign: { dormant: 'בלי מחיקה', strength: 'תיקון מדוד', shadow: 'מחיקה חוזרת' }, why: 'מחיקה היא בחינה מחדש. מחיקה חוזרת היא ביקורת שמשתקת.' },
  { id: 'center', measure: 'centeredness', label: 'איזון סביב המרכז', unit: 'מתוך 100', lo: 55, hi: 93, max: 100, strengthId: 19, feats: 'Integration', sign: { dormant: 'הציור נוטה לקצה', strength: 'קומפוזיציה מאוזנת', shadow: 'מרכוז נוקשה' }, why: 'איזון הקומפוזיציה מבטא ויסות. מרכוז מוחלט מבטא שליטה שאין בה תנועה.' },
  { id: 'upper', measure: 'upperShare', label: 'סימון בחצי העליון', unit: '%', lo: 20, hi: 72, max: 100, strengthId: 22, feats: 'סמליות המרחב (Pulver, 1931)', sign: { dormant: 'הכול צמוד לקרקע', strength: 'הציור עולה כלפי מעלה', shadow: 'הציור מרחף, בלי קרקע' }, why: 'בסמליות המרחב, המעלה הוא שאיפה. מעלה בלי קרקע הוא שאיפה בלי תוכנית.' },
  { id: 'pauses', measure: 'pauses', label: 'עצירות להתבוננות', unit: 'עצירות', lo: 1, hi: 6, max: 10, strengthId: 5, feats: 'תהליך', sign: { dormant: 'ציור בלי לעצור', strength: 'עצירה להסתכל מרחוק', shadow: 'יותר הסתכלות מעשייה' }, why: 'עצירה היא צעד אחורה אל התמונה הכוללת. עצירות רבות הן התרחקות מהעשייה.' },
  { id: 'integration', measure: 'integration', label: 'חיבור בין הרכיבים', unit: '%', lo: 45, hi: 96, max: 100, strengthId: 13, feats: 'Integration', sign: { dormant: 'רכיבים מפוזרים', strength: 'רכיבים שעובדים יחד', shadow: 'הכול נבלע ברכיב אחד' }, why: 'חיבור בין רכיבים מבטא שיתוף. בליעה מלאה מבטאת ויתור על קול נפרד.' },
  { id: 'soft', measure: 'softShare', label: 'מגע רך בחומר', unit: '%', lo: 5, hi: 70, max: 100, strengthId: 11, feats: 'תהליך', sign: { dormant: 'רק קו יבש', strength: 'צבע רטוב ומריחה', shadow: 'הכול נמרח ונספג' }, why: 'מגע רך הוא עבודה עם החומר ולא נגדו. ספיגה מלאה היא היעלמות של הקו.' },
]

export type Reading = {
  rule: Rule
  value: number
  zone: Zone
  intensity: number // 0 עד 1 בתוך האזור
  strength: Strength
}

export function read(m: Measures): Reading[] {
  return RULES.flatMap((rule) => {
    const v = m[rule.measure]
    if (typeof v !== 'number') return []
    const zone: Zone = v < rule.lo ? 'dormant' : v > rule.hi ? 'shadow' : 'strength'
    const intensity = zone === 'strength' ? (v - rule.lo) / (rule.hi - rule.lo) : zone === 'shadow' ? Math.min(1, (v - rule.hi) / (rule.max - rule.hi || 1)) : Math.min(1, (rule.lo - v) / (rule.lo || 1))
    return [{ rule, value: v, zone, intensity, strength: strengthById(rule.strengthId) }]
  })
}

export type Revelation = {
  readings: Reading[]
  top: Reading // החוזקה הבולטת
  shadow: { reading: Reading; active: boolean } // צל פעיל, או הצל שהחוזקה הבולטת מטילה
  dormant: Reading | null // חוזקה רדומה
  counts: Record<Zone, number>
  tooShort: boolean
}

export function reveal(m: Measures, d: Directive): Revelation {
  const readings = read(m)
  const focus = (r: Reading) => (d.focus.includes(r.strength.virtue) ? 0.06 : 0)
  const inBand = readings.filter((r) => r.zone === 'strength').sort((a, b) => b.intensity + focus(b) - (a.intensity + focus(a)))
  const over = readings.filter((r) => r.zone === 'shadow').sort((a, b) => b.intensity - a.intensity)
  const under = readings.filter((r) => r.zone === 'dormant').sort((a, b) => b.intensity - a.intensity)
  const top = inBand[0] ?? over[0] ?? readings[0]
  const counts = { dormant: under.length, strength: inBand.length, shadow: over.length }
  return {
    readings,
    top,
    shadow: over.length ? { reading: over[0], active: true } : { reading: top, active: false },
    dormant: under.find((r) => r.rule.id !== top.rule.id) ?? null,
    counts,
    tooShort: m.strokes < 3 || m.activeSec < 2,
  }
}
