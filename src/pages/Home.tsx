import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RULES, type Zone } from '../engine/reveal'
import { strengthById } from '../data/strengths'
import { DIRECTIVES } from '../data/directives'
import { loadAll } from '../logic/store'
import { ActionBar } from '../components/ActionBar'
import { Rich } from '../components/Rich'
import { ZONE_NAME } from '../components/Scale'
import { SISTERS } from './sisters'
import './Home.css'

export default function Home() {
  const nav = useNavigate()
  const count = useMemo(() => loadAll().length, [])
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-head">
          <p className="kicker">טיפול באמנות × חוזקות וצל</p>
          <h1 className="h-insight hero-title">
            ציור אחד, <mark>שלושה גילויים</mark>.
          </h1>
          <p className="hero-expl lines">
            <span>מציירים לפי משימה מונחית.</span>
            <span>הכלי מודד <b>12</b> סימנים בקו, בצבע, בשטח ובזמן.</span>
            <span>ומגלה <b style={{ color: 'var(--light)' }}>חוזקה</b>, את <b style={{ color: 'var(--umbra)' }}>הצל</b> שלה, ו<b style={{ color: 'var(--dormant)' }}>חוזקה רדומה</b>.</span>
          </p>
        </div>
        <Window />
        <div className="hero-boxes">
            <div className="card box-problem"><span className="label" style={{ color: 'var(--problem)' }}>בעיה</span><p><Rich text="**חוזקה** קשה לראות מבפנים. שאלון שואל את מה שכבר חושבים." /></p></div>
            <div className="card box-solution"><span className="label" style={{ color: 'var(--solution)' }}>פתרון</span><p><Rich text="**היד** עונה לפני המחשבה, והקו נמדד בלי לנחש תוכן." /></p></div>
            <div className="card box-insight"><span className="label" style={{ color: '#9a8300' }}>תובנה</span><p><Rich text="**כל חוזקה מטילה צל**: אותה חוזקה, במינון עודף." /></p></div>
        </div>
        <nav className="map" aria-label="מפת התוכן">
        <Door to="/draw" num={String(DIRECTIVES.length)} unit="משימות" title="ציור" line="שאלה אחת, דף אחד, והקו נרשם עם הזמן." />
        <Door to={count ? '/journal' : '/draw'} num={String(count)} unit="ציורים" title="יומן" line={count ? 'החוזקה שחוזרת, והצל שפעיל.' : 'מתמלא מהציור הראשון.'} />
        <Door to="/method" num="12" unit="כללים" title="שיטה" line="FEATS, VIA ושביל הזהב, וכל סף גלוי." />
        <Door to="/method" num="3" unit="מדדי אמינות" title="אמינות" line="תהודה, יציבות ושקיפות: הכלי מודד את עצמו." />
        </nav>
      </section>

      <section className="museum">
        <blockquote className="quote">
          <p>"אדם אינו נעשה מואר מדמיון של דמויות אור, אלא מהפיכת החושך למודע."</p>
          <cite className="small muted">קרל גוסטב יונג (C. G. Jung), העץ הפילוסופי (The Philosophical Tree), 1945</cite>
        </blockquote>
        <div className="haiku">
          <p className="label">הייקו</p>
          <p>פס אור על הדף</p>
          <p>מה שמחזיק אותי ישר</p>
          <p>מטיל גם צל ארוך</p>
        </div>
        <div className="sisters">
          <p className="label">שלוש אפליקציות, שלוש שאלות</p>
          {SISTERS.map((s) => (
            <a key={s.name} href={s.url} target={s.url === '/' ? undefined : '_blank'} rel="noreferrer" className="sister-row">
              <b>{s.q}</b>
              <span className="small muted">{s.name}</span>
            </a>
          ))}
        </div>
      </section>
      <p className="inspire small muted">
        השראה: כנסיית האור, טדאו אנדו (Tadao Ando, Church of the Light), איבארקי (Ibaraki), 1989. פס אור אחד בקיר בטון, שהצל שסביבו נותן לו צורה.
      </p>

      <ActionBar>
        <button className="btn" onClick={() => nav('/method')}>איך זה עובד</button>
        <button className="btn primary" onClick={() => nav('/draw')} data-testid="start">לצייר עכשיו</button>
      </ActionBar>
    </div>
  )
}

