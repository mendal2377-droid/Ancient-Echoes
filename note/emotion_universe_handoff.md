# 彼时此地 · Ancient Echoes — Emotion Universe
## Build Handoff (for a future Claude Code session)

A weekend-joy project, designed in full, paused at the vision stage on purpose.
This doc captures everything decided so a future build can start cold. It is the
single source of truth; the prototype HTML files named at the end are visual
references, not production code.

---

## The one sentence

**People don't search for poetry. They search for comfort, belonging, love,
hope — and poetry is the bridge.**

Promise, in two lines:
> 你并不是第一个有此感的人。 You are not the first to feel this way.
> 你并不孤单。 And you are not alone.

---

## What it is

A "time-travel radar with two modes" over one shared poem database:

| | **Location Radar** | **Emotion Radar** |
|---|---|---|
| Asks | Who stood **here**? | Who felt **this**? |
| Input | GPS (sensed automatically) | A feeling (chosen by the user) |
| Connection | Place → Time | Emotion → Time |
| Feeling | "I stand where they stood." | "I am not alone." |
| Visual | map, rings, sites, routes | universe, planets, gardens, stars |
| Audience | travelers, students, museums | everyone seeking comfort |
| Business | tourism, education, B2B, cultural institutions | wellness, journaling, premium subscriptions |

**The two are not rival home screens — they are two queries against one library,
and the killer feature is the *pivot between them*:** read a poem because you feel
homesick, then tap "where?" and land on its place; or stand somewhere, find a poem,
then tap "what does this feel like?" and land on its emotion-planet.

Strategic note: **Emotion = larger audience + viral/consumer hook; Location =
stronger cultural/educational value + B2B revenue.** They reach different buyers.
Likely launch emotion-first (free, personal, viral), with location as the
premium/partnered cultural layer.

---

## The experience spine (all prototyped this session)

Three navigation layers, one population of poets seen through different lenses:

1. **Star-river homepage (time lens).** All of literary history as a flowing
   Milky-Way band (星河/银河 — river and stars are one image in Chinese).
   - Horizontal flow = time (figures placed by real birth-year; era markers
     初唐/盛唐/中唐/晚唐/南唐).
   - Brightness/size = stature (giants like 李白/杜甫 blaze and are always named;
     minor poets are faint; ~140 dust-motes = the countless unnamed "万千诗人").
   - A flowing shimmer travels the band = the current of time; the stars hold
     position = enduring luminaries.
   - Ref: `starriver.html`

2. **Emotion universe (feeling lens).** The same poets regrouped into emotion
   **planets**, arranged by *kinship* not in an arbitrary ring:
   - Map axes: cool/sorrow ↔ warm/connection (x); expansive/outward ↔ inward/quiet (y).
   - Sorrow cluster (离别 · 怀古 · 思乡) left; warmth (相思 · 友情) right;
     stillness (山水 · 独居) in the quiet regions. Faint lines link near neighbors.
   - Planet size = how much real poetry it holds (honest density).
   - **My Planet** burns gold at center — the personal world the user grows by
     collecting resonant poems; the place they return to.
   - Ref: `emotion_universe.html`

3. **The flow: universe → scan → garden** (the core loop).
   - Tap an emotion planet — **the tap IS the emotional input** (no typing, no
     empty void). This answers the "what do I scan for?" problem.
   - **Radar scan = the emotional climax**, not a loading screen. It names kindred
     souls one by one as it sweeps ("谁，曾有『思乡』之感？" → 李白… 杜甫… 王维…
     each lighting up). This is where "you are not alone" actually happens.
   - Land in the **garden** of that emotion to dwell among the poems found.
   - Ref: `flow.html`

---

## The gardens (planet interiors) — 2.5D

Each emotion planet contains a poetic garden. Direction decided: **2.5D layered
parallax (PixiJS), Song-dynasty ink-and-color aesthetic** — NOT true 3D (which was
compared and rejected for now: more cost, fights the ink aesthetic, only needed for
a flythrough world we deliberately set aside). 3D door left open for later.

- **6 parallax depth planes**, re-skinned per emotion: sky / far hills / mid hills /
  **poem-plants (data)** / ambient meadow (decorative density) / foreground fringe.
- **Density trick (validated):** dozens of *ambient* non-data plants make the field
  lush; only *verified* poems glow and are tappable. Abundance for the eye, honesty
  for the data.
- **Each emotion = its own species + weather + palette:** 怀古 dusk willows /
  思乡 moonlit osmanthus / 离别 rain + willow-catkin / 山水 green-morning fern.
  (Plant choices tie to the actual poems where possible — willow is in 台城/乌衣巷.)
