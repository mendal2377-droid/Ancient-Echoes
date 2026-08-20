# Paste this into Claude Code

Use `design-reference/` as the authoritative visual + interaction reference. Open
`Here & Now - Ritual.dc.html` and every image in `screenshots/`. Rebuild ALL screens in
our codebase to match them exactly — layout, colors, typography, copy, and motion.

Follow the ritual (this is the whole product):
1. First Launch Wonder — 5 cinematic slides (此地 / 此景 / 此情 / 此时 / 开始), skippable
   (跳过) and replayable, auto-advancing (~6s) + tap-forward, progress dots, poem shown
   before poet. Gated on first launch via localStorage `hn-seen-intro`.
2. Home / Daily Ritual — 今天发生了什么？ + text input + mood chips
   (南京 · 想家了 · 窗外的雨 · 一个人 · 看见月亮) + 投入水中. Tab bar 今日·花径·花园·我的.
3. Water Waiting — 你的瞬间，正在水中荡漾…… ~3.5s, ripples + moon reflection + petals.
   NO progress bar, no "generating/AI" text.
4. Poem Encounter — warm-paper card, vertical 楷 poem, 此时此地 cinnabar seal, gloss.
   Actions: 换一种回答 / 这一句触动了我 / 暂时不种.
5. Plant Moment — optional note / 不写也可以 → 留在花径.
6. Planted — 已留在花径。这朵花，会在未来等你。
7. Life Path — winding lit path of flowers built from kept moments, newest at top.

Keep the immersive treatment:
- Night grounds; GOLD (#ebcd8c/#c9a86a) is the "you"/data color; cinnabar #a83a2a is the
  only red; warm 宣纸 paper only on the poem card.
- Poem text is vertical 楷 (writing-mode: vertical-rl; upright), read right-to-left.
- Ink-bloom screen transitions (opacity 0→1, blur 13→0, scale 1.016→1). Ambient motion
  subtle (5–8s breathing/twinkle/drift). Respect prefers-reduced-motion.
- Poem-specific intro atmospheres (do NOT use generic backgrounds):
  · 此地 = desert dunes + a lone straight column of smoke (孤烟直) + long river with the
    setting sun's reflection.
  · 此景 = lone boat + straw-caped fisherman + fishing line + distant 千山 + falling snow.
  · 此情 = faint 锦瑟 zither strings + a drifting butterfly + drifting emotion words.
  · 此时 = a glowing flower + 春夏秋冬 slowly circling + falling blossom petals.

Data & logic:
- Store a Moment { id, poemId, createdAt, inputText, note } to localStorage `hn-moments`
  (newest-first). Flower is only the UI representation.
- Poem matching is rule-based (no AI): combine input text + selected chips, score poems by
  keyword overlap, return top 3 (换一种回答 cycles them); if none match, return 3 calm
  defaults (静夜思 / 山居秋暝 / 定风波).

Do NOT add: onboarding carousels beyond these 5 slides, dashboards, feeds, streaks, points,
login, cloud sync, or an AI chat interface. If it distracts from the ritual, remove it.

Work screen by screen and check each against its screenshot before moving on.
