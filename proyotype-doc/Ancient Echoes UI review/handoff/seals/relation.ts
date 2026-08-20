// ─────────────────────────────────────────────────────────────────────────
// handoff/seals/relation.ts  →  src/utils/relation.ts
// Single source of truth for the honesty layer (ui_principles.md §7).
// Every component imports these maps instead of re-declaring RELTXT/RELCOLOR.
// ─────────────────────────────────────────────────────────────────────────
import type { Relation, Reliability } from '../types'

// relation → the four characters stamped on the 印章
export const REL_SEAL: Record<Relation, { zh: string; en: string }> = {
  written_here: { zh: '作于此地', en: 'Written here' },
  describes:    { zh: '描写此地', en: 'Describes' },
  poet_present: { zh: '诗人曾驻', en: 'Poet present' },
  event_here:   { zh: '史事发生', en: 'Event here' },
}

// confidence → seal weight (full vermilion / half-tone / outline / outline+疑)
export type SealWeight = 'high' | 'medium' | 'low' | 'disputed'
export const CONF_WEIGHT: Record<Reliability, SealWeight> = {
  high: 'high', medium: 'medium', low: 'low', disputed: 'disputed',
}
export const CONF_CHAR: Record<Reliability, string> = {
  high: '高', medium: '中', low: '低', disputed: '疑',
}

export const FIELD_LABEL = {
  attribution: { zh: '作者', en: 'Author' },
  location:    { zh: '地点', en: 'Place' },
  relation:    { zh: '关系', en: 'Relation' },
} as const

export const DYNASTY_ZH: Record<string, string> = {
  Tang: '唐', Song: '宋', Jin: '晋', Han: '汉', Wei: '魏',
  Sui: '隋', Yuan: '元', Ming: '明', Qing: '清', Zhou: '周',
}
