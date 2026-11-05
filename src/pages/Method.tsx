import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RULES } from '../engine/reveal'
import { strengthById } from '../data/strengths'
import { loadAll, RES_SCORE } from '../logic/store'
import { resonanceRate } from './Journal'
import { ActionBar } from '../components/ActionBar'
import { Rich } from '../components/Rich'
import { SISTERS } from './sisters'
import './Method.css'

const STANDARDS = [
  { tag: 'מדידה', name: 'FEATS', full: 'Formal Elements Art Therapy Scale', who: 'Gantt & Tabone, 1998', what: 'סולמות שמדרגים את **צורת** הציור, לא את התוכן: שטח, צבע, אנרגיה, קו ואינטגרציה.', use: 'כל מדד בכלי מקרב פריט FEATS או פרמטר תהליך, ומחושב בקוד.' },
  { tag: 'חוזקות', name: 'VIA', full: 'Values in Action Classification', who: 'Peterson & Seligman, 2004', what: '**24** חוזקות אופי בשש מעלות: חוכמה, אומץ לב, אנושיות, צדק, מתינות ונשגבות.', use: 'שמות החוזקות, הצללים והאתגרים מגיעים מהאפליקציה "חוזקות וצל".' },
  { tag: 'צל', name: 'שביל הזהב', full: 'Overuse, underuse and optimal use', who: 'Niemiec, 2019', what: 'לכל חוזקה **שימוש חסר**, **מיטבי** ו**עודף**. העודף הוא הצל.', use: 'כל מדד נקרא על סקאלה של שלושה אזורים, עם שני ספים גלויים.' },
]

