// 月 · tonight's moon, not a picture of a moon.
//
// The phase, the side the light falls on, and how much the sky glows are all
// derived from the date. On 新月 almost nothing is lit and only the faint disc
// remains — which is correct, and quieter than anything a fixed gradient could
// have done.

import type { CSSProperties } from 'react'
import { moonPath, type Moon as MoonData } from './sky'

export function Moon({ size, moon, style }: { size: number; moon: MoonData; style?: CSSProperties }) {
  const r = size / 2
  // A crescent should not light the sky like a full moon. Keep a floor so the
  // moon never vanishes entirely from the composition.
  const glow = 0.1 + 0.26 * moon.illum
  const spread = 4 + 8 * moon.illum

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        boxShadow: `0 0 ${Math.round(size * 0.66)}px ${Math.round(spread)}px rgba(235,205,140,${glow.toFixed(3)})`,
        pointerEvents: 'none', animation: 'hnMoon 7s ease-in-out infinite',
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id="ae-moon-lit" cx="38%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#f8f0d9" />
            <stop offset="62%" stopColor="#e0c184" />
            <stop offset="100%" stopColor="#c9a86a" />
          </radialGradient>
        </defs>
        {/* 地照 — the unlit disc stays faintly present, the way it does on a
            clear night. Without it a new moon would leave a hole in the sky. */}
        <circle cx={0} cy={0} r={r} fill="rgba(235,205,140,.085)" />
        <path d={moonPath(r, moon)} fill="url(#ae-moon-lit)" />
      </svg>
    </div>
  )
}
