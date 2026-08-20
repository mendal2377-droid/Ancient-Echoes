// Drop-in for src/components/PlaceSheet.tsx
// Relation → 印章 seal in the poem rows; precision/lost stay as quiet text.
import type { Lang, Place, SeedData, RadarHit } from '../types'
import { t } from '../utils/i18n'
import { makeSyntheticHit } from '../utils/makeHit'
import { getPlaceIllustration } from '../assets/placeIllustrations'
import { RelationSeal } from './Seal'

const PRECISION: Record<string, { zh: string; en: string }> = {
  exact:       { zh: '精确', en: 'Exact' },
  approximate: { zh: '约略', en: 'Approximate' },
  district:    { zh: '片区', en: 'District' },
  lost:        { zh: '已失', en: 'Lost' },
}

interface Props {
  place: Place
  data: SeedData
  lang: Lang
  onBack: () => void
  onSelectPoem: (hit: RadarHit) => void
}

export default function PlaceSheet({ place, data, lang, onBack, onSelectPoem }: Props) {
  const poemsAtPlace = data.poems.filter(p =>
    p.place_links.some(l => l.place_id === place.id)
  )

  const relationOrder = ['written_here', 'describes', 'poet_present', 'event_here']
  poemsAtPlace.sort((a, b) => {
    const aLink = a.place_links.find(l => l.place_id === place.id)
    const bLink = b.place_links.find(l => l.place_id === place.id)
    return relationOrder.indexOf(aLink?.relation || '') - relationOrder.indexOf(bLink?.relation || '')
  })

  return (
    <>
      <div className="poet-topbar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="poet-topbar-label">{lang === 'zh' ? '地点' : 'Place'}</span>
      </div>

      <div className="place-photo-hero">
        <div className="place-illustration" dangerouslySetInnerHTML={{ __html: getPlaceIllustration(place.id) }} />
        <div className="place-photo-credit">
          {lang === 'zh' ? '古迹意象图 · Artistic Illustration' : 'Artistic Illustration'}
        </div>
      </div>

      <div className="poet-hero">
        <div className="poet-name-large">{t(place.name, lang)}</div>
        <div className="place-precision-badge">
          {t(PRECISION[place.coord_precision], lang)}
          {!place.still_exists && ` · ${lang === 'zh' ? '遗址不存' : 'site lost'}`}
        </div>
        <div className="modern-text" style={{ marginTop: '12px' }}>
          {t(place.modern_status, lang)}
        </div>
      </div>

      <div className="poet-poems-header">
        {lang === 'zh'
          ? `此地记录 ${poemsAtPlace.length} 首`
          : `${poemsAtPlace.length} poem${poemsAtPlace.length !== 1 ? 's' : ''} at this place`}
      </div>

      <div className="poet-poems-list">
        {poemsAtPlace.length === 0 ? (
          <div className="list-empty">{lang === 'zh' ? '暂无记录' : 'No records yet'}</div>
        ) : (
          poemsAtPlace.map(poem => {
            const hit = makeSyntheticHit(poem, data)
            if (!hit) return null
            const link = poem.place_links.find(l => l.place_id === place.id)
            if (!link) return null
            const poet = data.poets.find(p => p.id === poem.author_id)
            const km = hit.pos.km
            const distLabel = km < 0.1
              ? (lang === 'zh' ? '你在这里' : 'here')
              : km < 1 ? `${Math.round(km * 1000)} m`
              : `${km.toFixed(1)} ${lang === 'zh' ? '公里' : 'km'}`

            return (
              <button key={poem.id} className="list-item" onClick={() => onSelectPoem(hit)}>
                <RelationSeal relation={link.relation} confidence={link.reliability.relation} size="xs" lang={lang} />
                <span className="list-body">
                  <span className="list-title">{t(poem.title, lang)}</span>
                  <span className="list-meta">{poet ? t(poet.name, lang) : ''}</span>
                </span>
                <span className="list-dist">{distLabel}</span>
              </button>
            )
          })
        )}
      </div>
    </>
  )
}
