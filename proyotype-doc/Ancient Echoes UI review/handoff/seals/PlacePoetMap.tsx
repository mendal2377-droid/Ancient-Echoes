// Drop-in for src/components/PlacePoetMap.tsx — items 4 (palette) + (§9 blur)
// Changes vs original:
//  · POET_COLORS rainbow → ONE accent (gold) differentiated by dash pattern +
//    opacity, so paths read as variations of one ink, not a rainbow (§3).
//  · Removed <filter id="mapGradient"> runtime blur (§9). Contours just thin-stroke.
//  · Place dots: jade fill → night-paper ink + gold ring.
// Logic (projection, hover/select, legend) is otherwise identical.
import { useState } from 'react'
import type { Lang, SeedData, Poet, Place } from '../types'

interface Props {
  lang: Lang
  data: SeedData
  onSelectPoet?: (poet: Poet) => void
  onSelectPlace?: (place: Place) => void
}

// one accent, many dash signatures — paths differ by rhythm, not hue
const PATH_DASH = ['0', '6 5', '2 6', '10 4 2 4', '1 6', '8 6'] as const
function getPoetDash(poetId: string): string {
  const hash = poetId.split('_')[1] || '0'
  const i = hash.charCodeAt(0) % PATH_DASH.length
  return PATH_DASH[i]
}

