// 照片 · attaching what you're looking at.
//
// Honest about its limits: DeepSeek's text models cannot see an image, so a
// photo does NOT silently steer the match. Instead it does two things it can
// do truthfully —
//   1. becomes the background of your share card (the most personal one there is)
//   2. offers a COARSE, user-correctable scene guess from its colours, which
//      you can accept, change, or delete before it reaches the oracle.
//
// A phone photo is several megabytes and localStorage caps near 5MB, so
// everything here is shrunk twice: a large edition for the poster (this
// session only) and a small one durable enough to keep on the moment.

export const PHOTO_POSTER_EDGE = 1440   // for the share card
export const PHOTO_KEEP_EDGE = 640      // small enough to store on a moment
export const PHOTO_KEEP_QUALITY = 0.7

/** Read a File and re-encode it down to `maxEdge` on its long side. */
export function shrinkImage(file: File, maxEdge: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('no 2d context'))
      ctx.drawImage(img, 0, 0, w, h)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

/** The guesses we're willing to make from colour alone. Deliberately few. */
export const SCENE_TAGS = ['夜色', '雪', '雨天', '绿意', '水边', '暖阳', '花'] as const

/**
 * Coarse scene guess from average colour. This is coloured-pixel arithmetic,
 * not vision — it is offered to the user as a correctable suggestion, never
 * applied silently. Returns '' when nothing is confident enough.
 */
export function guessScene(dataUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const N = 32
      const c = document.createElement('canvas')
      c.width = N; c.height = N
      const ctx = c.getContext('2d')
      if (!ctx) return resolve('')
      ctx.drawImage(img, 0, 0, N, N)
      const d = ctx.getImageData(0, 0, N, N).data
      let r = 0, g = 0, b = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
      const n = d.length / 4
      r /= n; g /= n; b /= n
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
      const sat = max === 0 ? 0 : (max - min) / max

      if (lum < 0.22) return resolve('夜色')
      if (lum > 0.8 && sat < 0.12) return resolve('雪')
      if (sat < 0.14) return resolve('雨天')          // flat, grey, low colour
      if (g > r && g > b && sat > 0.2) return resolve('绿意')
      if (b > r && b > g && sat > 0.2) return resolve('水边')
      if (r > b && g > b && lum > 0.45) return resolve('暖阳')
      if (r > g && r > b && sat > 0.25) return resolve('花')
      resolve('')
    }
    img.onerror = () => resolve('')
    img.src = dataUrl
  })
}
