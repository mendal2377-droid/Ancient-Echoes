// Ambient particle fields — stars, fireflies, drifting petals, snow, falling
// petals. Deterministic layout (seeded pseudo-random) so a given field is
// stable across renders, exactly as in the reference `particles(kind)`.
import type { CSSProperties } from 'react'

export type ParticleKind = 'star' | 'firefly' | 'petal' | 'snow' | 'fallpetal'

const R = (i: number, m: number) => ((i * 9301 + 49297 * (m + 1)) % 233280) / 233280

function count(kind: ParticleKind): number {
  switch (kind) {
    case 'star': return 46
    case 'petal': return 14
    case 'snow': return 26
    case 'fallpetal': return 16
    default: return 11 // firefly
  }
}

// `seed` offsets the phase so multiple fields of the same kind don't overlap.
export default function Particles({ kind, seed = 0 }: { kind: ParticleKind; seed?: number }) {
  const spans: JSX.Element[] = []
  const n = count(kind)
  for (let j = 0; j < n; j++) {
    const i = j + seed * 131
    const x = (R(i, 1) * 100).toFixed(2)
    let style: CSSProperties

    if (kind === 'star') {
      const y = (5 + R(i, 2) * 60).toFixed(2)
      const gold = R(i, 8) > 0.72
      const s = (1 + R(i, 3) * (gold ? 1.8 : 1.3)).toFixed(2)
      const dur = (4 + R(i, 4) * 8).toFixed(2)
      style = {
        position: 'absolute', left: x + '%', top: y + '%', width: s + 'px', height: s + 'px',
        borderRadius: '50%', background: gold ? '#ebcd8c' : 'rgba(243,238,228,.92)',
        boxShadow: gold ? '0 0 5px 1px rgba(235,205,140,.6)' : 'none',
        animation: `hnGlow ${dur}s ease-in-out ${(-R(i, 6) * +dur).toFixed(2)}s infinite`,
      }
    } else if (kind === 'fallpetal') {
      const dur = (8 + R(i, 4) * 6).toFixed(2)
      const w = (5 + R(i, 3) * 4)
      const tint = R(i, 8) > 0.5 ? '224,150,170' : '232,190,150'
      style = {
        position: 'absolute', left: x + '%', top: '-4%', width: w.toFixed(2) + 'px', height: (w * 0.7).toFixed(2) + 'px',
        borderRadius: '60% 60% 60% 0', background: `rgba(${tint},.6)`, boxShadow: `0 0 6px 1px rgba(${tint},.3)`,
        animation: `hnPetalFall ${dur}s linear ${(-R(i, 6) * +dur).toFixed(2)}s infinite`,
      }
    } else if (kind === 'snow') {
      const dur = (7 + R(i, 4) * 7).toFixed(2)
      const s = (2 + R(i, 3) * 2.6).toFixed(2)
      style = {
        position: 'absolute', left: x + '%', top: '-4%', width: s + 'px', height: s + 'px',
        borderRadius: '50%', background: 'rgba(238,242,247,.85)', boxShadow: '0 0 4px 1px rgba(200,212,230,.5)',
        animation: `hnSnow ${dur}s linear ${(-R(i, 6) * +dur).toFixed(2)}s infinite`,
      }
    } else if (kind === 'petal') {
      const dur = (7 + R(i, 4) * 6).toFixed(2)
      const s = (3 + R(i, 3) * 3)
      style = {
        position: 'absolute', left: x + '%', bottom: (R(i, 2) * 30).toFixed(2) + '%',
        width: s.toFixed(2) + 'px', height: (s * 0.7).toFixed(2) + 'px', borderRadius: '60% 60% 60% 0',
        background: 'rgba(240,196,206,.7)', boxShadow: '0 0 6px 1px rgba(240,196,206,.4)',
        animation: `hnDrift ${dur}s linear ${(-R(i, 6) * +dur).toFixed(2)}s infinite`,
      }
    } else { // firefly
      const y = (28 + R(i, 2) * 60).toFixed(2)
      const s = (2 + R(i, 3) * 2.6).toFixed(2)
      const dur = (4 + R(i, 4) * 5).toFixed(2)
      const fl = (6 + R(i, 5) * 6).toFixed(2)
      style = {
        position: 'absolute', left: x + '%', top: y + '%', width: s + 'px', height: s + 'px',
        borderRadius: '50%', background: '#ebcd8c', boxShadow: '0 0 6px 2px rgba(235,205,140,.7)',
        animation: `hnGlow ${dur}s ease-in-out ${(-R(i, 6) * +dur).toFixed(2)}s infinite, hnFloat ${fl}s ease-in-out ${(-R(i, 7) * +fl).toFixed(2)}s infinite alternate`,
      }
    }
    spans.push(<span key={j} style={style} />)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {spans}
    </div>
  )
}