export default function PlacePoetMap({ lang, data, onSelectPoet, onSelectPlace }: Props) {
  const [hoveredPoetId, setHoveredPoetId] = useState<string | null>(null)
  const [selectedPoetId, setSelectedPoetId] = useState<string | null>(null)

  if (data.places.length === 0) {
    return <div className="map-stage">{lang === 'zh' ? '暂无地点数据' : 'No place data'}</div>
  }

  const minLat = Math.min(...data.places.map(p => p.coordinates.lat))
  const maxLat = Math.max(...data.places.map(p => p.coordinates.lat))
  const minLng = Math.min(...data.places.map(p => p.coordinates.lng))
  const maxLng = Math.max(...data.places.map(p => p.coordinates.lng))

  const padding = 50, canvasWidth = 500, canvasHeight = 500
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1
  const scale = Math.min((canvasWidth - padding * 2) / lngRange, (canvasHeight - padding * 2) / latRange)
  const projectCoord = (lat: number, lng: number) => ({
    x: padding + (lng - minLng) * scale,
    y: padding + (maxLat - lat) * scale,
  })

  const poetsWithTravel = data.poets.filter(p => p.travel_locations && p.travel_locations.length > 0)
  const ACCENT = 'var(--gold, #d8b072)'

  const poetPaths = poetsWithTravel.map(poet => {
    const places = poet.travel_locations
      ?.map(tl => data.places.find(p => p.id === tl.place_id))
      .filter(Boolean) as Place[]
    if (!places || places.length === 0) return null
    return {
      poet,
      coordinates: places.map(p => projectCoord(p.coordinates.lat, p.coordinates.lng)),
      dash: getPoetDash(poet.id),
      poetName: lang === 'zh' ? poet.name.zh : poet.name.en,
      places,
    }
  }).filter((p): p is NonNullable<typeof p> => p !== null)

  return (
    <div className="map-stage">
      <div className="map-container">
        <svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(216,176,114,0.06)" strokeWidth="0.5"/>
            </pattern>
          </defs>

          <rect width={canvasWidth} height={canvasHeight} fill="rgba(255,255,255,0.015)" />
          <rect width={canvasWidth} height={canvasHeight} fill="url(#mapGrid)" opacity="0.4" />

          {/* contour lines — thin gold ink, NO runtime blur (§9) */}
          <g opacity="0.1" stroke="rgba(216,176,114,0.5)" strokeWidth="0.8" fill="none">
            <path d={`M ${padding} ${padding + 50} Q ${canvasWidth/2} ${padding + 30}, ${canvasWidth - padding} ${padding + 60}`} />
            <path d={`M ${padding + 20} ${padding + 120} Q ${canvasWidth/2} ${padding + 100}, ${canvasWidth - padding - 20} ${padding + 140}`} />
            <path d={`M ${padding} ${canvasHeight - padding - 80} Q ${canvasWidth/2} ${canvasHeight - padding - 100}, ${canvasWidth - padding} ${canvasHeight - padding - 60}`} />
            <path d={`M ${padding + 30} ${canvasHeight - padding - 30} Q ${canvasWidth/2 + 50} ${canvasHeight - padding - 50}, ${canvasWidth - padding - 30} ${canvasHeight - padding - 20}`} />
          </g>

          {/* poet paths — one accent, distinguished by dash + opacity */}
          {poetPaths.map(path => {
            const isSelected = selectedPoetId === path.poet.id
            const isHovered = hoveredPoetId === path.poet.id
            const isActive = selectedPoetId === null || isSelected
            const opacity = isActive ? (isHovered ? 0.95 : 0.6) : 0.12
            const strokeWidth = isHovered ? 2.6 : (isActive ? 1.8 : 1.4)
            const pts = path.coordinates.map(c => `${c.x},${c.y}`).join(' ')
            return (
              <g key={`path-${path.poet.id}`} className="poet-path-group"
                onMouseEnter={() => setHoveredPoetId(path.poet.id)}
                onMouseLeave={() => setHoveredPoetId(null)}
                onClick={() => onSelectPoet?.(path.poet)} style={{ cursor: 'pointer' }}>
                <polyline points={pts} stroke={ACCENT} strokeWidth={strokeWidth} strokeDasharray={path.dash}
                  fill="none" opacity={opacity} className="poet-path"
                  style={{ transition: 'all 0.3s var(--ease, ease)' } as React.CSSProperties} />
                {(isHovered || isSelected) && (
                  <polyline points={pts} stroke={ACCENT} strokeWidth={5} fill="none" opacity={0.1}
                    style={{ pointerEvents: 'none' }} />
                )}
              </g>
            )
          })}

          {/* place dots — ink fill, gold ring */}
          {data.places.map(place => {
            const pos = projectCoord(place.coordinates.lat, place.coordinates.lng)
            const placeName = lang === 'zh' ? place.name.zh : place.name.en
            return (
              <g key={place.id} onClick={() => onSelectPlace?.(place)} className="place-dot-group" style={{ cursor: 'pointer' }}>
                <circle cx={pos.x} cy={pos.y} r={5.5} fill="#15111f" stroke="var(--gold)" strokeWidth={1.2}
                  className="place-dot" style={{ transition: 'all 0.3s var(--ease, ease)' }} />
                <text x={pos.x} y={pos.y - 15} textAnchor="middle" fontSize="11" fill="rgba(243,238,228,0.7)"
                  className="place-label" style={{ pointerEvents: 'none' }}>{placeName}</text>
                <title>{placeName}</title>
                <circle cx={pos.x} cy={pos.y} r={10} fill="none" stroke="var(--gold)" strokeWidth={1} opacity={0}
                  className="place-dot-glow" style={{ transition: 'opacity 0.3s var(--ease, ease)', pointerEvents: 'none' } as React.CSSProperties} />
              </g>
            )
          })}
        </svg>

        {poetPaths.length > 0 && (
          <div className="map-legend">
            <div className="legend-title">
              {lang === 'zh' ? '诗人足迹' : "Poets' Travels"}
              {selectedPoetId && (
                <button className="legend-clear" onClick={() => setSelectedPoetId(null)}
                  title={lang === 'zh' ? '清除筛选' : 'Clear filter'}>✕</button>
              )}
            </div>
            {poetPaths.map(path => (
              <div key={`legend-${path.poet.id}`}
                className={`legend-item${selectedPoetId === path.poet.id ? ' selected' : ''}`}
                onMouseEnter={() => setHoveredPoetId(path.poet.id)}
                onMouseLeave={() => setHoveredPoetId(null)}
                onClick={() => setSelectedPoetId(selectedPoetId === path.poet.id ? null : path.poet.id)}
                style={{ cursor: 'pointer' }}>
                {/* legend marker: a gold dash sample, not a colored dot */}
                <svg width="22" height="8" style={{ flex: 'none' }}>
                  <line x1="1" y1="4" x2="21" y2="4" stroke="var(--gold)" strokeWidth="2" strokeDasharray={path.dash} />
                </svg>
                <span>{path.poetName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
