# Handoff C — 印章 seal system, app-wide (ui_principles.md §7)

Makes the red seal the single honesty mark everywhere relation/reliability is
shown. Seal red `--seal` becomes (and stays) the **only red in the app**.

## Files
```
seals/relation.ts   → src/utils/relation.ts      (shared maps; delete per-file RELTXT/RELCOLOR)
seals/Seal.tsx      → src/components/Seal.tsx     (<Seal> <RelationSeal> <ConfidenceSeal>)
seals/seal.css      → append to src/index.css
seals/PoemList.tsx  → src/components/PoemList.tsx (drop-in)
seals/PlaceSheet.tsx→ src/components/PlaceSheet.tsx (drop-in)
```

## Install
1. Add `relation.ts`, `Seal.tsx`, append `seal.css`.
2. Replace `PoemList.tsx` + `PlaceSheet.tsx` with the drop-ins.
3. Patch `PoetSheet.tsx` (one poem-row, ~line 160–180):

   ```diff
   - import …
   + import { RelationSeal } from './Seal'
   …
   - const color = RELCOLOR[hit.link.relation] ?? 'var(--jade)'
     …
   - <span className="list-dot" style={{ background: color }} />
   + <RelationSeal relation={hit.link.relation} confidence={hit.link.reliability.relation} size="xs" lang={lang} />
     …
   - <span className="list-meta">… · {t(RELTXT[hit.link.relation], lang)}</span>
   + <span className="list-meta">{/* drop the relation text — the seal says it */}</span>
   ```
   Then delete the local `RELTXT` / `RELCOLOR` in that file.

4. If you adopted Handoff A: `PoemSheet.tsx` can now `import { Seal, RelationSeal, ConfidenceSeal } from './Seal'` and delete its inline `Seal` + the `ps2-seal*` rules (seal.css supersedes them).

## CSS cleanup (safe to delete once swapped)
- `.relation-tag` (index.css ~936) — the old colored pill.
- `.bar / .track / .fill / .conf-high/medium/low/disputed / .rel-bars` (~1013–1033) — the **forbidden digital progress bars** (§7).
- `.list-dot` rule can stay (unused) or go.

## What stays as-is (by design)
- **Radar pins** (`RadarScreen.tsx`) keep their relation-colored ink-drops —
  they're *spatial markers*, not honesty labels. Seals are for reading contexts
  (sheets, lists). Mixing 34px seals onto the radar would crowd it (§3 one-accent).
- The per-emotion accent colors and gold-for-data rules are untouched.

## Result
Every list row, place sheet, poet sheet and poem sheet now states provenance
with the same vermilion stamp, weighted by confidence — honesty becomes the most
eye-catching ink on the page, exactly as §7 intends. See `印章 Seal System.dc.html`
for the full visual spec (all relations × all weights).
