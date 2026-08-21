// Drop the .woff fallbacks from the built CSS and delete the files.
//
// Fontsource ships every face twice:
//   src: url(x.woff2) format("woff2"), url(y.woff) format("woff");
// The .woff half is a fallback for browsers older than 2016. Every browser this
// app can run in at all — it needs unicode-range subsetting, CSS 3D transforms
// and canvas — has supported woff2 for a decade, so those files are never
// requested. They are 15MB of the 35MB deployment: pure upload cost.
//
// Runs after `vite build`. It rewrites, verifies, then deletes — and throws if
// the rewrite did not fully take, so a silent half-trim can never ship.

import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const ASSETS = 'dist/assets'
const files = readdirSync(ASSETS)

// ── 1. strip the fallback from every stylesheet ──
const WOFF_FALLBACK = /,url\([^)]+\.woff\)\s*format\("woff"\)/g
let stripped = 0
for (const f of files.filter(f => f.endsWith('.css'))) {
  const path = join(ASSETS, f)
  const css = readFileSync(path, 'utf8')
  const out = css.replace(WOFF_FALLBACK, () => { stripped++; return '' })
  if (out !== css) writeFileSync(path, out)
}

// ── 2. verify: no .woff may survive in ANY text output ──
// (.woff2 is untouched — \b after "woff" fails against the "2".)
const text = files.filter(f => /\.(css|js|html)$/.test(f))
for (const f of text) {
  const body = readFileSync(join(ASSETS, f), 'utf8')
  const left = body.match(/\.woff\b/g)
  if (left) throw new Error(`trim-fonts: ${left.length} .woff refs still in ${f} — the pattern missed something; not deleting anything`)
}

// ── 3. now the files are unreachable, so delete them ──
let bytes = 0, deleted = 0
for (const f of files.filter(f => f.endsWith('.woff'))) {
  const path = join(ASSETS, f)
  bytes += statSync(path).size
  unlinkSync(path)
  deleted++
}

const mb = (bytes / 1048576).toFixed(1)
console.log(`trim-fonts: ${stripped} fallbacks stripped, ${deleted} .woff deleted, ${mb}MB saved`)
