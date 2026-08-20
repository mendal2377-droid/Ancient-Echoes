# Handoff: 此时此地 (Here & Now) — Ancient Echoes

## Overview
A contemplative mobile app that meets you where you are emotionally, then hands you a
classical Chinese poem written by someone who felt the same thing a thousand years ago.
The emotional arc is the product: **feel → discover you are not alone → read → keep**.
The core loop is:

`首页 Home → 花园 Choose a feeling → 共鸣 Resonance scan → 诗 Poem (paper) → 留在花径 Keep → 花径 The path`

## About the Design Files
The files in this bundle are **design references authored in HTML** (as "Design
Components") — working prototypes that show the intended look, motion, and behavior.
**They are not production code to copy.** The task is to **recreate these designs in the
target codebase's own environment** (React Native / SwiftUI / Flutter / web, etc.) using
its established components, navigation, and state patterns. If no app environment exists
yet, pick the framework best suited to a motion-heavy, single-hand mobile experience and
implement there.

The prototype is a single stateful component that swaps full-screen "screens" behind a
phone bezel. In a real app each screen is a route/view; the bezel and the phone-frame
wrapper are prototype-only and should be dropped.

## Fidelity
**High-fidelity.** Colors, typography, spacing, motion timings, and copy are final and
intentional. Recreate the UI faithfully. The one thing that is *not* final is imagery:
every screen sits on an empty drop-in image slot awaiting real ink-wash paintings (see
`Art Plan - one painting per feeling.md`). Treat those slots as full-bleed background
images behind the existing foreground layers.

---

## Screenshots
Reference renders of each screen are in `screenshots/` (the phone bezel is prototype-only
framing — recreate only the screen content):
- `screenshots/1-home.png` — 首页 Home
- `screenshots/2-feeling.png` — 花园 Choose a feeling
- `screenshots/3-scan.png` — 共鸣 Resonance scan
- `screenshots/4-poem.png` — 诗 Poem (paper)
- `screenshots/5-path.png` — 花径 The path

## Screens / Views

### 1. 首页 Home — "the day's poem finds you"
- **Purpose**: A calm landing. Shows today's season, a one-line framing ("You and Wang
  Wei, 1,300 years apart, share one longing"), and today's poem set vertically in the
  negative space. Primary CTA opens the feeling picker.
- **Layout**: Full-bleed dark ground. Top: status bar (9:41). Header row (top-left):
  app title `此时此地` + a bordered `中 · EN` language pill immediately to its right
  (flex-start, gap 11px). Moon: 42px glowing disc, top:52 right:40 (top-right corner,
  clear of the header). Season label `夜 · 谷雨` centered ~top:86. Framing couplet
  centered ~top:110. Today's poem: vertical 楷 columns anchored center-right (right:34,
  vertically centered), read right-to-left. Bottom: primary pill CTA `选择此刻的心情`
  (~bottom:120), hint line `— 轻触诗句，细读今日之诗 —` (~bottom:78), then the shared
  tab bar.
- **Interactions**: Tap the poem columns → open Poem directly (`readDaily`, skips scan,
  emotion = 相思). Tap `选择此刻的心情` or the 花园 tab → Feeling. Language pill is
  currently decorative.

### 2. 花园 Feeling — "choose a feeling; kinship, not a menu"
- **Purpose**: Pick the emotion you feel right now. Presented as a constellation, not a
  list — seven glowing emotion "orbs" orbiting your own gold planet at center.
- **Layout**: Dark ground + starfield. Title `此刻，你心里是哪一种？` + subtitle
  `轻触一种心情` centered ~top:52. Center orb `我的星球` (78px gold) at left:118 top:300
  (center 157,339). Seven emotion orbs positioned around it (see Design Tokens → Orbs).
  Faint gold constellation lines connect **each orb's center to the center planet**
  (computed, not hardcoded). Shared tab bar at bottom (花园 active).
- **Interactions**: Tap any orb → `choose(key)` sets emotion and goes to Resonance scan.
  Center planet → the path. Orbs float via a slow `aeFloat` breath.

### 3. 共鸣 Resonance scan — "who, ever, felt this?"
- **Purpose**: The emotional turn. A radar sweep "searches across time" and blooms in the
  names of poets who wrote from this same feeling, one by one, ending on the count and a
  "read this poem" button.
- **Layout**: Dark ground + starfield. Title `谁，曾有此感？` + `{feeling} · 正在寻找同感的人…`
  centered ~top:58. A close `×` top-left → back to Feeling. Radar: 250px concentric dashed
  rings centered ~top:346, a rotating conic sweep (`aeSpin` 6s), an expanding ping ring
  (`aeRing`), a central gold node = "you". Poet names bloom in at staggered positions
  (5 slots, decreasing opacity/size, `aeRise` at 0.3/1.1/1.9/2.6/3.1s). Count line
  `已找到 {N}位 同感的人` (~bottom:96). After ~2.6s a gold CTA `读这首诗 →` appears
  (~bottom:38).