- **Plants built from the poem's own 汉字** (hero plants' foliage = the poem's first
  line in brush font) — distinctive, cheap, unmistakably about poetry. Recommended
  for the data plants; drawn art for ambient.
- **Life (validated in CSS, port to PixiJS):** travelling wind gusts that sweep the
  field; plants bend from touch; one drifting firefly; **ambient sound per emotion
  (do not skip — highest immersion-per-effort).**
- Full spec: `garden_2.5d_brief.md`. Structure preview: `garden_2.5d_preview.html`.

---

## The four pillars (from the vision doc)

1. **Emotion Radar** — the signature feature ("who felt this?").
2. **Gardens** — browse/dwell by feeling.
3. **My Planet** — collect resonant poems; grow a personal emotional landscape.
   The *retention* pillar (turns a museum you visit once into a home you tend).
4. **Visiting other worlds** — optional public planets, anonymous. Resonance, not
   social networking. "You may never know who they are, but you may find someone who
   felt exactly what you feel today."

---

## The hard problems (DO NOT FORGET when building)

1. **Emotion % is the moat AND the deepest risk.** The "Homesickness 95%,
   Loneliness 30%, Hope 40%" numbers must feel TRUE or the magic inverts. Whose
   reading? By what method? This cannot be naively automated without going generic.
   Needs the same honest-confidence discipline as the place data:
   primary + secondary emotions, a **confidence flag**, ideally *whose reading*.
   **Curated depth over scraped breadth, especially at launch.**
   This is THE unsolved core. Every elegant thing rests on it.
2. **Public planets = social dynamics + moderation from day one.** Lean into
   anonymity (no profiles/followers/counts). Reflections private by default.
3. **Wellbeing.** A planet filling with heartbreak could deepen a spiral. Design
   bends toward *resonance and company* ("you are not alone"), not toward curating
   one's own melancholy. First-class constraint, not a disclaimer.
4. **Scope.** This is a platform (accounts, storage, social, dual-tagged content).
   Acknowledged as a **weekend-joy project**, not a priority sprint. Build small.

---

## The data layer (the real next step, when building resumes)

Everything visual is prototyped; the DATA is what's missing, by design (it's the
hard part that can't be vibe-coded in an afternoon).

- Extend the existing `nanjing_seed.json` into a **dual-fingerprint schema**: every
  poem carries BOTH a place-fingerprint (place_links, relation, reliability — already
  built) AND an emotion-fingerprint (primary + secondary emotions, each with a % and
  a confidence flag).
- "Same poem, two radars" is the proof: e.g. Du Fu's 月夜忆舍弟 →
  *location mode:* Chang'an / Sichuan / routes; *emotion mode:* 思乡 95% / 孤独 30% /
  希望 40%. One record, two queries.
- Then design HOW the emotion % is decided (human curation / LLM / hybrid). That's a
  method question with no pretty artifact — and it's the bet everything rests on.

---

## Build order when resumed

1. Dual-fingerprint data schema (extend the seed JSON). *Doable, unblocks all.*
2. Method for honest emotion %. *The real moat.*
3. One emotion radar flow end-to-end on real data (universe → scan → garden),
   starting with 怀古 or 思乡 (densest).
4. 2.5D garden in PixiJS (one emotion fully realized, then re-skin).
5. The cross-over pivot (feeling ↔ place on a single poem).
6. My Planet (local/on-device first, no accounts).
7. Later: star-river home, public planets, sound, possible 3D.

---

## Stack
- **Garden:** PixiJS (2D WebGL), Song-ink art direction. 3D door kept open.
- **Data:** static seed JSON first (frontend-only MVP); Postgres + PostGIS later
  when it outgrows a file or needs real geo-queries.
- **Bilingual:** `zh` canonical/default, `en` switchable, all user-facing strings
  as `{zh, en}`.

---

## Session artifacts (visual references)
- `starriver.html` — star-river homepage (time + stature)
- `emotion_universe.html` — kinship-arranged emotion planets + My Planet
- `flow.html` — the core loop: universe → scan-names-souls → garden
- `garden_2.5d_preview.html` — 6-layer parallax structure
- `garden_2.5d_brief.md` — full garden art + build brief
- `homepage_draft.html` — the river vs stars vs star-river comparison
- `ancient_echoes_vision.md` — full vision/spec (the why, pillars, phasing)
- `nanjing_seed.json` — the Tang/Nanjing seed data (place fingerprint only so far)

---

## The closing line (keep it everywhere)
> A time-travel radar with two modes.
> One connects you to who stood where you stand.
> The other connects you to who felt what you feel.
> One explores the history of places. The other, the history of the human heart.
> 你并不孤单。
