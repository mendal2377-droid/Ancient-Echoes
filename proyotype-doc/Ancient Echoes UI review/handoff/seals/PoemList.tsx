// Drop-in for src/components/PoemList.tsx
// The relation is now a 印章 seal (replaces the colored dot + "· 作于此地" text).
import type { Lang, RadarHit, Poet } from '../types'
import { t } from '../utils/i18n'
import { RelationSeal } from './Seal'

function formatDist(km: number, lang: Lang): string {
  if (km < 0.1) return lang === 'zh' ? '你在这里' : 'here'
  if (km < 1)   return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} ${lang === 'zh' ? '公里' : 'km'}`
}

interface Props {
  hits: RadarHit[]
  poets: Poet[]
  lang: Lang
  onSelect: (hit: RadarHit) => void
}

export default function PoemList({ hits, poets, lang, onSelect }: Props) {
  if (hits.length === 0) {
    return (
      <div className="list-empty">
        {lang === 'zh'
          ? '扫描后，此地的诗作将在这里列出'
          : 'Scan first — echoes will appear here'}
      </div>
    )
  }

  const sorted = [...hits].sort((a, b) => a.pos.km - b.pos.km)

  return (
    <div className="poem-list">
      {sorted.map(hit => {
        const { poem, link, pos } = hit
        const poet = poets.find(p => p.id === poem.author_id)
        return (
          <button key={poem.id} className="list-item" onClick={() => onSelect(hit)}>
            <RelationSeal relation={link.relation} confidence={link.reliability.relation} size="xs" lang={lang} />
            <span className="list-body">
              <span className="list-title">{t(poem.title, lang)}</span>
              <span className="list-meta">{poet ? t(poet.name, lang) : ''}</span>
            </span>
            <span className="list-dist">{formatDist(pos.km, lang)}</span>
          </button>
        )
      })}
    </div>
  )
}
