import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { COLORS, H, MAX_POINTS, SIZES, TOOLS, W, clearPaper, drawDot, drawSegment, fmtSec, type Point, type Stroke, type Tool } from '../engine/draw'
import { measure } from '../engine/measure'
import { reveal } from '../engine/reveal'
import { DIRECTIVES, directiveById, type Directive } from '../data/directives'
import { addEntry } from '../logic/store'
import { Rich } from '../components/Rich'
import { ActionBar } from '../components/ActionBar'
import './Draw.css'

export default function Draw() {
  const [params, setParams] = useSearchParams()
  const id = params.get('d')
  if (!id) return <Pick onPick={(d) => setParams({ d })} />
  return <Studio key={id} d={directiveById(id)} onBack={() => setParams({})} />
}

// שלב 1: בחירת משימה. השאלה היא הכותרת, והמקור בשורה קטנה.
function Pick({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="page">
      <p className="kicker">שלב 1 מתוך 3 · בחירת משימה</p>
      <h1 className="h-insight" style={{ marginTop: 8 }}>שאלה אחת, <mark>דף אחד</mark>.</h1>
      <p className="muted" style={{ marginTop: 8, maxWidth: 640 }}>
        כל משימה שואלת שאלה אחרת.
        <br />
        הקריאה תמיד אותה קריאה: קו, צבע, שטח וזמן.
      </p>
      <div className="pick-grid" style={{ marginTop: 24 }}>
        {DIRECTIVES.map((d, i) => (
          <button key={d.id} className="pick press" onClick={() => onPick(d.id)} data-testid={`directive-${d.id}`}>
            <span className="pick-num mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="pick-q">{d.question}</span>
            <span className="pick-title">{d.title}</span>
            <span className="pick-lens"><Rich text={d.lens} /></span>
            <span className="pick-src">{d.source}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// שלב 2: הסטודיו. כל קו נרשם עם זמן.
function Studio({ d, onBack }: { d: Directive; onBack: () => void }) {
  const nav = useNavigate()
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const current = useRef<Stroke | null>(null)
  const openedAt = useRef(performance.now())
  const points = useRef(0)
  const [tool, setTool] = useState<Tool>('charcoal')
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(16)
  const [elapsed, setElapsed] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    clearPaper(canvas.current!.getContext('2d', { willReadFrequently: true })!)
    const t = setInterval(() => setElapsed(Math.floor((performance.now() - openedAt.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  const at = (e: RPE<HTMLCanvasElement>) => {
    const r = canvas.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H] as const
  }
  const down = (e: RPE<HTMLCanvasElement>) => {
    e.preventDefault()
    canvas.current!.setPointerCapture(e.pointerId)
    const [x, y] = at(e)
    const s: Stroke = { tool, color, size, t0: Math.round(performance.now() - openedAt.current), pts: [[Math.round(x), Math.round(y), 0]] }
    current.current = s
    drawDot(canvas.current!.getContext('2d')!, s, s.pts[0])
  }
  const move = (e: RPE<HTMLCanvasElement>) => {
    const s = current.current
    if (!s) return
    const [x, y] = at(e)
    const last = s.pts[s.pts.length - 1]
    if (Math.hypot(x - last[0], y - last[1]) < 2) return
    const p: Point = [Math.round(x), Math.round(y), Math.round(performance.now() - openedAt.current - s.t0)]
    drawSegment(canvas.current!.getContext('2d')!, s, last, p)
    if (points.current < MAX_POINTS) {
      s.pts.push(p)
      points.current++
    } else s.pts[s.pts.length - 1] = p
  }
  const up = () => {
    if (current.current) {
      strokes.current.push(current.current)
      setCount(strokes.current.length)
    }
    current.current = null
  }
  const clear = () => {
    if (!confirm('לנקות את הדף? הקווים שנרשמו יימחקו.')) return
    clearPaper(canvas.current!.getContext('2d')!)
    strokes.current = []
    points.current = 0
    openedAt.current = performance.now()
    setCount(0)
  }
  const finish = () => {
    const c = canvas.current!
    const m = measure(c, strokes.current, openedAt.current, performance.now())
    const r = reveal(m, d)
    const thumb = document.createElement('canvas')
    thumb.width = 480
    thumb.height = 360
    thumb.getContext('2d')!.drawImage(c, 0, 0, 480, 360)
    const id = `t${Date.now().toString(36)}`
    addEntry({
      id,
      createdAt: new Date().toISOString(),
      directiveId: d.id,
      image: thumb.toDataURL('image/jpeg', 0.82),
      measures: m,
      topStrengthId: r.top.strength.id,
      shadowStrengthId: r.shadow.reading.strength.id,
      shadowActive: r.shadow.active,
      dormantStrengthId: r.dormant?.strength.id ?? null,
      resonance: {},
    })
    nav(`/reveal/${id}`)
  }

  return (
    <div className="studio">
      <div className="studio-head">
        <div>
          <p className="kicker">שלב 2 מתוך 3 · {d.title} · {d.question}</p>
          <p className="studio-instr">{d.instruction}</p>
        </div>
        <div className="studio-meta mono" aria-live="off">
          <span>{fmtSec(elapsed)}</span>
          <span>{count} קווים</span>
        </div>
      </div>
      <div className="studio-body">
        <aside className="tools" aria-label="כלים">
          <p className="label">חומר</p>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <button key={t.id} className="chip" aria-pressed={tool === t.id} onClick={() => setTool(t.id)}>{t.label}</button>
            ))}
          </div>
          <p className="label">עובי</p>
          <div className="tool-grid three">
            {SIZES.map((s) => (
              <button key={s.id} className="chip" aria-pressed={size === s.id} onClick={() => setSize(s.id)}>{s.label}</button>
            ))}
          </div>
          <p className="label">צבע</p>
          <div className="swatches">
            {COLORS.map((c) => (
              <button key={c} className="swatch" aria-label={`צבע ${c}`} aria-pressed={color === c} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </aside>
        <div className="sheet-wrap">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            className="sheet"
            data-testid="sheet"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={up}
          />
        </div>
      </div>
      <ActionBar>
        <button className="btn" onClick={onBack}>משימה אחרת</button>
        <button className="btn" onClick={clear} disabled={!count}>דף נקי</button>
        <button className="btn light" onClick={finish} disabled={!count} data-testid="finish">סיום וגילוי</button>
      </ActionBar>
    </div>
  )
}
