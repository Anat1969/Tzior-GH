import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppMark } from './Mark'

// השיחה שבה נבנתה האפליקציה
export const DEV_CHAT_URL = 'https://claude.ai/code/session_01UBnSCKktHgiX7jNbjthCFB'

type MenuEl = HTMLElement & { items?: { label: string; hint?: string; onSelect: () => unknown }[] }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ai-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string }
    }
  }
}

const NAV = [
  { to: '/', label: 'בית', end: true },
  { to: '/draw', label: 'ציור' },
  { to: '/journal', label: 'יומן' },
  { to: '/method', label: 'שיטה' },
]

export function TopBar() {
  const menu = useRef<MenuEl>(null)
  useEffect(() => {
    if (!menu.current) return
    menu.current.items = [
      { label: 'מחיקת היומן', hint: 'כל הציורים בדפדפן הזה', onSelect: () => { if (confirm('למחוק את כל הציורים מהיומן?')) { localStorage.removeItem('tzior_journal_v1'); location.href = '/' } } },
    ]
  }, [])
  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <Link to="/" className="brand" aria-label="ציור שמגלה חוזקה, דף הבית">
          <AppMark />
          <span className="brand-name">ציור שמגלה חוזקה</span>
        </Link>
        <nav className="nav" aria-label="ניווט ראשי">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="logo-slot">
          <ai-menu ref={menu} chat={DEV_CHAT_URL} />
        </div>
      </div>
    </header>
  )
}