- **Interactions**: A timer (`2600ms`) sets `scanReady` → reveals the CTA → Poem. `×` →
  Feeling.

### 4. 诗 Poem — "the product, on paper"
- **Purpose**: Where relief lands. The night ground gives way to warm **paper**. The poem
  sits in a mounted scroll panel, vertical 楷, with a cinnabar seal, then the reassurance
  `你并不孤单`, a one-line gloss, an honesty legend, and two keep actions.
- **Layout**: Warm paper ground (radial highlight top). Top bar: `共鸣 · {feeling}` (left)
  and `×` (right) ~top:44. Scroll panel: rounded card top:82, left/right:26, height 392,
  inset shadow; poem columns centered inside (right-to-left: title, `〔dynasty〕author`,
  then lines). Cinnabar seal bottom-left of the card = a 2×2 reading **此 时 / 此 地**
  (i.e. 此时此地). Below the card: `你并不孤单` (~top:488), gloss note (~top:520),
  honesty legend of three seal chips 作者/地点/关系 (~top:558). Bottom: two pills —
  outlined `存为卡片` and gold `留在花径`.
- **Interactions**: `留在花径` → `keep()` prepends the poem to the path **and persists to
  localStorage**, then a toast `✦ 已留在花径`. `存为卡片` → toast `✦ 已存为卡片`. `×` →
  returns to whichever screen you came from (`poemFrom`).

### 5. 花径 The Path — "the poems you kept, as a lit path through the year"
- **Purpose**: The reason to return. Your kept poems become a winding, glowing garden
  path — a personal timeline you walk.
- **Layout**: Dark ground, moon top-right, drifting fireflies. Header (top-left):
  `人生花径` + italic English `the path you've walked`; year on the right. A **vertical
  scroll area** contains a winding dashed-gold SVG trail (drop-shadow glow) with a glowing
  node per kept poem. **Newest is at the top** (labeled `今日`), oldest at the bottom.
  Node x-position follows a sine wave (`x = 159 + 82·sin(i·0.92 + 0.6)`, 104px vertical
  gap); each label (date + `title · author`) sits on the open side of its node (left/right
  alternates by which half the node is on). Shared tab bar at bottom (花径 active).
- **Interactions**: Fed entirely by the persisted `kept` array; grows as the user keeps
  more. Scrollable when the path exceeds one screen.

---

## Interactions & Behavior
- **Navigation**: single `screen` value drives which view renders. `go(screen)` for tab
  taps; `choose(key)` (Feeling→Scan), `enterPoem` (Scan→Poem), `readDaily` (Home→Poem),
  `closePoem` (→ `poemFrom`).
- **Screen transitions**: every screen enters with `aeBloom` (0.8s, ease) — an ink-bloom:
  opacity 0→1, blur 13px→0, scale 1.016→1. This is the signature "changes by ink-bloom"
  motion; preserve it on route changes.
- **Ambient motion (always running, subtle, 2–6s)**: `aeMoon` (moon/node breath),
  `aeFloat` (orbs, fireflies rise), `aeGlow` (star/firefly twinkle), `aeMist` (drifting
  haze), `aeRise` (staged content entrance with blur), `aeSpin`/`aeRing` (scan radar),
  `aeToast` (toast in/out).
- **Scan timing**: `scanReady` flips true 2600ms after entering Scan; only then is the
  "read this poem" CTA shown.
- **Toast**: single `toast` string; set on keep/save-card, auto-clears after 2200ms.
- **No hard page reloads**: transitions are in-place; keep the ambient particle fields
  mounted so they don't restart on every render.

## State Management
- `screen`: `'home' | 'feeling' | 'scan' | 'poem' | 'path'`
- `emotion`: one of the 7 feeling keys (`xiangsi, huaigu, sixiang, libie, youqing,
  shanshui, duju`)
- `scanReady`: boolean (gated by the 2600ms timer)
- `poemFrom`: which screen to return to when the poem closes
- `toast`: string ('' = hidden)
- `kept`: array of `{ date, title, author }`, newest-first — **persisted**

### Persistence
Kept poems are stored under `localStorage` key **`ae-kept-path`** (JSON array). On load,
parse it; fall back to a seed list if absent/invalid. Every `keep()` writes the updated
array back. In a real app this is a user-scoped collection (local cache + server sync).

