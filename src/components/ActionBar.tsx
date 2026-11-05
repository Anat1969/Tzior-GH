import type { ReactNode } from 'react'

// סרגל פעולות קבוע בתחתית המסך: הפעולות של הדף, תמיד באותו מקום ובאותו רוחב.
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="actions" role="toolbar" aria-label="פעולות">
      <div className="actions-inner">{children}</div>
    </div>
  )
}
