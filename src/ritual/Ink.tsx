// 墨入水 · the moment the words leave your hands.
//
// The app's central verb is 投入水中 and the app has never shown it. This is
// that image: something dropped into still water, blooming, threading, and
// going. It runs inside the existing wait, so it costs the ritual no time.
//
// Ink in water is pale here rather than black — the water is a night sky in
// this palette, and light dispersing into dark reads as release where a dark
// stain would read as damage.
//
// The threading is the whole trick, and it is not particles moving: it is
// particles LEAVING TRAILS. Each frame erases only a few percent of what is
// already on the canvas, so the path each blob took stays visible and fades
// behind it. Clear the canvas every frame instead and you get forty drifting
// dots, which is what most "ink" effects are.

import { useEffect, useRef } from 'react'

export type Blob = { x: number; y: number; vx: number; vy: number; r: number; grow: number; life: number; warm: number }

/** Seed a cluster at (ox, oy). Exported so the motion can be driven without a
 *  compositor — requestAnimationFrame does not tick in a hidden page, which
 *  makes an rAF-only effect impossible to check anywhere but by eye. */
export function seedInk(ox: number, oy: number, count: number): Blob[] {
  return Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2
    const speed = 0.25 + Math.random() * 1.15
    return {
      x: ox + (Math.random() - 0.5) * 10,
      y: oy + (Math.random() - 0.5) * 10,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed * 0.72 - 0.16,   // slightly upward: it is rising through water
      r: 2 + Math.random() * 7,
      grow: 0.16 + Math.random() * 0.4,
      life: 0.55 + Math.random() * 0.45,
      warm: Math.random(),
    }
  })
}

/** One frame: fade what is already there, advance every blob, paint it. */
export function stepInk(
  ctx: CanvasRenderingContext2D, blobs: Blob[],
  W: number, H: number, t: number, seconds: number,
) {
  const done = t / seconds

  // Erase a few percent. This is what leaves the threads: clear the canvas
  // outright each frame and you get drifting dots, not diffusing ink.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0,0,0,.038)'
  ctx.fillRect(0, 0, W, H)

  ctx.globalCompositeOperation = 'lighter'
  for (const b of blobs) {
    // Curl: a cheap divergence-free-ish field. Real curl noise is overkill at
    // this size; two offset sines already bend the paths into each other the
    // way diffusing ink does.
    const c = 0.055
    b.vx += Math.sin(b.y * 0.021 + t * 0.7) * c
    b.vy += Math.cos(b.x * 0.019 - t * 0.6) * c
    b.vx *= 0.975
    b.vy *= 0.975
    b.x += b.vx
    b.y += b.vy
    b.r += b.grow

    // in fast, out slowly
    const alpha = Math.max(0, b.life * (1 - done) ** 1.6) * Math.min(1, t * 6) * 0.1
    if (alpha <= 0.001 || b.r <= 0) continue
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
    const warm = b.warm > 0.45
    g.addColorStop(0, warm ? `rgba(235,205,140,${alpha})` : `rgba(226,232,240,${alpha * 0.8})`)
    g.addColorStop(0.55, warm ? `rgba(216,176,114,${alpha * 0.36})` : `rgba(198,210,228,${alpha * 0.3})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function Ink({
  originX = 0.5,
  originY = 0.62,
  seconds = 2.8,
  count = 44,
}: { originX?: number; originY?: number; seconds?: number; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    // Someone who has asked the system for less motion should not be handed
    // the most motion in the app.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const host = cv.parentElement
    const W = host?.clientWidth ?? 384
    const H = host?.clientHeight ?? 640
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    cv.style.width = W + 'px'
    cv.style.height = H + 'px'
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // A tight cluster, not a ring: ink enters at one point and finds its own
    // way out. Angles are uneven so the bloom never looks like a firework.
    const blobs = seedInk(W * originX, H * originY, count)

    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const t = (now - t0) / 1000
      stepInk(ctx, blobs, W, H, t, seconds)
      if (t / seconds < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [originX, originY, seconds, count])

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
}
