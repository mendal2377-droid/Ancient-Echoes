# Here & Now / 此时此地 — Codex Build Guide V2.0

## Project Code Name

**Project Moonpath**

## Core Sentence

**This is not a poetry app. It is a modern poetic ritual.**

Users offer one real-life moment, let it fall into water, encounter one poem, and plant that moment into their life path.

---

# 1. Product Direction

## Final Product Concept

《此时此地》 is a calm, ritual-first app that helps people transform real life moments into poetic memories.

The core loop is:

```text
Life Moment
↓
Offer
↓
Immerse into Water
↓
Encounter a Poem
↓
Plant
↓
Walk the Life Path
↓
Revisit years later
```

The app is not organized around features. It is organized around a ritual.

---

# 2. What Changed From the Previous Version

## Old Architecture

```text
Home
↓
此时 / 此地 / 此情 / 此景
↓
Poem
↓
Plant
```

This was logical, but too functional.

## New Architecture

```text
Home
↓
今天发生了什么？
↓
Text / Photo / Place / Voice
↓
投入水中
↓
Water / Ripple / Silence
↓
Poem emerges
↓
Plant into Life Path
```

The user should not feel they are choosing a feature. They should feel they are offering a moment.

---

# 3. Core Philosophy

## Product Belief

Great poems do not fade. What changes is the person who finally becomes ready to understand them.

The app should respect great poems. Do not turn them into random recommendation cards, content-feed items, or school-textbook tasks.

## Design North Star

```text
Wonder
↓
Atmosphere
↓
Poem
↓
Interaction
```

The poem should come before the interface.

**If users notice the animation before the poem, the animation is too much.**

---

# 4. MVP Scope

## Build Only These Flows

### Flow 1: First Launch Wonder

A cinematic first-launch introduction, about 30–40 seconds.

Slides:

1. **Place / 此地**  
   Ink map / mountains / rivers. Poems appear across landscapes.  
   Important: show poems first, poets second.

2. **Scene / 此景**  
   Rain, snow, moon, river, bamboo, wind. Poems emerge from scenes.

3. **Emotion / 此情**  
   Emotions become atmospheres, not emoji categories.

4. **Time / 此时**  
   Seasons pass. A flower blooms again.  
   Message: time changes the person, not the poem.

5. **Start / 开始**  
   Prompt: `今天发生了什么？`

First launch intro should be skippable and replayable from Settings / About.

---

### Flow 2: Daily Ritual

Returning user sees a minimal page:

```text
🌙

今天发生了什么？

[ text input ]

+ Photo
+ Place
+ Voice

[ 投入水中 ]
```

No feature grid. No dashboard. No feed.

---

### Flow 3: Water Waiting

After user taps `投入水中`, show a water scene.

Do not show:

- Generating...
- Searching...
- AI is thinking...

Show:

- ripples
- rain / water movement
- floating petals
- moon reflection
- silence

Text:

```text
你的瞬间，正在水中荡漾……
```

Duration: 3–5 seconds.

---

### Flow 4: Encounter a Poem

One poem emerges.

Display:

- poem title
- poem content
- author
- dynasty
- subtle background scene

Actions:

```text
这一句触动了我
换一种回答
暂时不种
```

Important:

- Do not show confidence scores.
- Do not show “AI recommendation”.
- Do not show a list of 20 poems.
- Maximum 3 poem answers per round.

---

### Flow 5: Plant Moment

When the user chooses a poem, ask gently:

```text
如果愿意，可以为这一刻留下一点什么。
```

Optional note.

Then:

```text
留在花径
```

After saving, show a soft success scene:

```text
已留在花径。
这朵花，会在未来等你。
```

No confetti. No reward. No streak.

---

### Flow 6: Life Path

Show saved moments as flowers along a winding path.

Each moment should show:

- date
- poem title
- one line from the poem
- optional user note preview

Tapping opens the moment detail.

Path must feel like walking, not browsing.

---

# 5. Page List

## Required Pages

```text
/
Home / Daily Ritual

/intro
First Launch Wonder

/water
Water Waiting

/poem/:id
Poem Encounter

/plant/:poemId
Plant Moment

/path
Life Path

/moment/:id
Moment Detail

/me
Settings / About
```

## Do Not Build in MVP

- AI chat
- login
- cloud sync
- comments
- likes
- ranking
- public social feed
- gamified garden decoration
- daily missions
- streaks
- points
- marketplace
- complex 3D
- heavy WebGL

---

# 6. Recommended Tech Stack

Use a lightweight web stack.

```text
Vite
React
TypeScript
Tailwind CSS
Framer Motion
localStorage
```

Optional:

```text
Zustand
IndexedDB
```

Do not use:

```text
Unity
Unreal
heavy 3D engines
complex WebGL scenes
```

