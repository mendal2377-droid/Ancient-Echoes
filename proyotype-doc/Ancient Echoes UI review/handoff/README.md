# Handoff A — Poem page (诗页) ink redesign

Drop-in for the live app. Behaviour is identical to the original `PoemSheet`
(planting + dew, related poems, place links, poet/place nav); only the poem and
reliability **visuals** changed.

## Install
1. Copy `PoemSheet.tsx` → `src/components/PoemSheet.tsx` (replaces the original).
2. Append `poem-sheet-ink.css` to the end of `src/index.css`
   (or `@import './handoff/poem-sheet-ink.css';` at the top).
3. The old `.bar` / `.rel-bars` / `.conf-*` rules are now unused — safe to delete later.

## What changed (maps to ui_principles.md)
- **§4** poem is vertical 楷体, columns right→left (en falls back to horizontal
  Cormorant italic — upright Latin is unreadable).
- **§6** each line breathes in (`aeRise`, 520ms apart); the sheet body ink-blooms.
- **§7** reliability is now **印章 seals** with weight = confidence
  (full / half / outline / outline+疑). The forbidden digital progress bars are gone.
  The relation (作于此地 / 描写此地 / …) is the large seal beside the poem.
- **§10** closing line 「你并不孤单」 appears last.

## Notes
- Seal red `--seal` stays the only red in the app — don't reuse it elsewhere.
- `DYNASTY_ZH` maps `poem.dynasty` ("Tang") → 〔唐〕. Add dynasties as needed.
- The poem container is `key={poem.id}` so the breath replays when you tap a
  related poem (the sheet instance is reused).
- Next, to fully honour §6, swap the sheet's `translateY(100%)` slide for the
  ink-bloom (see `.sheet` in index.css).
