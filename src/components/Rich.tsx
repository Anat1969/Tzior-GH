import { Fragment } from 'react'

// טקסט עשיר לפי תקן הזיקוק: **מילה** מוצגת במרקר, ==ביטוי== מודגש. כל פסיק מתחיל שורה, כשביקשו.
const TOKEN = /(\*\*[^*]+\*\*|==[^=]+==)/g

export function Rich({ text, breakOnComma = false }: { text: string; breakOnComma?: boolean }) {
  const parts = text.split(TOKEN)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <mark key={i}><b>{p.slice(2, -2)}</b></mark>
        if (p.startsWith('==') && p.endsWith('==')) return <b key={i}>{p.slice(2, -2)}</b>
        if (!breakOnComma) return <Fragment key={i}>{p}</Fragment>
        const segs = p.split(/,\s*/)
        return (
          <Fragment key={i}>
            {segs.map((s, j) => (
              <Fragment key={j}>
                {s}
                {j < segs.length - 1 && (<>,<br /></>)}
              </Fragment>
            ))}
          </Fragment>
        )
      })}
    </>
  )
}

export const plain = (t: string) => t.replace(/\*\*|==/g, '')
