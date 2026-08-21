// 存为卡片 · the share studio's renderer.
//
// This is the growth mechanic, so it is held to a higher bar than the rest of
// the app: it has to be worth posting. A bare poem card is a screenshot anyone
// can make — what makes this one yours is your ground, your words, and the
// line that answered them.
//
// 3:4 at 1080×1440 — 小红书's native aspect.
//
// Canvas has no `writing-mode`, so vertical text is drawn glyph by glyph and
// columns are laid out right-to-left by hand.
//
// LAYOUT RULE (learned the hard way on the logo): elements are placed relative
// to the block above them, never at fixed y. A 7-character line is taller than
// a 5-character one, and the seal must sit BELOW the poem, never beside it.

const W = 1080
const H = 1440

const KAI = "'LXGW WenKai Lite','Kaiti SC','STKaiti','KaiTi',serif"
const SONG = "'Noto Serif SC','Songti SC',serif"
const CINNABAR = '#a83a2a'

export type PosterBackground = 'paper' | 'night' | 'ink' | 'photo'

export const BACKGROUNDS: { id: PosterBackground; label: string }[] = [
  { id: 'paper', label: '宣纸' },
  { id: 'night', label: '月夜' },
  { id: 'ink', label: '山水' },
  { id: 'photo', label: '照片' },
]

interface Theme {
  ink: string; soft: string; faint: string
  gold: string; frame: string; alone: string
}
const THEME: Record<PosterBackground, Theme> = {
  paper: { ink: '#231d2b', soft: 'rgba(42,36,56,.58)', faint: 'rgba(42,36,56,.40)', gold: '#b08a4a', frame: 'rgba(201,168,106,.55)', alone: '#a8823f' },
  ink:   { ink: '#20242c', soft: 'rgba(32,36,44,.58)', faint: 'rgba(32,36,44,.40)', gold: '#9a7a44', frame: 'rgba(120,120,120,.35)', alone: '#8d6f3c' },
  night: { ink: '#f3eee4', soft: 'rgba(243,238,228,.62)', faint: 'rgba(243,238,228,.40)', gold: '#ebcd8c', frame: 'rgba(201,168,106,.42)', alone: '#ebcd8c' },
  photo: { ink: '#f6f2ea', soft: 'rgba(246,242,234,.72)', faint: 'rgba(246,242,234,.5)', gold: '#f0d9a4', frame: 'rgba(240,217,164,.4)', alone: '#f0d9a4' },
}

export interface PosterInput {
  title: string
  author: string
  dynasty: string
  lines: string[]
  words?: string          // what you wrote
  reason?: string         // why this poem answered you
  place?: string
  date?: Date
  background: PosterBackground
  photo?: string          // data URL, required when background === 'photo'
  showWords: boolean
  showReason: boolean
  onlyLine?: string       // render a single line instead of the whole poem
}

// ── helpers ──────────────────────────────────────────────────────────────

function vertical(ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
                  size: number, gap: number, color: string, font = KAI): number {
  ctx.save()
  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const step = size + gap
  const chars = [...text]
  chars.forEach((ch, i) => ctx.fillText(ch, x, y + size / 2 + i * step))
  ctx.restore()
  return chars.length * step
}

/**
 * Centred, wrapped text with a hard line cap. User words can be any length, so
 * without a cap a long note walks straight through the wordmark. Overflow is
 * elided rather than allowed to collide.
 */
function centred(ctx: CanvasRenderingContext2D, text: string, y: number, size: number,
                 color: string, font: string, maxWidth: number, maxLines = 2, lineHeight = 1.8): number {
  ctx.save()
  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lines: string[] = []
  let line = ''
  for (const ch of [...text]) {
    if (ctx.measureText(line + ch).width > maxWidth && line) { lines.push(line); line = ch }
    else line += ch
  }
  if (line) lines.push(line)
  let shown = lines
  if (lines.length > maxLines) {
    shown = lines.slice(0, maxLines)
    let last = shown[maxLines - 1]
    while (last.length > 1 && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1)
    shown[maxLines - 1] = last + '…'
  }
  const step = size * lineHeight
  shown.forEach((l, i) => ctx.fillText(l, W / 2, y + i * step))
  ctx.restore()
  return y + shown.length * step
}

