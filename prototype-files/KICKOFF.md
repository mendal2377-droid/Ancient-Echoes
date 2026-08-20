# 彼时此地 · Ancient Echoes — Prototype Kickoff

A location-based app that connects a user to the poets who stood where they
now stand. The home screen is a **radar**: a "wormhole" between you and the
ancients at this spot. You set a distance and a type, tap **scan**, and the
sweep surfaces nearby poems — each pinned to a real place and labelled with how
honestly it connects to that ground.

This doc is the build brief. A static single-file prototype already exists
(`radar.html`) with seed data (`nanjing_seed.json`); this describes how to turn
it into a real app.

---

## 1. Core concept (do not lose this)

The emotional payload is **"someone stood here, once, and wrote this."** Every
design decision serves that moment. The radar is the *mechanism*; the feeling
is *彼时此地* — that-time, this-place, held together.

The single differentiator vs. every competing poem app: **honesty about the
connection between a poem and a place.** Most apps would plant a glowing pin
saying a famous poet "wrote here." We distinguish:

- `written_here` — composed at this spot
- `describes` — about this place, written elsewhere (e.g. Liu Yuxi wrote the
  most famous Nanjing poems *without ever visiting*)
- `poet_present` — poet lived/passed/served here, poem not about it
- `event_here` — references a historical event at this location

And we never collapse confidence into one star rating. Three independent flags:
`attribution` (did this poet write it), `location` (is this the real spot),
`relation` (is the written/describes call right). Each: high / medium / low /
disputed. **This honesty is the moat. Protect it.**

---

## 2. Scope

- **Phase 1 (this prototype):** Nanjing only, Tang dynasty only. City selector
  (no GPS yet — center defaults to a fixed point). Radar scan, pins by relation,
  poem detail page. Bilingual, Chinese default.
- **Phase 2:** real GPS, poet life-flow pages, modern place-photo vs. ancient-
  painting comparison, more cities/dynasties.
- **Explicitly NOT phase 1:** poet pages, AI-generated painting art, video,
  audio recitation. The toggles may appear in UI but need no backend.

---

## 3. Stack recommendation

- **Frontend:** React + TypeScript + Vite. Mobile-first, single-column,
  max-width ~520px. The existing prototype is plain HTML/JS — port its logic,
  keep its aesthetic.
- **Data (phase 1):** ship `nanjing_seed.json` as a static asset and fetch it.
  No backend needed to prove the concept. Move to Postgres + PostGIS only when
  the dataset outgrows a single file or needs real geo-queries.
- **Map (phase 2):** the prototype fakes geography by projecting bearing+distance
  onto a radar grid. That's the right *feel* and may stay as the home screen.
  A real street map (MapLibre + self-hosted tiles, or AMap/高德 for China
  compliance) belongs on the place-detail view, not necessarily the radar.

Keep Chinese (`zh`) as the canonical field everywhere; `en` is a switchable
sibling. Never hardcode user-facing strings — they all live in the data as
`{zh, en}` objects.

---

## 4. Data model (already defined in nanjing_seed.json)

Three first-class entities: **poem**, **poet**, **place**. Places own the
coordinates — the radar depends on them being real objects, not a text field on
a poem. Key fields:

- `place`: `coordinates {lat,lng}`, `coord_precision` (exact/approximate/
  district/lost), `still_exists`, bilingual `name` + `modern_status`.
- `poem.place_links[]`: each has `place_id`, `relation`, `is_primary`,
  `reliability {attribution, location, relation}`, optional bilingual `note`.
- Denormalize `linked_poem_count` onto places before the dataset grows — the
  radar must render pins without counting poems live.

**Coordinate caveat:** the seed lat/lng came from general knowledge, not survey
data. Lost sites (Phoenix Terrace, the wineshop, Egret Isle) are approximate by
design and flagged. Verify before they drive a live GPS radar.

**Translation licensing:** every English poem body in the seed is an original
CC0 prose paraphrase. Do **not** scrape existing translations — they're
copyrighted. Record a `license` on any translation added later.

---

## 5. Build order

1. **Port the prototype** to React. Reproduce the radar (rings, sweep, staggered
   pin reveal), the language toggle, the type/distance segmented controls, and
   the detail sheet with the three reliability bars. Keep the ink-and-gold dark
   aesthetic (Noto Serif SC + Cormorant Garamond).
2. **Fetch the seed JSON** instead of inlining it. Type the schema in TS.
3. **City selector** as the entry screen (only Nanjing live; others greyed
   "coming soon").
4. **Auto-expand radius:** if a scan finds nothing in range, widen until it does
   and tell the user the nearest hit distance. Matters at cold-start before the
   dataset is dense.
5. **Place-detail view:** modern photo of the spot + `modern_status` text. This
   is the grounding half of the ancient/modern comparison — lead with real
   photos; treat painting-style art as optional phase-2 decoration.
6. **Replace the flat-offset projection** with a correct geodesic formula before
   any real GPS work.

---

## 6. Acceptance criteria for the prototype

- Chinese loads by default; one tap flips the entire UI to English and back.
- Scan runs an animation, then reveals only pins within the chosen radius,
  colored correctly by relation.
- Tapping a pin opens a poem with: bilingual body, every place link (not just
  primary), and three separate reliability bars.
- The Black-robe Lane (乌衣巷) record correctly shows `location: high` but
  `relation: describes` with the note that Liu Yuxi never visited. If this reads
  as "written here," the build has failed its core purpose.

---

## 7. Open questions to decide early

- Does the radar stay an abstract grid, or eventually sit on a real map?
- China deployment: ICP filing, AMap vs. MapLibre, app-store name collision
  check for 彼时此地.
- Who polishes the English translations from literal paraphrase to literary?