The MVP must run well on old phones.

Target:

```text
5-year-old Android phone
4GB RAM
smooth interaction
low battery cost
```

---

# 7. Data Model

Use **Moment** as the core data model.

Do not use Flower as the database object.

Flower is only the UI representation.

```ts
export interface Moment {
  id: string;
  poemId: string;
  createdAt: string;
  inputText?: string;
  note?: string;
  photoUri?: string;
  place?: string;
  voiceUri?: string;
  selectedTags?: string[];
  atmosphereTags?: string[];
}
```

```ts
export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty?: string;
  content: string;
  shortMeaning: string;
  themes: string[];
  scenes: string[];
  emotions: string[];
  atmosphereTags: string[];
}
```

```ts
export interface AppState {
  moments: Moment[];
  hasSeenIntro: boolean;
  dailyPoemId?: string;
}
```

---

# 8. Storage

MVP uses localStorage.

Create:

```text
src/lib/storage.ts
```

Functions:

```ts
getMoments(): Moment[]
saveMoment(moment: Moment): void
getMomentById(id: string): Moment | undefined
deleteMoment(id: string): void
getHasSeenIntro(): boolean
setHasSeenIntro(value: boolean): void
```

Do not require login in MVP.

---

# 9. Poem Data

Create:

```text
src/data/poems.ts
```

Start with around 12–20 poems for MVP.

Suggested starter poems:

1. 《静夜思》 李白
2. 《江雪》 柳宗元
3. 《定风波》 苏轼
4. 《春晓》 孟浩然
5. 《枫桥夜泊》 张继
6. 《山居秋暝》 王维
7. 《登鹳雀楼》 王之涣
8. 《水调歌头》 苏轼
9. 《夜雨寄北》 李商隐
10. 《送元二使安西》 王维
11. 《望庐山瀑布》 李白
12. 《饮湖上初晴后雨》 苏轼

Each poem should include:

```ts
{
  id: "jiang-xue",
  title: "江雪",
  author: "柳宗元",
  dynasty: "唐",
  content: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。",
  shortMeaning: "天地空寂，只有一个人独自面对寒江与风雪。",
  themes: ["solitude", "snow", "winter"],
  scenes: ["snow", "river", "boat", "mountain"],
  emotions: ["loneliness", "stillness", "resilience"],
  atmosphereTags: ["snow", "fog", "river", "boat", "silence"]
}
```

---

# 10. Simple Poem Matching Logic

MVP does not need real AI.

Use simple rule matching.

Input sources:

- text input
- selected place
- uploaded photo placeholder
- voice placeholder

For MVP, photo and voice can be UI-only.

Matching algorithm:

1. Combine user input text + selected place + optional tags.
2. Score poems by matching themes, scenes, emotions, and atmosphereTags.
3. Return top 3.
4. If no strong match, return 3 calm default poems.

Create:

```text
src/lib/matchPoems.ts
```

Function:

```ts
matchPoems(input: {
  text?: string;
  place?: string;
  tags?: string[];
}): Poem[]
```

---

# 11. Atmosphere Library

Do not build heavy unique 3D scenes.

Build reusable **Living Painting** modules.

Atmosphere tags:

```text
moon
rain
snow
fog
wind
river
lake
mountain
bamboo
pine
boat
lantern
fireflies
morning
sunset
night
plum
lotus
willow
temple-bell
birds
silence
```

Each poem references tags.

The UI chooses background layers based on tags.

Example:

```text
江雪 = snow + fog + river + boat + silence
春晓 = morning + birds + flowers + wind
定风波 = rain + bamboo + path + wind
静夜思 = moon + window + silence
```

---

# 12. Visual Direction

## Style

Modern East Asian Healing Illustration.

Not heavy 3D.

Not game UI.

Not generic ancient-style decoration.

## Visual Principles

- calm
- restrained
- atmospheric
- readable
- low saturation
- moonlight / ink / soft paper texture
- 2.5D living scroll

## Animation

Use:

- layered parallax
- slow opacity changes
- small water ripple CSS / SVG
- floating petals
- slow rain
- subtle snow
- poem fade-in

Avoid:

- explosive particles
- confetti
- fast transitions
- bouncing UI
- heavy shader effects

---

# 13. Key Screens Detail

## 13.1 First Launch Slide: Place

Goal: show that places remember poems.

Visual:

- ink painting style map / river / mountain
- poems appear as floating lines
- no poet portraits
- poet name only appears subtly after poem

Copy:

```text
此地有诗。
山河之间，曾有人把一瞬写成永恒。
```

---

## 13.2 First Launch Slide: Scene

Goal: show scenes give birth to poems.

Visual examples:

