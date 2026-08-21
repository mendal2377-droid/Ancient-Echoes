import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// ── Bundled typefaces (self-hosted, China-first — no runtime CDN) ──
// 楷 poem voice: LXGW WenKai Lite — soft calligraphic Kai, the design reference's
// hand. Unicode-range split (97 subsets); the browser fetches only glyphs used.
import 'lxgw-wenkai-lite-webfont/lxgwwenkailite-light.css'
import 'lxgw-wenkai-lite-webfont/lxgwwenkailite-regular.css'
// 宋 UI voice: Noto Serif SC — latin weights + simplified-Chinese subsets.
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/chinese-simplified-300.css'
import '@fontsource/noto-serif-sc/chinese-simplified-400.css'
import '@fontsource/noto-serif-sc/chinese-simplified-500.css'
// English literary voice: Cormorant Garamond (regular + italic for eyebrows).
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import './ritual.css'   /* 此时此地 · the ritual — base + the reference's keyframe vocabulary */
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
