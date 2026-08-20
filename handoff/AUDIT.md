# Ancient Echoes — Visual Audit & Handoff Index

Everything from the review, in execution order. Mockups live in project root
(`*.dc.html`); code drop-ins live in `handoff/`.

## Delivered (ready to use)
| Area | Files |
|---|---|
| A · Poem page (vertical 楷体, seals, breath, 你并不孤单) | `handoff/PoemSheet.tsx`, `handoff/poem-sheet-ink.css`, mockup `诗页 Poem Page.dc.html` |
| B · 此情 ink-mist (kills blue cosmic bg + 3 blur nebulas; per-emotion tint) | `handoff/EmotionUniverse-ink.css`, mockup `此情 Emotion Universe.dc.html` |
| C · Seal system app-wide | `handoff/seals/*` (relation.ts, Seal.tsx, seal.css, PoemList.tsx, PlaceSheet.tsx), mockup `印章 Seal System.dc.html` |
| 此景 SceneMode → ink moon-gate | mockup `此景 SceneMode.dc.html` |
| 此地 Radar → brush rings + ink sweep | mockup `此地 Radar.dc.html` |
| §12 test willow (ink-wash proof) | `测试垂柳 Test Willow.dc.html` |

## Remaining plan — execute one by one

### 1. Delete dead code (do FIRST — removes most anti-patterns at once)
Rendered nowhere (confirmed via JSX-usage grep):
`BottomNav.tsx`, `EmotionScan.tsx`, `EmotionGarden.tsx`, `MyPlanet.tsx`, `ModeToggle.tsx`.
- Keep `AppMode` type — move it from BottomNav into `types/index.ts`, update App.tsx import.
- Delete their CSS: `.eu-planet*`, `.mp-*`, `.eg-*`, `.eu-cosmic-heart`, `.eu-nebula` planet bits, `.es-*`, `.abn-*` (~1000 lines, index.css ~2160–3130 & 3360–3525 & 4015–4090 & 4555–4640).
- Removes: the orphaned digital emotion bars (`eg-emo-fill`), vector plants, "wormhole" nav metaphor.

### 2. SceneMode 此景 — apply the ink redesign (mockup: `此景 SceneMode.dc.html`)
- Replace `sm-wormhole-*` rings with the 月洞门 moon-gate (round ink window onto mountains+moon+mist).
- Rewrite copy: drop "投入时间的漩涡 / vortex of time" + "wormhole is forming". Keep "此山此月，古人曾凝视"; subtitle "你眼前之景，他们也曾见过。"
- Scene tags: 楷体 hanzi 月山水雾花雪 (NOT emoji ☽⛰～◌✿).

### 3. Radar 此地 — apply the ink redesign (mockup: `此地 Radar.dc.html`)
- Rings → brushed SVG circles with `feTurbulence`+`feDisplacementMap` (baked to PNG for prod, §9).
- Sweep → soft ink wedge, not conic-gradient.
- Pins → ink-drop blobs (irregular border-radius) with 楷体 poem names; **remove the overshoot ease** `cubic-bezier(0.34,1.56,0.64,1)` → use `--ease`. (§6)
- Legend → seals (reuse `handoff/seals/Seal.tsx`).
- Sheet open: swap `.sheet/.poet-sheet/.place-sheet` `translateY(100%)` for ink-bloom (`.bloom-in`). (§6)

### 4. PlacePoetMap — palette + blur
- `POET_COLORS` rainbow (`#d4af37,#c97a5a,#f0e68c,#708090,#8b4513…`) → all `--gold` differentiated by opacity/dash, OR per-emotion accent. One accent per screen. (§3)
- Remove `<filter id="mapGradient">` runtime blur. (§9)
- Place dots: `var(--jade)` fill → ink + gold; consider tiny seals on tap.

### 5. CityMap — off-token colors
- GPS marker `#64b4ff` blue → `--gold`/`--paper`. Yangtze/coast jade `rgba(111,182,166)` ok but unify with `--emo-shanshui`. River/grid already gold-tinted — fine.

### 6. PoetSheet — seals (uses handoff C)
- Swap `.list-dot` + `RELTXT` text for `<RelationSeal relation={hit.link.relation} confidence={hit.link.reliability.relation} size="xs" lang={lang}/>`; delete local RELTXT/RELCOLOR. (§7)

### 7. Homecoming + PathOfLife — polish
- Homecoming SVG scene is the closest-to-target asset; soften the hard-vector pines/mountains with the willow's ink filter; keep moon/path.
- PathOfLife: replace the vector `FlowerBloom` nodes with ink-bloom dabs; sheet → ink-bloom. Otherwise on-brand.

### 8. Place illustrations (the 20 SVGs) — biggest art debt
- Still on OLD jade/brown palette (`#6fb6a6,#8b6914,#f0e68c`); hard vector clip-art.
- Short term: recolor to tokens. Real fix: commission ink-wash silhouettes per the §12 willow process (silhouette-first, bloomed edges, 飞白), baked to a sprite atlas.

## Delivered round 2 (code drop-ins — all in handoff/)
| Item | File | Note |
|---|---|---|
| 6 · PoetSheet seals | `seals/PoetSheet.tsx` | dot+text → 印章 seal; wires travel onSelectPlace |
| 4 · PlacePoetMap | `seals/PlacePoetMap.tsx` | rainbow → 1 gold accent + dash signatures; blur removed; ink dots |
| 5 · CityMap GPS | `seals/MAPS_README.md` | blue `#64b4ff` → gold (diff patch) |
| 9·14 · Sheet bloom + edges | `polish.css` | sheets ink-bloom not slide; kill overshoot; ink-soft filter for scenes |

Install order for round 2: ensure Handoff C (`seals/*`) is in first (PoetSheet &
the maps import `./Seal`), then drop these in and append `polish.css`.

## Cross-cutting rules to enforce
- Seal red `--seal` = the ONLY red. Gold = data/own/primary only.
- ≤1 live blur per scene; bake haze into art. (§9)
- One transition everywhere = ink-bloom; min 400ms; no spring/overshoot. (§6)
- One accent hue per screen; no saturated/neon; no emoji. (§3, §5)