- snow mountain river and lone boat for 江雪
- rain over bamboo for 定风波
- moonlight on floor for 静夜思

Copy:

```text
此景有诗。
一场雪，一阵雨，一轮月，都会唤醒一句诗。
```

---

## 13.3 First Launch Slide: Emotion

Goal: show emotions already existed in poetry.

Visual:

- water surface
- soft floating emotion words
- poems emerge from emotions

Copy:

```text
此情有诗。
孤独、思念、欢喜、告别，都曾被人写下。
```

---

## 13.4 First Launch Slide: Time

Goal: show the user changes over time.

Visual:

- seasons changing around one flower
- same poem, different age

Copy:

```text
此时有诗。
有些诗，要等你走到某一天，才会真正读懂。
```

---

## 13.5 Home / Daily Ritual

Visual:

- calm background
- one input card
- optional input methods

Copy:

```text
今天发生了什么？
```

Placeholder:

```text
写下此刻的一点痕迹……
```

Button:

```text
投入水中
```

---

## 13.6 Water Waiting

Visual:

- dark water
- ripples
- rain / moon reflection

Copy:

```text
你的瞬间，正在水中荡漾……
```

No progress bar.

---

## 13.7 Poem Encounter

Visual:

- living painting background
- poem card
- minimal controls

Copy:

```text
为你浮现的一句诗
```

Actions:

```text
这一句触动了我
换一种回答
```

---

## 13.8 Plant Moment

Copy:

```text
如果愿意，可以为这一刻留下一点什么。
```

Button:

```text
留在花径
```

Skip:

```text
不写也可以
```

---

## 13.9 Life Path

Visual:

- winding vertical path
- flowers as moments
- small date labels

Empty state:

```text
花径还很安静。
第一朵花，会从今天开始。
```

---

## 13.10 Moment Detail

Display:

- poem
- user note
- date
- atmosphere scene
- optional photo

No data-heavy layout.

This page should feel like opening a flower.

---

# 14. Navigation

Bottom navigation:

```text
今日
花径
花园
我的
```

MVP can hide 花园 or make it disabled.

Do not show many tabs.

---

# 15. Copywriting Rules

Use gentle, restrained language.

Do not say:

- generating
- loading
- search result
- AI answer
- task
- streak
- reward
- upgrade

Preferred phrases:

- 今天发生了什么？
- 投入水中
- 为你浮现的一句诗
- 这一句触动了我
- 留在花径
- 花径还很安静
- 慢慢走，花会开的

---

# 16. Acceptance Criteria

MVP is successful when:

1. User opens app.
2. User understands this is a calm poetic ritual.
3. User enters one moment.
4. Water waiting screen appears.
5. One poem emerges.
6. User can view up to 3 poems.
7. User chooses one.
8. User optionally leaves a note.
9. Moment saves to localStorage.
10. Moment appears on Life Path.
11. Refresh app, moment still exists.
12. No login required.
13. No AI required.
14. No social features.
15. App feels quiet, poetic, and lightweight.

---

# 17. Development Order

## Step 1

Create project.

```bash
npm create vite@latest here-now -- --template react-ts
cd here-now
npm install
npm install framer-motion zustand
```

Add Tailwind if desired.

---

## Step 2

Create data and types.

```text
src/types.ts
src/data/poems.ts
src/lib/storage.ts
src/lib/matchPoems.ts
```

---

## Step 3

Create pages.

```text
src/pages/Intro.tsx
src/pages/Home.tsx
src/pages/Water.tsx
src/pages/PoemEncounter.tsx
src/pages/PlantMoment.tsx
src/pages/Path.tsx
src/pages/MomentDetail.tsx
src/pages/Me.tsx
```

---

## Step 4

Create atmosphere components.

```text
src/components/atmosphere/WaterScene.tsx
src/components/atmosphere/LivingPainting.tsx
src/components/atmosphere/RainLayer.tsx
src/components/atmosphere/SnowLayer.tsx
src/components/atmosphere/MoonLayer.tsx
src/components/atmosphere/FogLayer.tsx
```

---

## Step 5

Wire the ritual flow.

```text
Home
↓
Water
↓
PoemEncounter
↓
PlantMoment
↓
Path
```

---

## Step 6

Polish.

Focus on:

- rhythm
- silence
- typography
- spacing
- slow transitions

Do not add features.

---

# 18. Final Instruction for Codex / Claude

Build the ritual, not the app.

Do not create dashboards.

Do not create feeds.

Do not create social features.

Do not create heavy 3D.

Do not create an AI chat interface.

Focus only on one emotional journey:

```text
今天发生了什么？
↓
投入水中
↓
为你浮现的一句诗
↓
这一句触动了我
↓
留在花径
↓
多年后重逢
```

If anything distracts from this journey, remove it.
