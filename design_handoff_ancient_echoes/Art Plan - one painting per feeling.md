# 此时此地 · Ancient Echoes — Art Plan
## One painting per feeling × season

Ink-wash (水墨), 《山水情》 manner — soft bloomed edges (晕染), dry-brush texture
(飞白), asymmetry, no hard outlines, no AI-kitsch. Every frame must pass the test:
*could it appear in 《山水情》 without breaking the spell?*

---

## The grid: 7 feelings × 4 seasons = 28 hero grounds

Each feeling owns **one hue** (its atmosphere tint + plant glow). Each season
re-lights the same feeling — same mood, different weather and palette temperature.
Launch with **1 painting per feeling** (the season that fits it best, below), then
fill the grid.

| 情 Feeling | Hue | Species / motif | Weather | Launch season |
|---|---|---|---|---|
| 相思 Longing / love | 绯 `#e0709a` | red-bean blossom, twin birds, moon on water | warm dusk | 春 spring |
| 怀古 Nostalgia / the past | 紫 `#b09cd8` | willow over a ruined terrace, distant city wall | misty dusk | 秋 autumn |
| 思乡 Homesickness | 青 `#6fb6b8` | moonlit osmanthus, a single lit window, river | clear night | 秋 autumn |
| 离别 Parting | 蓝 `#7fa6d8` | willow + catkin, a boat leaving, rain on water | fine rain | 春 spring |
| 友情 Friendship | 暖金 `#e8b86a` | peach-blossom pool, two figures, a raised cup | bright day | 春 spring |
| 山水 Landscape / stillness | 翠 `#6fb88a` | pine, clear spring over stones, green peaks | after-rain morning | 夏 summer |
| 独居 Solitude | 黛 `#9a8fd0` | lone boat, snowbound river, empty mountain | snow | 冬 winter |

**Seasonal re-light rule** (same feeling, 4 versions):
- 春 warmer whites, blossom accents, thin haze.
- 夏 deepest greens, wet stone, full foliage.
- 秋 amber + the feeling's hue, longer mist, sparse leaves.
- 冬 coolest paper, snow, most 留白, near-monochrome.

---

## What each hero ground must contain (composition contract)

Built so the **poem sits in the negative space**, never on top of detail:

1. **Reading void** — the upper-right / center-right ~40% kept quiet (mist or open
   sky) for the vertical 楷 poem. Detail lives lower-left.
2. **Depth in 3 bands** — near foreground fringe (dark ink), mid subject (the
   species/motif), far wash (hills / sky). This is what makes it feel *inside* a
   painting, not behind a photo.
3. **A horizon anchor** — water or a low ridge around 55–65% height; the moon (when
   present) top-right, so it can "follow" across screens.
4. **One living detail max** — a bird, a boat, a lit window. Never a crowd.
5. **Light = meaning** — nothing glows except the moon and (later) the data-plants.
   Ambient scenery stays matte.

Deliver each at **2× phone (≈ 750×1500 px)**, transparent or full-bleed, with the
reading void on the correct side. Keep a **layered/PSD** version if possible — the
app wants the mid + far bands separable later for 2.5D parallax.

---

## Production sequence (cheapest path to a believable launch)

1. **Prove the style on ONE** — do 相思·春 (the home/daily feeling) start to finish.
   Accept only if it passes the 《山水情》 test and the poem sits cleanly in the void.
2. **Do the other 6 feelings, best-season each** (7 total). That fills the whole loop.
3. **Add seasons** for the 2–3 densest feelings (相思 / 怀古 / 思乡) → +9.
4. **Complete the grid** to 28 as content grows.

**Consistency guardrails** (so 28 images read as one hand):
- One brush vocabulary, one paper texture, one edge-bloom softness across all.
- Same value range (never let one image be much brighter/darker than its siblings).
- Same "camera" height and horizon band.
- Do them in **batches by season**, not by feeling — palette temperature is the
  hardest thing to keep consistent, so paint all the 春 together, then 秋, etc.

---

## Drop-in

Every screen in the prototype has a full-bleed `image-slot` keyed by feeling
(`ae-home2`, `ae-path`, …). Drop the matching painting on; the mist, moon, motes,
and breathing poem already sit on top. If generation can't hold the style across a
feeling's four seasons, commission a human brush for that feeling — **the style is
the moat.**