function seal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  const r = size * 0.09
  ctx.fillStyle = CINNABAR
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + size, y, x + size, y + size, r)
  ctx.arcTo(x + size, y + size, x, y + size, r)
  ctx.arcTo(x, y + size, x, y, r)
  ctx.arcTo(x, y, x + size, y, r)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f6ece0'
  ctx.font = `${size * 0.36}px ${SONG}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const q = size / 4
  ctx.fillText('此', x + q, y + q); ctx.fillText('时', x + q * 3, y + q)
  ctx.fillText('此', x + q, y + q * 3); ctx.fillText('地', x + q * 3, y + q * 3)
  ctx.restore()
}

/** The moon and its broken reflection — the slogan poem's image, reused. */
function moonAndReflection(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, gold: string) {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4)
  glow.addColorStop(0, 'rgba(228,199,138,.30)')
  glow.addColorStop(1, 'rgba(201,168,106,0)')
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(cx, cy, r * 4, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = gold
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  // 共看明月皆如此 — the moon is one, the water is many
  const bands = [[1.9, 1.55, 0.5], [2.6, 1.05, 0.36], [3.2, 1.3, 0.26], [3.7, 0.7, 0.16]]
  bands.forEach(([dy, w, a]) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.ellipse(cx, cy + r * dy, r * w, r * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed'))
    img.src = src
  })
}

async function paintBackground(ctx: CanvasRenderingContext2D, input: PosterInput) {
  const t = THEME[input.background]

  if (input.background === 'photo' && input.photo) {
    const img = await loadImage(input.photo).catch(() => null)
    if (img) {
      // cover-fit, softened and darkened so the poem can breathe on top —
      // an ink-wash of your own photograph rather than a caption over a snapshot
      const scale = Math.max(W / img.width, H / img.height)
      const w = img.width * scale, h = img.height * scale
      ctx.save()
      ctx.filter = 'saturate(.72) brightness(.62) blur(1.5px)'
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
      ctx.restore()
      const scrim = ctx.createLinearGradient(0, 0, 0, H)
      scrim.addColorStop(0, 'rgba(8,8,14,.52)')
      scrim.addColorStop(0.45, 'rgba(8,8,14,.30)')
      scrim.addColorStop(1, 'rgba(8,8,14,.68)')
      ctx.fillStyle = scrim
      ctx.fillRect(0, 0, W, H)
    } else {
      ctx.fillStyle = '#0d0b14'; ctx.fillRect(0, 0, W, H)
    }
  } else if (input.background === 'night') {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H)
    g.addColorStop(0, '#0b0a12'); g.addColorStop(0.55, '#12101c'); g.addColorStop(1, '#181322')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    moonAndReflection(ctx, W * 0.76, H * 0.13, 54, '#e4c78a')
  } else if (input.background === 'ink') {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#eef0f1'); g.addColorStop(0.5, '#e4e6e6'); g.addColorStop(1, '#d3d5d2')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // a distant ridge, washed — 山水 without illustration
    ctx.save()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = '#3d434a'
    ctx.beginPath()
    ctx.moveTo(0, 1010)
    ctx.bezierCurveTo(180, 900, 300, 968, 430, 906)
    ctx.bezierCurveTo(560, 842, 660, 930, 780, 890)
    ctx.bezierCurveTo(900, 850, 1000, 918, 1080, 880)
    ctx.lineTo(1080, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill()
    ctx.globalAlpha = 0.1
    ctx.beginPath()
    ctx.moveTo(0, 1120)
    ctx.bezierCurveTo(220, 1040, 380, 1112, 560, 1054)
    ctx.bezierCurveTo(740, 996, 900, 1080, 1080, 1030)
    ctx.lineTo(1080, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill()
    ctx.restore()
    moonAndReflection(ctx, W * 0.75, H * 0.14, 46, '#c9a86a')
  } else {
    const paper = ctx.createLinearGradient(0, 0, W * 0.4, H)
    paper.addColorStop(0, '#f7f1e5'); paper.addColorStop(0.5, '#f1e9db'); paper.addColorStop(1, '#e4dcc9')
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H)
    const glow = ctx.createRadialGradient(W * 0.78, H * 0.12, 0, W * 0.78, H * 0.12, W * 0.7)
    glow.addColorStop(0, 'rgba(201,168,106,.13)'); glow.addColorStop(1, 'rgba(201,168,106,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
  }

  ctx.strokeStyle = t.frame
  ctx.lineWidth = 2
  ctx.strokeRect(44, 44, W - 88, H - 88)
}

// ── the poster ───────────────────────────────────────────────────────────

export async function drawPosterTo(canvas: HTMLCanvasElement, input: PosterInput): Promise<void> {
  if (document.fonts) {
    await Promise.all([
      document.fonts.load(`72px ${KAI}`),
      document.fonts.load(`34px ${SONG}`),
      document.fonts.ready,
    ]).catch(() => {})
  }

  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  const t = THEME[input.background]
  ctx.clearRect(0, 0, W, H)
  await paintBackground(ctx, input)

  const lines = input.onlyLine ? [input.onlyLine] : input.lines

  // ── the poem: columns right to left — 题 · 落款 · 诗句 ──
  // The glyph size is DERIVED from a fixed vertical budget, not fixed itself.
  // A 7-character line is taller than a 5-character one, and 只留一句 wants a
  // bigger glyph — left unbounded, either pushes the block below into the
  // wordmark. Budget first, size second.
  //
  // The horizontal budget matters now too. The corpus was twelve 绝句 — four
  // columns, which 76px fits with room to spare. It is now mostly 律诗: eight
  // columns, which at 76px walk straight off the left edge of the canvas into
  // negative x. Both axes get a budget.
  const POEM_TOP = 230
  const POEM_MAX_H = 640
  const VGAP = 16
  const tallest = Math.max(...lines.map(l => [...l].length))
  const poemTop = POEM_TOP
  const colGap = 34
  // what remains after 题 and 落款 have taken their columns, keeping a left margin
  const POEM_MAX_W = (W - 200) - (52 + colGap) - (30 + colGap + 6) - 120
  const VERSE = Math.min(
    76,
    POEM_MAX_H / tallest - VGAP,
    (POEM_MAX_W - colGap * (lines.length - 1)) / lines.length,
  )

  let x = W - 200
  vertical(ctx, input.title, x, poemTop, 52, 14, t.ink)
  x -= 52 + colGap
  vertical(ctx, `〔${input.dynasty}〕${input.author}`, x, poemTop + 12, 30, 8, t.faint)
  x -= 30 + colGap + 6
  for (const line of lines) {
    vertical(ctx, line, x, poemTop, VERSE, VGAP, t.ink)
    x -= VERSE + colGap
  }

  const poemBottom = poemTop + tallest * (VERSE + VGAP)

  // 落款印 — below the poem block, never beside it
  const sealSize = 96
  const sealX = Math.min(Math.max(104, x + 10), W - 104 - sealSize)
  seal(ctx, sealX, poemBottom + 24, sealSize)

  // ── the lower block, laid out inside a hard budget ──
  // Nothing may descend past LOWER_BOTTOM; below that belongs to the wordmark.
  const LOWER_BOTTOM = H - 200
  let y = Math.max(poemBottom + 24 + sealSize + 56, 1000)

  if (y + 40 <= LOWER_BOTTOM) {
    ctx.save()
    ctx.font = `40px ${KAI}`
    ctx.fillStyle = t.alone
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('你 并 不 孤 单', W / 2, y)
    ctx.restore()
    y += 66
  }
  if (input.showWords && input.words && y < LOWER_BOTTOM) {
    y = centred(ctx, `「${input.words}」`, y, 32, t.soft, KAI, W - 300, 2) + 20
  }
  if (input.showReason && input.reason && y < LOWER_BOTTOM) {
    y = centred(ctx, input.reason, y, 25, t.faint, SONG, W - 300, 2) + 14
  }

  // ── wordmark ──
  const d = input.date ?? new Date()
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `30px ${SONG}`
  ctx.fillStyle = t.soft
  ctx.fillText('此 时 此 地', W / 2, H - 132)
  ctx.font = `24px ${SONG}`
  ctx.fillStyle = t.faint
  const stamp = [input.place, `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`].filter(Boolean).join(' · ')
  ctx.fillText(stamp, W / 2, H - 92)
  ctx.restore()
}

export async function drawPoster(input: PosterInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  await drawPosterTo(canvas, input)
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}

/** Share natively where possible; fall back to a download. */
/** What happened to the card. 'manual' means nothing was saved yet and the
 *  caller must show the image so it can be pressed and saved by hand — it
 *  carries an object URL the caller owns and must revoke. */
export type ShareOutcome =
  | { kind: 'shared' }
  | { kind: 'downloaded' }
  | { kind: 'manual'; url: string }

export async function sharePoster(input: PosterInput): Promise<ShareOutcome> {
  const blob = await drawPoster(input)
  const name = `此时此地-${input.title}.png`
  const file = new File([blob], name, { type: 'image/png' })

  // Best case: the OS share sheet, straight into 微信 / 小红书 / 相册.
  const nav = navigator as Navigator & {
    canShare?: (d: { files: File[] }) => boolean
    share?: (d: { files: File[]; title?: string }) => Promise<void>
  }
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try { await nav.share({ files: [file], title: input.title }); return { kind: 'shared' } }
    catch { /* dismissed, or the sheet refused — fall through to a file */ }
  }

  const url = URL.createObjectURL(blob)

  // On a phone with no Share API — WeChat's in-app browser above all, which is
  // where most of this app's sharing will actually happen — `download` is
  // inert. The button would appear to do nothing. Hand the image back instead
  // and let the caller show it: press-and-hold to save is the gesture people
  // already know there.
  const phone = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (phone) return { kind: 'manual', url }

  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)   // a detached anchor's click is ignored in Firefox
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return { kind: 'downloaded' }
}
