// מדידה ממוחשבת של הציור ושל התהליך. בלי מודל ובלי פרשנות: רק מספרים עם כלל חישוב.
// מבוסס על analyzeImage ו-summarize של TipulArt (src/studio), שמקרבים פריטי FEATS (Gantt & Tabone, 1998).
import { PAPER, type Stroke } from './draw'

export type Measures = {
  coverage: number // אחוז הדף שסומן
  colorCount: number // מספר גוונים נפרדים (מתוך 12 תאי גוון)
  colors: { hex: string; share: number }[]
  upperShare: number // אחוז הסימון בחצי העליון
  centeredness: number // 100 = מרכז הכובד במרכז הדף
  elements: number // רכיבים נפרדים בדף
  integration: number | null // אחוז הסימון ברכיב הגדול ביותר, כשיש 2 רכיבים לפחות
  firstStrokeSec: number
  activeSec: number
  totalSec: number
  strokes: number
  pauses: number // עצירות של יותר מ-4 שניות
  eraseShare: number // אחוז קווי המחק מכל הקווים
  speed: number // מהירות קו ממוצעת, פיקסלים בשנייה
  softShare: number // אחוז זמן הציור בצבע רטוב ובמריחה
}

function rgbToHsv(r: number, g: number, b: number) {
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const d = mx - mn
  let h = 0
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6
    else if (mx === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, mx ? d / mx : 0, mx / 255]
}

const P = [parseInt(PAPER.slice(1, 3), 16), parseInt(PAPER.slice(3, 5), 16), parseInt(PAPER.slice(5, 7), 16)]

export function measureCanvas(src: HTMLCanvasElement) {
  const w = 300
  const h = Math.round((w * src.height) / src.width)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(src, 0, 0, w, h)
  const d = ctx.getImageData(0, 0, w, h).data
  const mark = new Uint8Array(w * h)
  let marked = 0
  let upper = 0
  let sx = 0
  let sy = 0
  let colored = 0
  const bins = new Array(12).fill(0)
  const binRgb = Array.from({ length: 12 }, () => [0, 0, 0])
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const k = y * w + x
      const i = k * 4
      if (Math.abs(d[i] - P[0]) + Math.abs(d[i + 1] - P[1]) + Math.abs(d[i + 2] - P[2]) <= 30) continue
      mark[k] = 1
      marked++
      sx += x
      sy += y
      if (y < h / 2) upper++
      const [hu, sat, val] = rgbToHsv(d[i], d[i + 1], d[i + 2])
      if (sat > 0.28 && val > 0.2) {
        colored++
        const b = Math.floor(hu / 30) % 12
        bins[b]++
        binRgb[b][0] += d[i]
        binRgb[b][1] += d[i + 1]
        binRgb[b][2] += d[i + 2]
      }
    }
  const colors = bins
    .map((n, b) => ({ n, b }))
    .filter((x) => x.n > 12 && x.n / Math.max(1, colored) > 0.02)
    .sort((a, b) => b.n - a.n)
    .map(({ n, b }) => ({
      hex: `#${binRgb[b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('')}`,
      share: Math.round((n / colored) * 100),
    }))
  // שחור ואפור נספרים כגוון אחד כשיש סימון שאינו צבעוני
  const neutral = marked - colored > marked * 0.05 ? 1 : 0

  // רכיבים: רשת תאים גסה ורכיבים מחוברים, כמו ב-TipulArt
  const GX = 40
  const GY = Math.max(8, Math.round((GX * h) / w))
  const cell = new Array(GX * GY).fill(0)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (mark[y * w + x]) cell[Math.min(GY - 1, Math.floor((y / h) * GY)) * GX + Math.min(GX - 1, Math.floor((x / w) * GX))]++
  const area = (w / GX) * (h / GY)
  const on = cell.map((n) => n / area > 0.04)
  const seen = new Array(GX * GY).fill(false)
  const sizes: number[] = []
  for (let c0 = 0; c0 < GX * GY; c0++) {
    if (!on[c0] || seen[c0]) continue
    let size = 0
    const stack = [c0]
    seen[c0] = true
    while (stack.length) {
      const q = stack.pop()!
      size++
      const qx = q % GX
      const qy = Math.floor(q / GX)
      for (const [nx, ny] of [[qx + 1, qy], [qx - 1, qy], [qx, qy + 1], [qx, qy - 1], [qx + 1, qy + 1], [qx - 1, qy - 1], [qx + 1, qy - 1], [qx - 1, qy + 1]]) {
        if (nx < 0 || ny < 0 || nx >= GX || ny >= GY) continue
        const n = ny * GX + nx
        if (on[n] && !seen[n]) {
          seen[n] = true
          stack.push(n)
        }
      }
    }
    if (size >= 2) sizes.push(size)
  }
  const totalOn = sizes.reduce((a, b) => a + b, 0)
  const cx = marked ? sx / marked / w - 0.5 : 0
  const cy = marked ? sy / marked / h - 0.5 : 0
  return {
    coverage: Math.round((marked / (w * h)) * 1000) / 10,
    colorCount: colors.length + neutral,
    colors,
    upperShare: marked ? Math.round((upper / marked) * 100) : 0,
    centeredness: marked ? Math.max(0, Math.round(100 - Math.hypot(cx, cy) * 200)) : 0,
    elements: sizes.length,
    integration: sizes.length >= 2 ? Math.round((Math.max(...sizes) / totalOn) * 100) : null,
  }
}

export function measureProcess(strokes: Stroke[], openedAt: number, finishedAt: number) {
  let active = 0
  let pauses = 0
  let soft = 0
  let len = 0
  let dur = 0
  strokes.forEach((s, i) => {
    const d = s.pts.length ? s.pts[s.pts.length - 1][2] : 0
    active += d
    if (s.tool === 'wet' || s.tool === 'smudge') soft += d
    if (s.tool !== 'eraser' && d > 60) {
      for (let k = 1; k < s.pts.length; k++) len += Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1])
      dur += d
    }
    if (i > 0) {
      const p = strokes[i - 1]
      const gap = s.t0 - (p.t0 + (p.pts.length ? p.pts[p.pts.length - 1][2] : 0))
      if (gap > 4000) pauses++
    }
  })
  return {
    firstStrokeSec: strokes.length ? Math.round(strokes[0].t0 / 100) / 10 : 0,
    activeSec: Math.round(active / 1000),
    totalSec: Math.round((finishedAt - openedAt) / 1000),
    strokes: strokes.length,
    pauses,
    eraseShare: strokes.length ? Math.round((strokes.filter((s) => s.tool === 'eraser').length / strokes.length) * 100) : 0,
    speed: dur ? Math.round(len / (dur / 1000)) : 0,
    softShare: active ? Math.round((soft / active) * 100) : 0,
  }
}

export function measure(canvas: HTMLCanvasElement, strokes: Stroke[], openedAt: number, finishedAt: number): Measures {
  return { ...measureCanvas(canvas), ...measureProcess(strokes, openedAt, finishedAt) }
}
