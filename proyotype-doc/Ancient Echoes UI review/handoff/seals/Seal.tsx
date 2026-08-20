// ─────────────────────────────────────────────────────────────────────────
// handoff/seals/Seal.tsx  →  src/components/Seal.tsx
// The one 印章 component, used everywhere reliability/relation is shown (§7).
// Replaces every colored relation pill / dot and every .conf-* progress bar.
// Requires seal.css (append to src/index.css).
// ─────────────────────────────────────────────────────────────────────────
import type { Lang, Relation, Reliability } from '../types'
import { t } from '../utils/i18n'
import { REL_SEAL, CONF_CHAR, CONF_WEIGHT, type SealWeight } from '../utils/relation'

type Size = 'xs' | 'sm' | 'md' | 'lg'

// base seal: 1–4 chars, weight encodes confidence
export function Seal({ chars, weight, size = 'sm' }: { chars: string; weight: SealWeight; size?: Size }) {
  const layout = chars.length > 2 ? 'grid' : 'stack'
  return (
    <span className={`seal-stamp seal-stamp--${size} seal-stamp--${weight} seal-stamp--${layout}`} aria-hidden>
      {chars.split('').map((c, i) => <span key={i}>{c}</span>)}
    </span>
  )
}

// relation as a seal; weight optionally driven by the relation's confidence
export function RelationSeal({ relation, confidence = 'high', size = 'sm', lang }: {
  relation: Relation
  confidence?: Reliability
  size?: Size
  lang: Lang
}) {
  const chars = t(REL_SEAL[relation] ?? REL_SEAL.describes, lang)
  // en falls back to the zh characters for the stamp (a seal is always 漢字)
  const stamp = (REL_SEAL[relation] ?? REL_SEAL.describes).zh
  return <Seal chars={lang === 'zh' ? chars : stamp} weight={CONF_WEIGHT[confidence]} size={size} />
}

// a single confidence seal (高/中/低/疑)
export function ConfidenceSeal({ conf, size = 'sm' }: { conf: Reliability; size?: Size }) {
  return <Seal chars={CONF_CHAR[conf]} weight={CONF_WEIGHT[conf]} size={size} />
}
