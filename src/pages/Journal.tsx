import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadAll, removeEntry, RES_SCORE, type Entry } from '../logic/store'
import { strengthById } from '../data/strengths'
import { directiveById } from '../data/directives'
import { ActionBar } from '../components/ActionBar'
import { Rich } from '../components/Rich'
import './Journal.css'

export function resonanceRate(list: Entry[]) {
  const all = list.flatMap((e) => Object.values(e.resonance)).filter(Boolean) as ('yes' | 'partly' | 'no')[]
  return { n: all.length, pct: all.length ? Math.round((all.reduce((a, r) => a + RES_SCORE[r], 0) / all.length) * 100) : null }
}

function tally(list: Entry[], key: 'topStrengthId' | 'shadowStrengthId') {
  const m = new Map<number, number>()
  list.forEach((e) => m.set(e[key], (m.get(e[key]) ?? 0) + 1))
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ s: strengthById(id), n }))
}

export default function Journal() {
  const nav = useNavigate()
  const [list, setList] = useState(loadAll)
  const [sort, setSort] = useState<'date' | 'strength'>('date')
  const tops = useMemo(() => tally(list, 'topStrengthId'), [list])
  const shadows = useMemo(() => tally(list.filter((e) => e.shadowActive), 'shadowStrengthId'), [list])
  const res = resonanceRate(list)
  const sorted = useMemo(
    () => (sort === 'date' ? list : [...list].sort((a, b) => strengthById(a.topStrengthId).name.localeCompare(strengthById(b.topStrengthId).name, 'he'))),
    [list, sort],
  )

  if (!list.length)
    return (
      <div className="page">
        <p className="kicker">יומן</p>
        <h1 className="h-insight" style={{ marginTop: 8 }}>היומן <mark>מחכה לקו הראשון</mark>.</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          כל ציור נשמר כאן עם הגילוי שלו.
          <br />
          אחרי שלושה ציורים מופיע הדפוס: איזו חוזקה חוזרת.
        </p>
        <ActionBar><button className="btn primary" onClick={() => nav('/draw')}>ציור ראשון</button></ActionBar>
      </div>
    )

  const lead = tops[0]
  const max = tops[0]?.n ?? 1
  const insight =
    list.length < 3
      ? `עוד **${3 - list.length}** ציורים, ו**הדפוס** יתחיל להיראות.`
      : lead.n / list.length >= 0.5
        ? `**${lead.s.name}** חוזרת ב-**${Math.round((lead.n / list.length) * 100)}%** מהציורים: זו החוזקה שהיד חוזרת אליה.`
        : `**${tops.length}** חוזקות שונות ב-**${list.length}** ציורים: היד **מגוונת**, ואין חוזקה אחת שמשתלטת.`

  return (
    <div className="page">
      <p className="kicker">יומן · {list.length} ציורים</p>
      <h1 className="h-insight" style={{ marginTop: 8 }}><Rich text={insight} /></h1>

      <section className="jr-stats">
        <div className="jr-stat">
          <span className="big-num">{list.length}</span>
          <span className="label">ציורים</span>
          <p className="small">כל ציור הוא קריאה אחת. דפוס דורש לפחות <b>3</b>.</p>
        </div>
        <div className="jr-stat">
          <span className="big-num" style={{ color: 'var(--light)' }}>{lead.s.name}</span>
          <span className="label">החוזקה השכיחה · {lead.n} פעמים</span>
          <p className="small">{lead.s.description}</p>
        </div>
        <div className="jr-stat">
          <span className="big-num">{res.pct === null ? '·' : `${res.pct}%`}</span>
          <span className="label">מדד התהודה · {res.n} תשובות</span>
          <p className="small">{res.pct === null ? 'סמנו "מדבר אליי" בגילוי, והכלי ימדוד את עצמו.' : res.pct >= 60 ? <>הקריאה <b>פוגעת</b> ברוב הפעמים.</> : <>הקריאה <b>מחטיאה</b> לעתים קרובות: כדאי לקרוא את המדדים כשאלה.</>}</p>
        </div>
      </section>

      <section className="jr-chart">
        <div>
          <h2 className="h-sec">איזו חוזקה חוזרת?</h2>
          <p className="small muted">אורך הפס: מספר הציורים שבהם החוזקה הייתה הבולטת.</p>
          <div className="bars">
            {tops.map(({ s, n }) => (
              <div key={s.id} className="bar-row">
                <span className="bar-name">{s.name}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: `${(n / max) * 100}%` }} /></span>
                <span className="mono bar-n">{n}</span>
              </div>
            ))}
          </div>
          <p className="chart-insight"><Rich text={`**${lead.s.name}** מובילה. ${tops.length > 1 ? `אחריה **${tops[1].s.name}**.` : 'עדיין בלי מתחרה.'}`} /></p>
        </div>
        <div>
          <h2 className="h-sec">איזה צל פעיל?</h2>
          <p className="small muted">רק צללים שמדד בציור עבר בהם את הסף העליון.</p>
          {shadows.length ? (
            <>
              <div className="bars">
                {shadows.map(({ s, n }) => (
                  <div key={s.id} className="bar-row">
                    <span className="bar-name">{s.shadow.name}</span>
                    <span className="bar-track"><span className="bar-fill umbra" style={{ width: `${(n / shadows[0].n) * 100}%` }} /></span>
                    <span className="mono bar-n">{n}</span>
                  </div>
                ))}
              </div>
              <p className="chart-insight"><Rich text={`**${shadows[0].s.shadow.name}** הוא הצל של **${shadows[0].s.name}**. ${shadows[0].s.shadow.reframe}`} /></p>
            </>
          ) : (
            <p className="chart-insight"><Rich text="אף ציור לא עבר את **הסף העליון**: אין צל פעיל ביומן." /></p>
          )}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="jr-list-head">
          <h2 className="h-sec">הציורים</h2>
          <div className="jr-sort" role="group" aria-label="מיון">
            <span className="small muted">מסודר לפי {sort === 'date' ? 'תאריך' : 'חוזקה'}</span>
            <button className="chip" aria-pressed={sort === 'date'} onClick={() => setSort('date')}>תאריך</button>
            <button className="chip" aria-pressed={sort === 'strength'} onClick={() => setSort('strength')}>חוזקה</button>
          </div>
        </div>
        <div className="jr-grid">
          {sorted.map((e) => (
            <div key={e.id} className="jr-item">
              <Link to={`/reveal/${e.id}`} className="jr-link press">
                <img src={e.image} alt="" />
                <span className="jr-meta">
                  <b>{strengthById(e.topStrengthId).name}</b>
                  <span className="small muted">{directiveById(e.directiveId).title} · {new Date(e.createdAt).toLocaleDateString('he-IL')}</span>
                </span>
              </Link>
              <button className="jr-del small" aria-label="מחיקת הציור" onClick={() => { if (confirm('למחוק את הציור?')) { removeEntry(e.id); setList(loadAll()) } }}>מחיקה</button>
            </div>
          ))}
        </div>
      </section>
      <ActionBar>
        <button className="btn" onClick={() => nav('/method')}>איך זה נמדד</button>
        <button className="btn primary" onClick={() => nav('/draw')}>ציור חדש</button>
      </ActionBar>
    </div>
  )
}
