// POST /api/oracle — Vercel serverless adapter.
//
// The API key lives here and only here. It must never reach the client bundle:
// anything shipped to the browser is readable by anyone.
//
// All the thinking is in ./_core.ts, which is host-agnostic — the Vite dev
// middleware calls the same function, so `npm run dev` behaves like production.

// NOTE the .js extension. package.json is `"type": "module"`, so Vercel runs
// this as real ESM, where Node's resolver does NOT guess extensions — a bare
// './_core' throws ERR_MODULE_NOT_FOUND at load time, which surfaces as
// FUNCTION_INVOCATION_FAILED before any of the error handling below can run.
// The file on disk is _core.ts; '.js' is the ESM-correct spelling of it, and
// both tsc and esbuild map it back. Do not "tidy" the extension away.
import { runOracle, type OraclePick } from './_core.js'

interface Req {
  method?: string
  body?: unknown
}
interface Res {
  status(code: number): Res
  json(body: unknown): void
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  // The client falls back to its local matcher on any non-200, so a missing
  // key degrades the app to keyword matching instead of breaking the ritual.
  if (!process.env.DEEPSEEK_API_KEY) {
    res.status(503).json({ error: 'no key configured' })
    return
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
    | { text?: unknown; tags?: unknown }
    | undefined

  const text = typeof body?.text === 'string' ? body.text.slice(0, 2000) : ''
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t): t is string => typeof t === 'string').slice(0, 12)
    : []

  try {
    const picks: OraclePick[] = await runOracle(text, tags)
    res.status(200).json({ picks })
  } catch (err) {
    // Never surface provider errors to the client — it just falls back.
    console.error('[oracle]', err instanceof Error ? err.message : err)
    res.status(502).json({ error: 'oracle unavailable' })
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return undefined }
}
