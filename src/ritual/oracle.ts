// Client side of the oracle.
//
// Asks the server which poems answer this moment; falls back to the local
// keyword matcher on *any* failure — no key, no network, slow response, bad
// payload. The ritual must never break because a model was unavailable, so
// this function does not throw.

import { matchPoems, POEMS } from './data'

export interface Answered {
  picks: string[]                     // poem ids, best first
  reasons: Record<string, string>     // poem id → why it answers you (may be empty)
  source: 'ai' | 'local'
}

// The water is ~3.5s of ceremony; give the model a little longer than that,
// but never leave someone standing at the water forever.
const TIMEOUT_MS = 12000

export async function askOracle(text: string, tags: string[]): Promise<Answered> {
  const local = (): Answered => ({ picks: matchPoems(text, tags), reasons: {}, source: 'local' })

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, tags }),
        signal: ctrl.signal,
      })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return local()

    const data: unknown = await res.json()
    const raw = (data as { picks?: unknown })?.picks
    if (!Array.isArray(raw)) return local()

    const picks: string[] = []
    const reasons: Record<string, string> = {}
    for (const item of raw) {
      const id = (item as { id?: unknown })?.id
      if (typeof id !== 'string' || !POEMS[id] || picks.includes(id)) continue
      picks.push(id)
      const reason = (item as { reason?: unknown })?.reason
      if (typeof reason === 'string' && reason.trim()) reasons[id] = reason.trim()
    }
    if (!picks.length) return local()

    // 事不过三 — top up from the local matcher so 另一种回答 still has depth
    // even if the model returned fewer than three.
    for (const id of matchPoems(text, tags)) {
      if (picks.length >= 3) break
      if (!picks.includes(id)) picks.push(id)
    }
    return { picks, reasons, source: 'ai' }
  } catch {
    return local()
  }
}
