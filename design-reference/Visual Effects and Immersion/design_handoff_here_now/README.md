# Here & Now / 此时此地 — Visual & Interaction Reference

This folder is the **authoritative visual + interaction reference** for the app described
in `Here_Now_Codex_Guide_V2.md`. The guide defines the product (architecture, data model,
tech stack, acceptance criteria). This folder shows **what it should look like and how it
should feel** — the immersive, ritual-first treatment.

## How to use this with Claude Code

`Here & Now - Ritual.dc.html` is a working HTML prototype. **Claude Code does not run this
file** — it reads it (and the screenshots) and re-creates the design in your real codebase
(Vite + React + TS per the guide). So "the UI didn't change in my app" means the reference
wasn't given as the source of truth. To update all the UIs:

1. Put this whole folder in your Claude Code project (e.g. `design-reference/`).
2. Paste the prompt in `CLAUDE_CODE_PROMPT.md` (also reproduced at the bottom here).
3. Tell it to match the screenshots exactly, screen by screen.

Open the prototype yourself: open `Here & Now - Ritual.dc.html` in a browser. It is
self-contained (uses sibling `support.js` + `image-slot.js`). First launch shows the intro;
replay it from the 我的 tab.

## The Ritual (the whole product is this one arc)

```
First Launch Wonder (5 slides)
   ↓  开始
今天发生了什么？  (Home / Daily Ritual)   — text + mood chips
   ↓  投入水中
你的瞬间，正在水中荡漾…… (Water Waiting, ~3.5s, no progress bar)
   ↓
为你浮现的一句诗  (Poem Encounter)        — 换一种回答 / 这一句触动了我 / 暂时不种
   ↓  这一句触动了我
留下一点什么  (Plant Moment)              — optional note / 不写也可以
   ↓  留在花径
已留在花径。这朵花，会在未来等你。 (Planted, success)
   ↓
人生花径  (Life Path)                     — kept moments as a winding lit path of flowers
```

Build the ritual, not a feature app. No dashboards, feeds, streaks, scores, login, or AI
chat. If it distracts from this arc, remove it.

---

## Screens

Screenshots are in `screenshots/` (the phone bezel is prototype framing only — recreate
just the screen content).

### Flow 1 · First Launch Wonder — 5 cinematic slides
A ~30–40s intro. **Skippable** (跳过, top-right) and **replayable** (from Settings/我的).
Each slide **auto-advances (~6s)**, also **taps forward**, with progress dots at the
bottom. Gated on first launch (`localStorage: hn-seen-intro`). Each slide shows the
**poem first, poet second** (poet fades in later), a small 此地/此景/此情/此时 label at
top, and a theme couplet at the bottom. Atmosphere is **poem-specific** — this is the
point; do not use generic backgrounds:

1. **此地 Place** (`1-intro-place.jpg`) — 王维「大漠孤烟直，长河落日圆」.
   Warm desert dusk: rolling **dunes**, a round **setting sun** low on the horizon, a
   **lone column of beacon smoke rising straight up** (孤烟直), and the **long river**
   at the base catching the last light with the sun's vertical reflection on it.
   Copy: 此地有诗。山河之间，曾有人把一瞬写成永恒。
2. **此景 Scene** (`2-intro-scene.jpg`) — 柳宗元「孤舟蓑笠翁，独钓寒江雪」.
   Cold night: distant snow-capped **千山**, drifting **snow**, a dim cold moon, the
   **cold river surface**, and the signature **lone boat with the straw-caped fisherman
   and his fishing line**. Copy: 此景有诗。一场雪，一阵雨，一轮月，都会唤醒一句诗。
3. **此情 Emotion** (`3-intro-emotion.jpg`) — 李商隐「此情可待成追忆，只是当时已惘然」.
   Faint **锦瑟 (zither) strings** shimmering across the dark, a **drifting butterfly**
   (庄生晓梦迷蝴蝶), and softly drifting emotion words 孤独·思念·欢喜·告别 over a low
   violet water-glow. Copy: 此情有诗。孤独、思念、欢喜、告别，都曾被人写下。
4. **此时 Time** (`4-intro-time.jpg`) — 刘希夷「年年岁岁花相似，岁岁年年人不同」.
   A glowing **flower** at center with **春夏秋冬** slowly circling it, and **blossom
   petals falling** past. Copy: 此时有诗。有些诗，要等你走到某一天，才会真正读懂。
5. **开始 Start** (`5-intro-start.jpg`) — moon + starfield + 今天发生了什么？ + a subtitle
   + a gold **开 始** button → Home (sets `hn-seen-intro`).

### Flow 2 · Home / Daily Ritual (`6-home.jpg`)
Calm night ground, glowing moon centered near the top, starfield. Title **今天发生了什么？**,
a **text input** (placeholder 写下此刻的一点痕迹……), a row of toggleable **mood chips**
(南京 · 想家了 · 窗外的雨 · 一个人 · 看见月亮), a subtle `＋照片 ＋此地 ＋声音` row
(UI-only), and the primary gold pill **投入水中**. Bottom tab bar: **今日 · 花径 · 花园 ·
我的** (今日 active; 花园 disabled; 我的 replays the intro as the Settings stand-in).

### Water Waiting (`7-water.jpg`)
Dark water, a moon with a soft vertical **reflection shimmer**, expanding **ripple rings**,
drifting **petals**, centered text **你的瞬间，正在水中荡漾……**. Lasts ~3.5s then
auto-advances to the poem. **No progress bar, no "generating/AI" text.**