### Emotion data model
Each feeling carries: `label` (2-char 情), `en`, `rgb` (its hue), poem `title`, `author`
(`〔dynasty〕name`), `lines[]`, `found[]` (resonant poets), `count` (Chinese numeral),
`note` (gloss). See `EMO` in the loop file for the full seven-entry dataset.

## Design Tokens

### Colors
- **Night grounds**: `#08080d`, `#09090f`, mixing into `#120e1c` / `#171120`; device
  bezel `linear-gradient(150deg,#17171f,#0a0a10)`.
- **Warm paper (宣纸)**: highlights `#f5efe2` / `#f7f1e5`, body `#efe9db` → `#e6decb` →
  `#dcd3c1`; paper ink text `#231d2b` / `#2a2438`.
- **Gold (泥金 — the sacred "you"/data color)**: `#ebcd8c`, `#c9a86a`, `#e0c184`,
  `#f6ecd0`; glows use `rgba(235,205,140,α)`.
- **Cinnabar (朱印 — the only red, attribution/honesty)**: `#a83a2a`, chips on paper
  `#f6ece0` text.
- **Interface text on dark**: `#e8e2d4`, `#f3eee4`, and `rgba(243,238,228, .4–.85)`.
- **Seven feeling hues** (atmosphere tint + orb glow, one per emotion):
  - 相思 longing `#e0709a` (rgb 224,112,154)
  - 怀古 nostalgia `#b09cd8` (176,156,216)
  - 思乡 homesick `#6fb6b8` (111,182,184)
  - 离别 parting `#7fa6d8` (127,166,216)
  - 友情 friendship `#e8b86a` (232,184,106)
  - 山水 stillness `#6fb88a` (111,184,138)
  - 独居 solitude `#9a8fd0` (154,143,208)
- **Links**: default `#c9a86a`, hover `#e3c98a`.

### Typography
- **宋 interface voice**: `'Noto Serif SC'` (weights 400/500/600/700), fallback
  `'Songti SC', serif`. Titles ~15–22px, letter-spacing .14–.2em.
- **楷 poem voice (vertical)**: `'Kaiti SC','STKaiti','KaiTi','Noto Serif SC', serif`,
  `writing-mode: vertical-rl; text-orientation: upright`. Poem lines ~23–27px,
  letter-spacing .26–.3em; read right-to-left.
- **English**: `'Cormorant Garamond', serif`, italic, ~11–15px (subtitles, tags only).

### Spacing / shape / motion
- Device frame radius 48px (pad 11px); screen radius 37px; content ≈ 318×702.
- Pills/buttons radius 22–26px; cards radius 6px; seal chips radius 4–5px.
- Big shadows: `0 42px 96px rgba(0,0,0,.6)` (bezel), inset hairline highlights.
- Motion: screen transition `aeBloom` 0.8s ease; ambient breaths 5–7s; staged entrances
  `aeRise` 1–1.4s with 6px blur; scan timer 2600ms; toast 2200ms.

### Orb layout (花园, within the 318×702 screen; `left, top, size` px)
相思 `214,250,62` · 友情 `200,150,46` · 怀古 `40,210,58` · 离别 `26,130,40` ·
思乡 `44,366,52` · 山水 `210,372,50` · 独居 `118,424,42` · center 我的星球 `118,300,78`
(center point 157,339 — draw connector lines from here to each orb center).

## Assets
- **No raster assets ship in this bundle.** Every screen has a full-bleed drop-in image
  slot (`ae-home2`, `ae-path`, etc.) awaiting ink-wash paintings. The art direction,
  hue-per-feeling grid, and composition contract are fully specified in
  `Art Plan - one painting per feeling.md` — implement the slots as background images and
  commission/generate art per that plan (start with 相思·春).
- Fonts load from Google Fonts (Noto Serif SC, Cormorant Garamond). 楷 relies on
  system Kai fonts; bundle a webfont Kai for cross-platform consistency.
- Moon, orbs, stars, fireflies, radar, seals, and the path trail are all drawn with
  CSS/SVG — no image files needed.

## Files
- `Ancient Echoes - Loop.dc.html` — the wired interactive loop (all 5 screens + state +
  persistence + motion). **This is the primary reference.**
- `Immersive Poem Screens.dc.html` — the design-system demonstrator: a foundations card
  (color/type/seal/motion) plus static screen studies (`2sys, 2a–2e` and earlier
  immersion studies `1a–1c`). Use it to read the *system* rationale.
- `Art Plan - one painting per feeling.md` — the imagery art direction (7 feelings × 4
  seasons, composition contract, production sequence).
- `image-slot.js`, `support.js` — prototype runtime helpers; **do not port** (prototype
  scaffolding only).
