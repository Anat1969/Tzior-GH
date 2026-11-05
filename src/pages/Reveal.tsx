import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEntry, updateEntry, type AiText, type Entry, type Resonance } from '../logic/store'
import { reveal, type Reading, type Zone } from '../engine/reveal'
import { directiveById } from '../data/directives'
import { VIRTUES, type Strength } from '../data/strengths'
import { aiText, localText } from '../logic/ai'
import { Rich, plain } from '../components/Rich'
import { Scale, ZONE_NAME } from '../components/Scale'
import { ActionBar } from '../components/ActionBar'
import './Reveal.css'

const fmtVal = (r: Reading) => `${r.value}${r.rule.unit === '%' ? '%' : ''}`

export default function Reveal() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const [entry, setEntry] = useState<Entry | undefined>(() => getEntry(id))
  const d = directiveById(entry?.directiveId ?? '')
  const rev = useMemo(() => (entry ? reveal(entry.measures, d) : null), [entry, d])
  const [ai, setAi] = useState<AiText | null>(entry?.ai ?? null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!entry || !rev || entry.ai || rev.tooShort) return
    let live = true
    aiText(rev, d).then((t) => {
      if (!live) return
      setAi(t)
      updateEntry(entry.id, { ai: t })
    })
    return () => { live = false }
  }, [entry, rev, d])

  if (!entry || !rev)
    return (
      <div className="page">
        <h1 className="h-insight">הציור לא נמצא ביומן.</h1>
        <p className="muted" style={{ marginTop: 8 }}>היומן נשמר בדפדפן שבו צוירו הציורים.</p>
        <Link className="btn primary" to="/draw" style={{ marginTop: 16 }}>ציור חדש</Link>
      </div>
    )

  const text = ai ?? localText(rev, d)
  const setRes = (k: keyof Entry['resonance'], v: Resonance) => {
    const resonance = { ...entry.resonance, [k]: v }
    updateEntry(entry.id, { resonance })
    setEntry({ ...entry, resonance })
  }
  const shadowStrength = rev.shadow.reading.strength
  const order: Zone[] = ['strength', 'shadow', 'dormant']
  const sorted = [...rev.readings].sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone) || b.intensity - a.intensity)

  const copy = async () => {
    const t = [
      `ציור שמגלה חוזקה · ${d.title}`,
      plain(text.insight),
      plain(text.explanation),
      `חוזקה: ${rev.top.strength.name}. ${rev.top.rule.sign.strength}.`,
      `צל: ${shadowStrength.shadow.name}. ${shadowStrength.shadow.reframe}`,
      rev.dormant ? `רדום: ${rev.dormant.strength.name}.` : '',
      `אתגר להיום: ${rev.top.strength.challenge}`,
      location.href,
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(t)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      prompt('להעתקה:', t)
    }
  }

  return (
    <div className="page reveal-page">
      <header className="rv-head">
        <p className="kicker">שלב 3 מתוך 3 · גילוי · {d.title} · {new Date(entry.createdAt).toLocaleDateString('he-IL')}</p>
        {rev.tooShort ? (
          <>
            <h1 className="h-insight" style={{ marginTop: 8 }}>הציור <mark>קצר מדי</mark> לקריאה.</h1>
            <p className="rv-expl">הקריאה צריכה לפחות <b>3 קווים</b> ו<b>2 שניות</b> של ציור. הדף עדיין פתוח.</p>
          </>
        ) : (
          <>
            <h1 className="h-insight reveal" style={{ marginTop: 8 }} data-testid="insight"><Rich text={text.insight} /></h1>
            <p className="rv-expl reveal d1"><Rich text={text.explanation} breakOnComma /></p>
            <p className="label" style={{ marginTop: 6 }}>{text.by === 'local' ? 'ניסוח מקומי מהמדדים' : text.by === 'gemini' ? 'ניסוח Gemini מהמדדים בלבד' : 'ניסוח Claude מהמדדים בלבד'}</p>
          </>
        )}
      </header>

      <section className="rv-main">
        <figure className="rv-figure">
          <img src={entry.image} alt={`הציור: ${d.title}`} />
          <figcaption className="small muted">{d.instruction}</figcaption>
        </figure>
        {!rev.tooShort && (
          <div className="rv-cards">
            <RevealCard q="מה החוזקה שלי?" zone="strength" s={rev.top.strength} reading={rev.top} title={rev.top.strength.name} sign={rev.top.rule.sign.strength} body={rev.top.strength.description} res={entry.resonance.strength} onRes={(v) => setRes('strength', v)} delay={1} />
            <RevealCard
              q="איפה הצל?"
              zone="shadow"
              s={shadowStrength}
              reading={rev.shadow.reading}
              title={shadowStrength.shadow.name}
              sign={rev.shadow.active ? rev.shadow.reading.rule.sign.shadow : `כש${shadowStrength.name} נמתחת עוד`}
              body={`${shadowStrength.shadow.description} ${shadowStrength.shadow.reframe}`}
              res={entry.resonance.shadow}
              onRes={(v) => setRes('shadow', v)}
              note={rev.shadow.active ? `צל פעיל: ${rev.shadow.reading.rule.label} מעל ${rev.shadow.reading.rule.hi}${rev.shadow.reading.rule.unit === '%' ? '%' : ''}` : 'אין מדד באזור הצל. זה הצל שהחוזקה הבולטת מטילה.'}
              delay={2}
            />
            {rev.dormant ? (
              <RevealCard q="מה רדום?" zone="dormant" s={rev.dormant.strength} reading={rev.dormant} title={rev.dormant.strength.name} sign={rev.dormant.rule.sign.dormant} body={rev.dormant.strength.description} res={entry.resonance.dormant} onRes={(v) => setRes('dormant', v)} delay={3} />
            ) : (
              <div className="rv-card z-dormant reveal d3"><p className="rv-q">מה רדום?</p><p className="rv-title">אין חוזקה רדומה.</p><p className="small">כל המדדים מעל סף השימוש החסר.</p></div>
            )}
          </div>
        )}
      </section>

      {!rev.tooShort && (
        <>
          <section className="rv-sec">
            <div className="rv-sec-head">
              <h2 className="h-sec">על מה זה מבוסס?</h2>
              <p className="small muted">12 מדדים מהדף ומהתהליך. כל סקאלה: <span className="key k-d">רדום</span> <span className="key k-s">חוזקה</span> <span className="key k-u">צל</span>. הסמן הוא הציור שלך.</p>
            </div>
            <div className="rv-counts">
              {order.map((z) => (
                <div key={z} className={`rv-count z-${z}`}>
                  <span className="big-num">{rev.counts[z]}</span>
                  <span className="label">{ZONE_NAME[z]}</span>
                </div>
              ))}
              <p className="rv-count-insight">
                <Rich text={countInsight(rev.counts)} />
              </p>
            </div>
            <div className="rv-scales">
              {sorted.map((r) => (
                <div key={r.rule.id} className={`rv-scale z-${r.zone}`}>
                  <div className="rv-scale-top">
                    <span className="rv-scale-label">{r.rule.label}</span>
                    <span className="mono rv-scale-val">{fmtVal(r)}</span>
                  </div>
                  <Scale r={r} />
                  <div className="rv-scale-bottom small">
                    <b style={{ color: 'var(--z)' }}>{r.zone === 'shadow' ? r.strength.shadow.name : r.strength.name}</b>
                    <span className="muted"> · {r.rule.sign[r.zone]}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rv-sec rv-today">
            <div>
              <h2 className="h-sec">מה עושים היום?</h2>
              <p className="rv-challenge"><mark>{rev.top.strength.challenge}</mark></p>
              <p className="small muted">האתגר של {rev.top.strength.name}, מתוך "חוזקות וצל".</p>
            </div>
            <div>
              <h2 className="h-sec">על מה לדבר?</h2>
              <ol className="rv-questions">
                {text.questions.map((q, i) => <li key={i}><Rich text={q} /></li>)}
              </ol>
            </div>
            <div className="rv-haiku">
              <p className="label">הייקו לציור הזה</p>
              {text.haiku.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          </section>
        </>
      )}

      <ActionBar>
        <button className="btn" onClick={() => nav(`/draw?d=${d.id}`)}>אותה משימה שוב</button>
        <button className="btn" onClick={copy} disabled={rev.tooShort}>{copied ? 'הועתק' : 'העתקת הגילוי'}</button>
        <button className="btn" onClick={() => window.print()}>הדפסה</button>
        <button className="btn primary" onClick={() => nav('/draw')} data-testid="new-drawing">ציור חדש</button>
      </ActionBar>
    </div>
  )
}

function countInsight(c: Record<Zone, number>) {
  if (c.shadow === 0 && c.dormant === 0) return 'הציור כולו **בשביל הזהב**: אין קצה ואין חוסר.'
  if (c.shadow > c.strength) return `**${c.shadow}** מדדים בצל: הציור **נמתח לקצה** יותר משהוא נח באמצע.`
  if (c.dormant > c.strength) return `**${c.dormant}** מדדים רדומים: הציור **שומר כוחות**, ויש מקום להעיר.`
  return `**${c.strength}** מדדים באזור החוזקה: רוב הציור **פועל באמצע**, במינון מיטבי.`
}

const RES: { v: Resonance; label: string }[] = [
  { v: 'yes', label: 'מדבר אליי' },
  { v: 'partly', label: 'חלקית' },
  { v: 'no', label: 'לא אני' },
]

function RevealCard(p: { q: string; zone: Zone; s: Strength; reading: Reading; title: string; sign: string; body: string; res?: Resonance; onRes: (v: Resonance) => void; note?: string; delay: number }) {
  return (
    <article className={`rv-card z-${p.zone} reveal d${p.delay}`} data-testid={`card-${p.zone}`}>
      <p className="rv-q">{p.q}</p>
      <div className="rv-card-row">
        <h3 className="rv-title">{p.title}</h3>
        <span className="label">{VIRTUES[p.s.virtue].name}</span>
      </div>
      <p className="rv-sign"><b>בציור:</b> {p.sign}. <span className="mono">{p.reading.rule.label} {fmtVal(p.reading)}</span></p>
      <p className="small">{p.body}</p>
      {p.note && <p className="small muted">{p.note}</p>}
      <div className="rv-res" role="group" aria-label="תהודה">
        {RES.map((r) => (
          <button key={r.v} className="chip" aria-pressed={p.res === r.v} onClick={() => p.onRes(r.v)}>{r.label}</button>
        ))}
      </div>
    </article>
  )
}