### Poem Encounter (`8-poem.jpg`)
Ground turns to warm **宣纸 paper**. Small header **为你浮现的一句诗**. A mounted scroll
card holds the poem in **vertical 楷 columns** (read right-to-left: title, 〔dynasty〕author,
then lines) with a cinnabar **此时此地 seal** bottom-left. Below: **你并不孤单** + a
one-line gloss. Actions: outlined **换一种回答** (cycles among the matched poems),
gold **这一句触动了我** (→ Plant), and a quiet **暂时不种** (→ Home).

### Plant Moment (`9-plant.jpg`)
Calm night ground, a single tinted **bloom** breathing at top. Prompt **如果愿意，可以为
这一刻留下一点什么。**, an optional **note** textarea, a gold **留在花径** button, and a
quiet **不写也可以** (both save; skip just leaves the note empty).

### Planted / success (`10-planted.jpg`)
A single tinted **bloom** glows. **已留在花径。** / **这朵花，会在未来等你。** Tap anywhere
(— 轻触，走进花径 —) → Life Path. No confetti, no reward, no streak.

### Life Path (`11-path.jpg`)
Night ground, moon top-right, fireflies. Header **人生花径** + English subtitle + "N 朵花，
沿路开放". A **vertical-scrolling winding dashed-gold trail** with one glowing **flower
bloom per kept moment** (bloom tint = the poem's hue), **newest at the top**. Each label
shows **date · poem·author · first line · 「note」**. Empty state:
「花径还很安静。第一朵花，会从今天开始。」

---

## Data & Logic (matches the guide's model)

- **Moment** is the stored object: `{ id, poemId, createdAt, inputText, note }`. Flower is
  only the UI representation. Persisted to **`localStorage: hn-moments`** (JSON array,
  newest-first). `hn-seen-intro` = "1" once the intro is done.
- **Poem dataset**: ~12 poems, each `{ title, author, dynasty, lines[], meaning, hue, kw[] }`.
- **Matching (no AI, MVP rule-based)**: combine the input text + selected chips into one
  string; score each poem by how many of its keywords appear; return the top 3; if none
  match, return 3 calm defaults (静夜思 / 山居秋暝 / 定风波). **换一种回答** cycles the 3.
  The chips map to imagery: 南京→台城(怀古), 想家了→静夜思, 窗外的雨→定风波/夜雨寄北,
  一个人→江雪/枫桥夜泊, 看见月亮→静夜思/水调歌头.

## Design Tokens

- **Night grounds**: `#08080d / #09090f → #120e1c → #171120`. Bezel is prototype-only.
- **Warm paper (poem)**: highlights `#f7f1e5 / #f5efe2`, body → `#e6decb → #dcd3c1`; ink
  text `#231d2b / #2a2438`.
- **Gold (泥金 — the "you"/data color)**: `#ebcd8c`, `#c9a86a`, `#e0c184`, `#f6ecd0`; glows
  `rgba(235,205,140,α)`.
- **Cinnabar (朱印 — the only red)**: `#a83a2a`.
- **Poem hues** (bloom tint / atmosphere): 静夜思·山居 `111,182,184`/`111,184,138`,
  江雪 `154,143,208`, 定风波 `111,184,138`, 台城 `176,156,216`, 水调歌头 `232,184,106`,
  相思 `224,112,154`, 夜雨/送元二 `127,166,216`, 暮江吟 `232,150,120`, 春晓 `224,150,170`.
- **Type**: interface = **Noto Serif SC** (fallback Songti SC). Poem = **Kaiti SC / STKaiti
  / KaiTi** vertical (`writing-mode: vertical-rl; text-orientation: upright`), read R→L.
  English accents = **Cormorant Garamond** italic.
- **Motion**: screen enters with an **ink-bloom** (opacity 0→1, blur 13→0, scale 1.016→1,
  ~0.8–1.2s). Ambient loops are subtle, 5–8s: moon/bloom breathing, star/firefly twinkle,
  drifting mist/petals/snow, water ripples, the slow season ring. Intro slides stage their
  content in with blur (`hnRise`), poem before poet. Reduce/disable on prefers-reduced-motion.

## Files
- `Here & Now - Ritual.dc.html` — the working prototype (all screens + state + persistence
  + matching + motion). Primary reference.
- `screenshots/` — 1..11 renders of every screen.
- `Here_Now_Codex_Guide_V2.md` — the product spec (architecture, data model, acceptance).
- `support.js`, `image-slot.js` — prototype runtime helpers; **do not port**.

---

## Paste-ready prompt (also in CLAUDE_CODE_PROMPT.md)

> Use `design-reference/` as the authoritative visual + interaction reference. Open
> `Here & Now - Ritual.dc.html` and every image in `screenshots/`. Rebuild all screens in
> our codebase to match them exactly — layout, colors, typography, copy, motion — following
> the ritual: First Launch Wonder (5 slides) → Home (今天发生了什么？ + input + mood chips
> + 投入水中) → Water Waiting (~3.5s, no progress bar) → Poem Encounter (换一种回答 / 这一句
> 触动了我 / 暂时不种) → Plant Moment (optional note / 不写也可以) → Planted → Life Path
> (winding path of flowers from kept moments). Keep the immersive treatment: night grounds,
> gold as the data color, warm-paper poem card with vertical 楷 + 此时此地 seal, ink-bloom
> screen transitions, and the poem-specific intro atmospheres (此地 = desert + lone straight
> smoke + long river with sun reflection; 此景 = lone boat & fisherman + 千山 + snow; 此情 =
> faint zither strings + drifting butterfly; 此时 = flower + 春夏秋冬 ring + falling petals).
> Persist moments to localStorage (`hn-moments`) and the intro-seen flag (`hn-seen-intro`).
> Do NOT add onboarding carousels beyond these 5 slides, dashboards, feeds, streaks, or AI
> chat. Poem matching is rule-based (keywords from text + chips → top 3; calm defaults if
> none). Match the screenshots screen by screen.
