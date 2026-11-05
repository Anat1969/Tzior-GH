// מנוע הציור. מבוסס על מנוע הסטודיו של TipulArt (https://github.com/Anat1969/TipulArt, src/studio/engine.ts):
// כל קו נרשם עם זמן, כדי שהקריאה תכלול גם את התהליך ולא רק את התוצר.
export type Tool = 'charcoal' | 'marker' | 'wet' | 'smudge' | 'eraser'
export type Point = [number, number, number] // x, y, ms מתחילת הקו
export type Stroke = { tool: Tool; color: string; size: number; t0: number; pts: Point[] }

export const W = 1200
export const H = 900
export const PAPER = '#f8f5ee'
export const MAX_POINTS = 20000

export const TOOLS: { id: Tool; label: string }[] = [
  { id: 'charcoal', label: 'פחם' },
  { id: 'marker', label: 'טוש' },
  { id: 'wet', label: 'צבע רטוב' },
  { id: 'smudge', label: 'מריחה' },
  { id: 'eraser', label: 'מחק' },
]

// 12 צבעים: ערכה קבועה, כמו בערכת הטושים של PPAT
export const COLORS = ['#1d1d1f', '#6b3e1f', '#c2462f', '#e0782a', '#e8c547', '#7a9a3c', '#2f6b45', '#2a8c96', '#2f4f9a', '#5d3f8f', '#c4568e', '#8a8a8a']

export const SIZES = [
  { id: 6, label: 'דק' },
  { id: 16, label: 'בינוני' },
  { id: 40, label: 'רחב' },
]

export function clearPaper(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function drawSegment(ctx: CanvasRenderingContext2D, s: Stroke, a: Point, b: Point) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dist = Math.hypot(dx, dy)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (s.tool === 'charcoal') {
    ctx.strokeStyle = s.color
    for (let i = 0; i < 3; i++) {
      const j = (i - 1) * s.size * 0.18
      ctx.globalAlpha = 0.3 + ((a[0] * 13 + b[1] * 7 + i * 31) % 17) / 60
      ctx.lineWidth = Math.max(1, s.size * (0.55 - i * 0.12))
      ctx.beginPath()
      ctx.moveTo(a[0] + j, a[1] - j)
      ctx.lineTo(b[0] + j, b[1] - j)
      ctx.stroke()
    }
  } else if (s.tool === 'marker') {
    ctx.strokeStyle = s.color
    ctx.lineWidth = Math.max(2, s.size * 0.5)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
  } else if (s.tool === 'wet') {
    const [r, g, bl] = hexToRgb(s.color)
    const n = Math.max(1, Math.ceil(dist / Math.max(2, s.size * 0.25)))
    const rad = s.size * 1.4
    ctx.globalCompositeOperation = 'multiply'
    for (let i = 0; i <= n; i++) {
      const x = a[0] + (dx * i) / n
      const y = a[1] + (dy * i) / n
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
      grad.addColorStop(0, `rgba(${r},${g},${bl},0.12)`)
      grad.addColorStop(0.6, `rgba(${r},${g},${bl},0.07)`)
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (s.tool === 'smudge') {
    const rad = Math.max(8, s.size)
    const n = Math.max(1, Math.ceil(dist / (rad * 0.25)))
    ctx.globalAlpha = 0.5
    for (let i = 1; i <= n; i++) {
      const px = a[0] + (dx * (i - 1)) / n
      const py = a[1] + (dy * (i - 1)) / n
      const x = a[0] + (dx * i) / n
      const y = a[1] + (dy * i) / n
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(ctx.canvas, px - rad, py - rad, rad * 2, rad * 2, x - rad, y - rad, rad * 2, rad * 2)
      ctx.restore()
    }
  } else {
    ctx.strokeStyle = PAPER
    ctx.lineWidth = s.size * 1.6
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
  }
  ctx.restore()
}

export function drawDot(ctx: CanvasRenderingContext2D, s: Stroke, p: Point) {
  drawSegment(ctx, s, p, [p[0] + 0.5, p[1] + 0.5, p[2]])
}

export function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
