// יומן הציורים: נשמר רק בדפדפן של המשתמש/ת (localStorage). ציור הוא חומר אישי, ולכן הוא לא עולה לשרת.
import type { Measures } from '../engine/measure'

export type Resonance = 'yes' | 'partly' | 'no'
export type AiText = { insight: string; explanation: string; questions: string[]; haiku: string[]; by: 'gemini' | 'claude' | 'local' }

export type Entry = {
  id: string
  createdAt: string
  directiveId: string
  image: string // JPEG מוקטן
  measures: Measures
  topStrengthId: number
  shadowStrengthId: number
  shadowActive: boolean
  dormantStrengthId: number | null
  resonance: { strength?: Resonance; shadow?: Resonance; dormant?: Resonance }
  ai?: AiText
  note?: string
}

const KEY = 'tzior_journal_v1'

export function loadAll(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Entry[]
  } catch {
    return []
  }
}

function saveAll(list: Entry[]) {
  for (let keep = list.length; keep > 0; keep--) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, keep)))
      return
    } catch {
      // המכסה מלאה: שומרים את החדשים
    }
  }
}

export const getEntry = (id: string) => loadAll().find((e) => e.id === id)

export function addEntry(e: Entry) {
  saveAll([e, ...loadAll()])
}

export function updateEntry(id: string, patch: Partial<Entry>) {
  saveAll(loadAll().map((e) => (e.id === id ? { ...e, ...patch } : e)))
}

export function removeEntry(id: string) {
  saveAll(loadAll().filter((e) => e.id !== id))
}

export const RES_SCORE: Record<Resonance, number> = { yes: 1, partly: 0.5, no: 0 }