function Door({ to, num, unit, title, line }: { to: string; num: string; unit: string; title: string; line: string }) {
  return (
    <Link to={to} className="door">
      <span className="door-title">{title}</span>
      <span className="door-num"><span className="big-num">{num}</span> <span className="label">{unit}</span></span>
      <span className="small">{line}</span>
    </Link>
  )
}

// האובייקט החוויתי: חלון. רוחב פס האור הוא הערך של המדד. מעבר לסף העליון, הצל מתפשט.
// ריחוף מזיז את הערך. בלי ריחוף: מעבר אחד על הסקאלה, ועצירה באמצע.
function Window() {
  const rule = useMemo(() => RULES[Math.floor(Math.random() * RULES.length)], [])
  const s = strengthById(rule.strengthId)
  const mid = (rule.lo + rule.hi) / 2
  const [v, setV] = useState(0)
  const touched = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(mid); return }
    const path = [0, rule.max * 0.95, mid]
    let i = 0
    let start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      if (touched.current) return
      const k = Math.min(1, (t - start) / 1800)
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      setV(path[i] + (path[i + 1] - path[i]) * e)
      if (k >= 1) { i++; start = t; if (i >= path.length - 1) return }
      raf = requestAnimationFrame(tick)
    }
    const delay = setTimeout(() => { raf = requestAnimationFrame(tick) }, 500)
    return () => { clearTimeout(delay); cancelAnimationFrame(raf) }
  }, [rule, mid])

  const zone: Zone = v < rule.lo ? 'dormant' : v > rule.hi ? 'shadow' : 'strength'
  const p = Math.max(0, Math.min(1, v / rule.max))
  const shadowK = zone === 'shadow' ? (v - rule.hi) / (rule.max - rule.hi) : 0
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    touched.current = true
    setV(Math.max(0, Math.min(1, (r.right - e.clientX) / r.width)) * rule.max)
  }
  const name = zone === 'shadow' ? s.shadow.name : zone === 'dormant' ? `${s.name} רדומה` : s.name
  const slit = 4 + p * 56

  return (
    <div className="window-wrap">
      <div className={`window z-${zone}`} ref={ref} onPointerMove={onMove} data-testid="window" role="img" aria-label={`${rule.label}: ${ZONE_NAME[zone]}, ${name}`}>
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={zone === 'dormant' ? '#c8c3b8' : '#f3c873'} />
              <stop offset="1" stopColor={zone === 'dormant' ? '#a9a49a' : '#d99a2b'} />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="#1c1d21" />
          <polygon points={`${200 + slit / 2},40 ${200 + slit / 2 + 20 + shadowK * 160},40 ${260 + slit / 2 + shadowK * 140},300 ${200 + slit / 2 + 10},300`} fill="#2f3b57" opacity={0.25 + shadowK * 0.75} />
          <rect x={200 - slit / 2} y="40" width={slit} height="220" fill="url(#beam)" />
          <polygon points={`${200 - slit / 2},260 ${200 + slit / 2},260 ${200 + slit * 1.6},300 ${200 - slit * 1.6},300`} fill="#f3c873" opacity={zone === 'dormant' ? 0.05 : 0.18} />
        </svg>
        <div className="window-caption">
          <span className="label" style={{ color: '#cfcac0' }}>{rule.label} · {Math.round(v)} {rule.unit}</span>
          <span className="window-name">{name}</span>
          <span className="small" style={{ color: '#cfcac0' }}>{rule.sign[zone]}</span>
        </div>
      </div>
      <div className="window-scale">
        <span className="z-dormant" style={{ width: `${(rule.lo / rule.max) * 100}%` }}>רדום</span>
        <span className="z-strength" style={{ width: `${((rule.hi - rule.lo) / rule.max) * 100}%` }}>חוזקה</span>
        <span className="z-shadow" style={{ flex: 1 }}>צל</span>
        <i style={{ right: `${p * 100}%` }} />
      </div>
      <p className="small muted window-legend">העבירו את העכבר על החלון: אותו מדד, שלושה אזורים. <b>רוחב האור</b> הוא הערך.</p>
    </div>
  )
}
