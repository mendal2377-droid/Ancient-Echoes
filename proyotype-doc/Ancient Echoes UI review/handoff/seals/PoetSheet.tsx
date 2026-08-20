// Drop-in for src/components/PoetSheet.tsx — item 6
// Only change vs original: the poem-row relation dot + relation text → 印章 seal.
// Everything else (bio, timeline, travels, graph/travels/influence modals) is unchanged.
import { useState } from 'react'
import type { Lang, Poet, Place, SeedData, RadarHit } from '../types'
import { t } from '../utils/i18n'
import { makeSyntheticHit } from '../utils/makeHit'
import PoetRelationshipGraph from './PoetRelationshipGraph'
import PoetTravels from './PoetTravels'
import InfluenceExplorer from './InfluenceExplorer'
import { RelationSeal } from './Seal'              // ← handoff/seals/Seal.tsx

interface Props {
  poet: Poet
  data: SeedData
  lang: Lang
  onBack: () => void
  onSelectPoem: (hit: RadarHit) => void
  onSelectPoet?: (poet: Poet) => void
  onSelectPlace?: (place: Place) => void
}

export default function PoetSheet({ poet, data, lang, onBack, onSelectPoem, onSelectPoet, onSelectPlace }: Props) {
  const [showGraph, setShowGraph] = useState(false)
  const [showTravels, setShowTravels] = useState(false)
  const [showInfluence, setShowInfluence] = useState(false)
  const poems = data.poems.filter(p => p.author_id === poet.id)
  const hasRelationships = poet.relationships && poet.relationships.length > 0
  const hasTravels = poet.travel_locations && poet.travel_locations.length > 1

  const handleSelectPoetFromGraph = (selectedPoet: Poet) => {
    setShowGraph(false)
    if (onSelectPoet) onSelectPoet(selectedPoet)
  }

  return (
    <>
      <div className="poet-topbar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="poet-topbar-label">{lang === 'zh' ? '诗人' : 'Poet'}</span>
      </div>

      <div className="poet-hero">
        <div className="poet-name-large">
          {t(poet.name, lang)}
          {poet.courtesy_name && (
            <span className="poet-courtesy-name"> · 「{t(poet.courtesy_name, lang)}」</span>
          )}
        </div>
        {poet.epithet.zh && (
          <div className="poet-epithet-text">「{t(poet.epithet as { zh: string; en: string }, lang)}」</div>
        )}
        <div className="poet-dates-text">{poet.lifespan.born}–{poet.lifespan.died}</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {hasRelationships && (
            <button className="poet-relationships-btn" onClick={() => setShowGraph(true)}>
              {lang === 'zh' ? '诗人关系图' : 'Poet Connections'}
            </button>
          )}
          {hasTravels && (
            <button className="poet-relationships-btn" onClick={() => setShowTravels(true)}>
              {lang === 'zh' ? '此地游迹' : 'Travels'}
            </button>
          )}
          <button className="poet-relationships-btn" onClick={() => setShowInfluence(true)}>
            {lang === 'zh' ? '文学传承' : 'Influence'}
          </button>
        </div>
      </div>

      {poet.biography && (
        <div className="poet-bio-section">
          <div className="section-label">{lang === 'zh' ? '生平' : 'Biography'}</div>
          <div className="poet-bio-text">{t(poet.biography, lang)}</div>
        </div>
      )}

      {poet.major_events && poet.major_events.length > 0 && (
        <div className="poet-timeline-section">
          <div className="section-label">{lang === 'zh' ? '人生轨迹' : 'Key Events'}</div>
          <div className="poet-timeline">
            {poet.major_events.map((evt, i) => (
              <div key={i} className="timeline-item">
                <span className="timeline-year">{evt.year}</span>
                <span className="timeline-event">{t(evt.event, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {poet.travel_locations && poet.travel_locations.length > 0 && (
        <div className="poet-travels-section">
          <div className="section-label">{lang === 'zh' ? '足迹' : 'Travels'}</div>
          <div className="poet-travels">
            {poet.travel_locations.map((loc, i) => {
              const place = data.places.find(p => p.id === loc.place_id)
              return place ? (
                <button key={i} className="travel-item" onClick={() => onSelectPlace?.(place)}>
                  <span className="travel-place">{t(place.name, lang)}</span>
                  <span className="travel-period">{t(loc.period, lang)}</span>
                </button>
              ) : null
            })}
          </div>
        </div>
      )}

      <div className="poet-poems-header">
        {lang === 'zh'
          ? `本辑收录 ${poems.length} 首`
          : `${poems.length} poem${poems.length !== 1 ? 's' : ''} in this collection`}
      </div>

      <div className="poet-poems-list">
        {poems.map(poem => {
          const hit = makeSyntheticHit(poem, data)
          if (!hit) return null
          const km = hit.pos.km
          const distLabel = km < 0.1
            ? (lang === 'zh' ? '你在这里' : 'here')
            : km < 1 ? `${Math.round(km * 1000)} m`
            : `${km.toFixed(1)} ${lang === 'zh' ? '公里' : 'km'}`

          return (
            <button key={poem.id} className="list-item" onClick={() => onSelectPoem(hit)}>
              {/* ← was <span className="list-dot" style={{background: RELCOLOR[...]}}/> */}
              <RelationSeal relation={hit.link.relation} confidence={hit.link.reliability.relation} size="xs" lang={lang} />
              <span className="list-body">
                <span className="list-title">{t(poem.title, lang)}</span>
                {/* relation text dropped — the seal states it; keep just the form */}
                <span className="list-meta">{t(poem.form, lang)}</span>
              </span>
              <span className="list-dist">{distLabel}</span>
            </button>
          )
        })}
      </div>

      {showGraph && (
        <div className="graph-modal-overlay" onClick={() => setShowGraph(false)}>
          <div className="graph-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="graph-modal-close" onClick={() => setShowGraph(false)}>✕</button>
            <PoetRelationshipGraph lang={lang} data={data} centerPoetId={poet.id} onSelectPoet={handleSelectPoetFromGraph} />
          </div>
        </div>
      )}

      {showTravels && (
        <div className="travels-modal-overlay" onClick={() => setShowTravels(false)}>
          <div className="travels-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="travels-modal-close" onClick={() => setShowTravels(false)}>✕</button>
            <PoetTravels poet={poet} allPlaces={data.places} lang={lang}
              onSelectPlace={(place) => { setShowTravels(false); onSelectPlace?.(place) }} />
          </div>
        </div>
      )}

      {showInfluence && (
        <div className="graph-modal-overlay" onClick={() => setShowInfluence(false)}>
          <div className="graph-modal-content scrollable" onClick={(e) => e.stopPropagation()}>
            <button className="graph-modal-close" onClick={() => setShowInfluence(false)}>✕</button>
            <InfluenceExplorer poet={poet} allPoets={data.poets} allPoems={data.poems} lang={lang}
              onSelectPoet={(selectedPoet) => { setShowInfluence(false); onSelectPoet?.(selectedPoet) }} />
          </div>
        </div>
      )}
    </>
  )
}