export default function Method() {
  const nav = useNavigate()
  const list = useMemo(loadAll, [])
  const res = resonanceRate(list)
  // יציבות: באותה משימה, באיזה אחוז מהזוגות העוקבים החוזקה הבולטת חזרה
  const stability = useMemo(() => {
    const by = new Map<string, number[]>()
    ;[...list].reverse().forEach((e) => by.set(e.directiveId, [...(by.get(e.directiveId) ?? []), e.topStrengthId]))
    let pairs = 0
    let same = 0
    by.forEach((ids) => ids.slice(1).forEach((id, i) => { pairs++; if (id === ids[i]) same++ }))
    return { pairs, pct: pairs ? Math.round((same / pairs) * 100) : null }
  }, [list])
  // תהודה לכל כלל: לפי תשובת "מה החוזקה שלי"
  const perRule = useMemo(() => {
    const m = new Map<number, number[]>()
    list.forEach((e) => { if (e.resonance.strength) m.set(e.topStrengthId, [...(m.get(e.topStrengthId) ?? []), RES_SCORE[e.resonance.strength]]) })
    return m
  }, [list])

  return (
    <div className="page">
      <p className="kicker">שיטה · על מה הכלי נשען, ואיך הוא מודד את עצמו</p>
      <h1 className="h-insight" style={{ marginTop: 8 }}>הכלי קורא <mark>צורה ותהליך</mark>, לא תוכן.</h1>
      <p className="muted" style={{ marginTop: 8, maxWidth: 720 }}>
        הוא לא מנחש מה צויר.
        <br />
        הוא מודד <b>12</b> סימנים בדף ובזמן, וממקם כל אחד על סקאלה של רדום, חוזקה וצל.
      </p>

      <section className="mt-standards">
        {STANDARDS.map((s) => (
          <article key={s.name} className="card mt-std">
            <span className="label">{s.tag}</span>
            <h2 className="mt-std-name">{s.name}</h2>
            <p className="small muted">{s.full} · {s.who}</p>
            <p><Rich text={s.what} /></p>
            <p className="small"><b>בכלי:</b> {s.use}</p>
          </article>
        ))}
      </section>

      <section className="mt-rel">
        <h2 className="h-sec">איך הכלי מודד את האמינות שלו?</h2>
        <div className="mt-rel-grid">
          <div className="mt-rel-cell">
            <span className="big-num">{res.pct === null ? '·' : `${res.pct}%`}</span>
            <span className="label">תהודה · {res.n} תשובות</span>
            <p className="small"><b>תוקף נתפס:</b> אחרי כל גילוי מסמנים "מדבר אליי", "חלקית" או "לא אני". חלקית שווה חצי.</p>
          </div>
          <div className="mt-rel-cell">
            <span className="big-num">{stability.pct === null ? '·' : `${stability.pct}%`}</span>
            <span className="label">יציבות · {stability.pairs} זוגות</span>
            <p className="small"><b>מבחן חוזר:</b> שני ציורים עוקבים באותה משימה. האם אותה חוזקה חזרה?</p>
          </div>
          <div className="mt-rel-cell">
            <span className="big-num">0</span>
            <span className="label">ניחושים</span>
            <p className="small"><b>שקיפות:</b> כל ערך נשען על מספר וסף שמופיעים בטבלה למטה. המודל רק מנסח.</p>
          </div>
        </div>
        <p className="mt-insight">
          <Rich text={res.pct === null ? 'המדד מתמלא **מהיומן שלך**: כל סימון תהודה הופך את הכלי לבדיק.' : res.pct >= 60 ? `**${res.pct}%** תהודה: הקריאה **פוגעת** אצלך ברוב הפעמים.` : `**${res.pct}%** תהודה: הקריאה **מחטיאה** אצלך לעתים קרובות, ולכן היא שאלה ולא תשובה.`} />
        </p>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 className="h-sec">12 הכללים: ממדד לחוזקה</h2>
        <p className="small muted">מתחת לסף התחתון: רדום. בין הספים: חוזקה. מעל הסף העליון: הצל של אותה חוזקה.</p>
        <div className="mt-table-wrap">
          <table className="mt-table">
            <thead>
              <tr>
                <th>מה נמדד</th>
                <th>מקרב את</th>
                <th>רדום</th>
                <th>חוזקה</th>
                <th>צל</th>
                <th>הכלל</th>
                <th>תהודה</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => {
                const s = strengthById(r.strengthId)
                const hits = perRule.get(s.id)
                return (
                  <tr key={r.id}>
                    <td><b>{r.label}</b><br /><span className="small muted mono">{r.unit}</span></td>
                    <td className="small">{r.feats}</td>
                    <td className="z-dormant"><span className="mono">מתחת ל-{r.lo}</span><br /><span className="small">{r.sign.dormant}</span></td>
                    <td className="z-strength"><span className="mono">{r.lo} עד {r.hi}</span><br /><b style={{ color: 'var(--light)' }}>{s.name}</b></td>
                    <td className="z-shadow"><span className="mono">מעל {r.hi}</span><br /><b style={{ color: 'var(--umbra)' }}>{s.shadow.name}</b></td>
                    <td className="small">{r.why}</td>
                    <td className="mono">{hits ? `${Math.round((hits.reduce((a, b) => a + b, 0) / hits.length) * 100)}%` : '·'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-sisters">
        <h2 className="h-sec">שלוש אפליקציות, שלוש שאלות</h2>
        <div className="grid cols-3" style={{ marginTop: 12 }}>
          {SISTERS.map((s) => (
            <a key={s.url} className="card mt-sister press" href={s.url} target="_blank" rel="noreferrer">
              <span className="label">{s.role}</span>
              <b className="mt-sister-q">{s.q}</b>
              <span className="small">{s.name}: {s.what}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-privacy">
        <p><b>הציור נשאר אצלך.</b> היומן נשמר בדפדפן בלבד. לניסוח התובנה עולים לשרת רק שמות חוזקות ומספרים, לא התמונה.</p>
      </section>

      <details className="mt-sources">
        <summary>מקורות</summary>
        <ul className="small">
          <li>Gantt, L. & Tabone, C. (1998). The Formal Elements Art Therapy Scale: The Rating Manual. Gargoyle Press.</li>
          <li>Peterson, C. & Seligman, M. E. P. (2004). Character Strengths and Virtues: A Handbook and Classification. Oxford University Press.</li>
          <li>Niemiec, R. M. (2019). Finding the golden mean: the overuse, underuse, and optimal use of character strengths. Counselling Psychology Quarterly, 32(3-4).</li>
          <li>Pulver, M. (1931). Symbolik der Handschrift. Orell Füssli.</li>
          <li>Koch, K. (1949). Der Baumtest. Hans Huber.</li>
          <li>Hays, R. & Lyons, S. (1981). The Bridge Drawing. The Arts in Psychotherapy, 8.</li>
          <li>Hammer, E. (1958). The Clinical Application of Projective Drawings. Charles C. Thomas.</li>
          <li>Cane, F. (1951). The Artist in Each of Us. Pantheon.</li>
          <li>Jung, C. G. (1951). Aion. Rascher.</li>
        </ul>
      </details>

      <ActionBar>
        <button className="btn" onClick={() => nav('/journal')}>היומן שלי</button>
        <button className="btn primary" onClick={() => nav('/draw')}>ציור חדש</button>
      </ActionBar>
    </div>
  )
}
