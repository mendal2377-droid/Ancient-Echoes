# 彼时此地 · Ancient Echoes — UI 总则
## The Style Bible (上美影 水墨方向)

One direction for the whole app. Every screen, asset, animation, and sound is
tested against this document. When a design decision is unclear, the order of
appeal is: §1 北极星 → §2 五原则 → the relevant section.

---

## 1. 北极星 North Star

**Ink painting, in motion, the way 上海美术电影制片厂 made it move.**

Reference frame: 《山水情》(1988). Secondary: 《牧笛》《小蝌蚪找妈妈》.
Ink wash (水墨) is the *language*; 上美影 animation is the *voice* — soft blooming
edges, hand-made warmth, restraint, silence that means something.

Why this and not alternatives (decided, with reasons):
- Generic illustration → rejected: the default skin of every wellness app; says nothing.
- Van Gogh → rejected: agitation, not comfort; and AI-strip-mined into kitsch.
- Museum-style 水墨 → absorbed: right substance, but 上美影 is how it *lives*.
- The style is on-thesis: for our users it carries childhood memory — beauty
  returned from the past is literally what the app does.

**The test for any new asset:** could this frame appear in 《山水情》without
breaking the spell? If no, redo it.

---

## 2. 五原则 The Five Principles

1. **温柔不炫技 — Tender over impressive.** Users arrive tired, at night,
   carrying a feeling. Comfort first. Spectacle decays with repetition; calm
   compounds. If a choice is between "wow" and "soft," choose soft.
2. **零负担 — No burden.** The default path from feeling to poem is at most two
   taps. Every default view is complete and beautiful with *zero* interaction.
   Depth (strolling, panorama, planting) exists strictly as opt-in behind one
   clearly named control. Never more than one decision per screen.
3. **留白 — Emptiness is content.** Generous void in every composition. Nothing
   fills space because it can. Silence in sound, stillness in motion, blankness
   in layout are all deliberate materials, not gaps to fix.
4. **万物呼吸 — Everything breathes, nothing demands.** All motion is ambient
   and slow (2–6s cycles); the scene is fully alive with no input. Motion never
   asks the user to act, never blocks, never gamifies.
5. **诚实有形 — Honesty has a visual form.** Reliability and emotional-confidence
   labels are first-class visual citizens (see §7), never buried in fine print.
   The app's scholarly honesty is part of its beauty.

---

## 3. 色 Palette

The world is night ink on warm dark paper. Color is scarce and therefore sacred.

