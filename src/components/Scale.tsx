import type { Reading } from '../engine/reveal'

// סקאלת שביל הזהב: רדום, חוזקה, צל. הסמן הוא הערך של הציור.
export function Scale({ r }: { r: Reading }) {
  const { lo, hi, max } = r.rule
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`
  return (
    <div className="scale" role="img" aria-label={`${r.rule.label}: ${r.value} ${r.rule.unit}`}>
      <div className="scale-zones">
        <span style={{ width: pct(lo), background: 'var(--dormant-soft)' }} />
        <span style={{ width: `calc(${pct(hi)} - ${pct(lo)})`, background: 'var(--light-soft)', boxShadow: 'inset 0 -3px 0 var(--light)' }} />
        <span style={{ flex: 1, background: 'var(--umbra-soft)', boxShadow: 'inset 0 -3px 0 var(--umbra)' }} />
      </div>
      <div className="scale-marker" style={{ right: pct(r.value) }} />
    </div>
  )
}

export const ZONE_NAME = { dormant: 'רדום', strength: 'חוזקה', shadow: 'צל' } as const
