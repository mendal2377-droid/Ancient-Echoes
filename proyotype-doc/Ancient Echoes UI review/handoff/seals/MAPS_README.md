# Handoff — items 4·5·6 (maps + poet seals)

Drop-ins produced this round. All are additive; behaviour preserved except the
visual changes noted.

## 6 · PoetSheet.tsx  →  src/components/PoetSheet.tsx
Replaces the poem-row colored `list-dot` + relation text with a `<RelationSeal>`.
Depends on handoff/seals/Seal.tsx + relation.ts + seal.css (Handoff C).
Also wires the previously-TODO travel-item `onSelectPlace`. Delete the local
`RELTXT` / `RELCOLOR` (now unused).

## 4 · PlacePoetMap.tsx  →  src/components/PlacePoetMap.tsx
- `POET_COLORS` rainbow → ONE gold accent; poets differ by **dash signature** +
  opacity, not hue (§3). `getPoetColor` → `getPoetDash`.
- Removed `<filter id="mapGradient">` runtime blur (§9).
- Place dots: jade fill → ink `#15111f` + gold ring.
- Legend swatch: colored dot → a small gold dashed line sample.
- **CSS note:** the legend marker is now an inline `<svg>`, so the old
  `.legend-dot { width/height/border-radius/background }` rule no longer applies
  to it. Add `gap:8px; align-items:center` to `.legend-item` if not already there.

## 5 · CityMap.tsx — one small patch (no full file needed)
Only the GPS marker is off-token (blue `#64b4ff`). The grid, 黄河 (gold) and
长江/东海 (jade = 山水 accent) are fine. Patch the `userLat/userLng` block:

```diff
-              <circle cx={x} cy={y} r={14}
-                fill="rgba(100,180,255,0.10)"
-                stroke="rgba(100,180,255,0.35)"
-                strokeWidth={1}>
+              <circle cx={x} cy={y} r={14}
+                fill="rgba(216,176,114,0.10)"
+                stroke="rgba(216,176,114,0.35)"
+                strokeWidth={1}>
                 <animate attributeName="r" values="10;20;10" dur="2.5s" repeatCount="indefinite" />
                 <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
               </circle>
-              <circle cx={x} cy={y} r={4} fill="#64b4ff" opacity={0.9} />
+              <circle cx={x} cy={y} r={4} fill="var(--gold)" opacity={0.9} />
               <text x={x} y={y - 12} textAnchor="middle" fontSize={9}
-                fill="rgba(100,180,255,0.8)" fontFamily="serif">
+                fill="rgba(216,176,114,0.85)" fontFamily="serif">
                 {lang === 'zh' ? '你在此' : 'You'}
               </text>
```
(Gold = "your own / here", consistent with the radar's centre dot.)