**Base (all screens):**
- 夜纸 Night-paper ground: `#0a0a12` → `#171120` gradients
- 墨 Ink (silhouettes, hills, strokes): `#2a2438` `#3b3050` `#473a5e`
- 宣白 Paper-white text: `#f3eee4` (never pure #fff)
- 泥金 Gold — the sacred accent: `#d8b072` / glow `#ebcd8c`
  Reserved EXCLUSIVELY for: poem-plants (data), the user's own planet, primary
  action, the radar sweep. If everything is gold, nothing is.

**Per-emotion accent (one hue each, used as atmosphere tint + plant glow):**
- 怀古 `#b09cd8` 紫 | 思乡 `#6fb6b8` 青 | 离别 `#7fa6d8` 蓝
- 相思 `#e0709a` 绯 | 友情 `#e8b86a` 暖金 | 山水 `#6fb88a` 翠 | 独居 `#9a8fd0` 黛

**Forbidden:** saturated primaries, pure black/white, neon, more than one accent
hue per screen, gradients that look digital (every gradient must read as wash/雾).

---

## 4. 字 Typography

Type is the most important visual in the app (the poem page IS the product).

- **诗文 Poem text:** 楷体 (Kaiti SC / STKaiti / KaiTi), `writing-mode:
  vertical-rl`, columns read right→left, `text-orientation: upright`,
  26px+, letter-spacing ≈ .3em, line-height ≥1.45. Title and 〔朝代〕作者 occupy
  the rightmost columns. Lines fade in sequentially (~500ms apart) — the pace of
  breath, tunable, never instant.
- **界面 UI text:** 宋体 lineage (Songti SC / Noto Serif SC). Never sans-serif
  for visible UI. Small, quiet, letter-spaced (.1–.2em).
- **English (switchable, zh default):** Cormorant Garamond italic for literary
  text, same serif rules. All user-facing strings live in data as `{zh,en}`.
- **Production:** bundle one licensed brush font; system 楷体 is the fallback,
  not the plan. No font loaded from foreign CDNs (see §9).

---

## 5. 笔 Brush & Asset Rules

Every visible asset must look touched by a hand.

- Soft blooming edges (晕染) — ink meeting wet paper. No hard vector outlines.
- Dry-brush texture (飞白) for stems, hills, strokes.
- Asymmetry always: 3 variants minimum per repeated asset (plants, hills);
  identical clones betray the machine.
- Silhouette first: every species/element must be recognizable at 40px in 2s.
- Light = meaning: glow belongs only to data (poems), the moon, and the user's
  own things. Ambient scenery never glows.
- **Forbidden:** photorealism, 3D-render look, glossy highlights, drop shadows
  (except soft glow), outlines, emoji, stock-illustration faces, AI-generated
  "Chinese style" kitsch (over-ornamented dragons/clouds/red-gold).

---

## 6. 动 Motion Rules

The 上美影 signature is HOW things move.

- **Breath, not bounce:** sway/pulse cycles 2–6s, eased sine. No spring physics,
  no overshoot, no snapping. Minimum transition 400ms.
- **Wind travels:** one gust crosses the whole scene as a wave; plants bend by
  proximity to it. Never uniform per-element timers.
- **Ink-bloom transitions:** screens change the way ink disperses in water —
  a soft radial bloom/dissolve, not slides or zooms. This is the app's single
  transition style, everywhere.
- **One creature per scene, maximum:** a firefly, a distant crane, a fish. Rare
  biological motion reads as life; a zoo reads as noise.
- **The moon follows:** fixed in view across pans (明月随人). The constant
  emotional anchor.
- Motion never requires input, never loops faster than calm, never plays sound
  effects (see §8 — ambience only).

---

## 7. 印 The Honesty Layer (seals)

Reliability and emotion-confidence labels are rendered as **red seal stamps
(印章)** — the classical mark of attribution and authenticity.

- 作于此地 / 描写此地 / 诗人曾驻 → small square seals on the poem page.
- Confidence high/medium/low/disputed → seal weight: full vermilion / half-tone /
  outline-only / outline with 「疑」.
- Emotion percentages → seal + thin ink-wash bar, never a digital progress bar.
- Seals are the ONLY red in the entire app (`#a83a2a` cinnabar), which makes
  honesty literally the most eye-catching ink on the page — by design.

---

## 8. 声 Sound

- One ambient loop per emotion (10–20s seamless, low volume, mutable, remembered
  preference): 怀古 wind+leaves · 离别 thin rain · 思乡 night insects+water ·
  山水 birds+stream · 相思 distant guqin · 独居 near-silence with embers.
- Guqin notes: sparse, never melodic background music. Silence is the default
  between sounds.
- Zero UI sound effects. No taps, dings, or whooshes — ever.

---

## 9. 工 Production Constraints (non-negotiable)

- **China-first delivery:** no cdnjs, no Google Fonts, no foreign CDN at runtime.
  All libraries and fonts bundled/self-hosted. (A prototype already failed in
  Nanjing for exactly this reason.)
- Baked beauty: blur and texture baked into layer art, not runtime filters
  (≤1 live blur per scene). Sprite atlas for all plants; 60fps on mid-range
  Android; ≤300–400 sprites per scene.
- zh canonical everywhere; en switchable; strings as `{zh,en}` objects.
- Stable layouts: deterministic placement per poem id — a garden looks the same
  on every visit. Familiarity is part of comfort.

---

## 10. 屏 Per-Screen Application

| Screen | Treatment |
|---|---|
| **星河 Home** | Ink night sky; the star-river as a wash band; poets as gold-tinted stars sized by stature; era marks in small 宋体. Slow shimmer = time flowing. |
| **情感宇宙 Universe** | Planets as soft ink-wash orbs in mist, kinship-placed; faint ink-line links; 我的星球 the only gold orb, center. |
| **雷达 Scan** | The sweep is a brush stroke turning; found souls bloom in as ink drops with 楷体 names. The scan IS the climax — it names who felt this. |
| **花园 Garden (default = 远观 overview)** | The whole blooming garden visible at once, poem-plants glowing gold over an ink meadow, per-emotion sky. One tap on a plant → poem. 入园漫步 = the single opt-in button for ground-level stroll (handscroll). Panorama reserved for *place* mode. |
| **诗页 Poem page** | THE product. Vertical 楷体, lines breathing in, seals (§7), closing line 「你并不孤单」 last. Optional quiet recitation. Nothing else on screen. |
| **我的星球 My Planet** | Same garden engine; the only place with a planting action (tap empty soil ✛ → pick a collected poem → sprout animation). Growth is the one celebratory motion allowed — and it's still slow. |
| **此地 Location mode** | Same ink world on a map/panorama; the radar rings as brush circles; sites as seals on the land. Standing camera (panorama), since its feeling is presence. |
| **诗人页 Poet page** | Life as a horizontal ink handscroll (the river metaphor lives here, where chronology IS the point). |

---

## 11. 戒 Anti-patterns (instant rejection list)

Badges, streaks, confetti, progress gamification, notification red dots, modal
upsells, infinite feeds, pull-to-refresh spinners, skeleton shimmer, glossy
buttons, haptic celebrations, "Rate us" interrupts. Each one breaks 温柔 and
零负担. The app never performs urgency.

---

## 12. 第一笔 First Asset — the Test Willow

Before committing the style across the app, prove it on ONE asset:

**Brief:** 怀古 weeping willow, 《山水情》 manner. Ink silhouette with soft
bloomed edges, sparse drooping fronds, 飞白 texture on the trunk, faint
`#b09cd8` atmosphere tint. Three growth variants (short/medium/tall) + one
hero version with gold glow. Transparent background, 2× display size,
bottom-center pivot.

**Acceptance test:** place all three variants in the existing PixiJS vista at
40–120px. Pass if (a) recognizably willow at a glance, (b) the three read as
siblings not clones, (c) it could sit in a 山水情 frame, (d) no AI-kitsch tells.
If generation can't hold the style across three variants, commission a human
brush — the style is the moat; don't compromise it at asset one.

---

## 13. 终 The Sentence

If the whole document compresses to one line:

**像《山水情》一样：墨色温柔，万物呼吸，一触即诗，你并不孤单。**
*Like Feeling from Mountain and Water: tender ink, everything breathing,
one touch to a poem — you are not alone.*
