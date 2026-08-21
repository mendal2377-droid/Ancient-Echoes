// 司签人 · the oracle — server side only.
//
// DeepSeek reads the moment someone dropped into the water and chooses which
// ancient voices answer it. The keyword matcher couldn't: `indexOf` can't tell
// that "加班到很晚，一个人走回家" is about 独, not about 夜.
//
// Why DeepSeek: reachable from the mainland without a VPN, inexpensive, and
// natively strong in Chinese. Its API is OpenAI-shaped, so this is plain fetch
// with no SDK dependency.
//
// ── THE SAFEGUARD, AND AN HONEST NOTE ──
// The model returns poem *ids*, never poem text, so a fabricated poem cannot
// reach the reader. With Anthropic this was enforced by a JSON-Schema `enum`.
// DeepSeek's `response_format: json_object` guarantees only *valid JSON*, not
// schema conformance — so the enum is stated in the prompt, and the real
// enforcement is the server-side filter below. Every id is checked against
// POEMS before it leaves this file, and again on the client. The guarantee is
// preserved; it just lives in code now rather than in the API contract.

import { POEMS } from '../src/ritual/data.js'   // .js is required — see the note in oracle.ts

export interface OraclePick {
  id: string
  reason: string   // one line written to THIS person about THIS moment
}

const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'
const TIMEOUT_MS = 20000

const IDS = Object.keys(POEMS)

// Compact corpus index. Stable across every request, so DeepSeek's automatic
// context caching bills the repeated prefix at a discount.
const INDEX = IDS.map(id => {
  const p = POEMS[id]
  return `${id} | ${p.title}·${p.author} | ${p.lines[0]} | ${p.meaning} | ${p.kw.join(' ')}`
}).join('\n')

const SYSTEM = `你是「此时此地」的司签人。有人把此刻的一点心事投入水中，你要从下面这份诗单里，挑出三首真正回应了它的诗。

规则：
- 只能从诗单里选，只给 id。id 必须是诗单里出现过的，一个字都不能改。
- 不是关键词匹配。要听的是处境和心境：有人说「加班到深夜一个人走回家」，答他的未必是写「夜」的诗，而是写「独」的诗。
- 三首要有层次：第一首最贴，后两首给另一种角度，不要三首都是同一种回答。
- reason 是写给这个人看的一句话，三十字以内：把他说的话，和这首诗接上。
  不要复述诗句，不要解释诗的意思，不要用「这首诗表达了」这类句式，不要安慰他。
- 用中文。安静、克制，像一个不多话的人递过来一张纸。

只输出 JSON，不要任何其它文字，格式：
{"picks":[{"id":"诗单里的id","reason":"一句话"},{"id":"...","reason":"..."},{"id":"...","reason":"..."}]}

诗单（id | 题·作者 | 首句 | 意 | 关键词）：
${INDEX}`

/** Ask DeepSeek which poems answer this moment. Throws on any failure — the
 *  caller falls back to the local keyword matcher. */
export async function runOracle(text: string, tags: string[]): Promise<OraclePick[]> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('no key')

  const said = text.trim()
  const chose = tags.filter(Boolean).join('、')
  const moment =
    [said && said, chose && `（他还选了：${chose}）`].filter(Boolean).join('\n') ||
    '（他什么也没说，只是把这一刻投了进来。）'

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: moment },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 600,
      }),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) throw new Error(`deepseek ${res.status}`)

  const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const raw = body.choices?.[0]?.message?.content?.trim()
  if (!raw) throw new Error('empty response')

  // json_object mode should return bare JSON, but strip a ```json fence if one
  // slips through rather than throwing the whole answer away.
  const payload = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(payload) as { picks?: Array<{ id?: unknown; reason?: unknown }> }

  // THE enforcement point: nothing that isn't a real corpus id gets out.
  const seen = new Set<string>()
  const picks: OraclePick[] = (parsed.picks ?? [])
    .filter((p): p is { id: string; reason: unknown } =>
      typeof p?.id === 'string' && !!POEMS[p.id] && !seen.has(p.id) && !!seen.add(p.id))
    .slice(0, 3)
    .map(p => ({ id: p.id, reason: typeof p.reason === 'string' ? p.reason.trim() : '' }))

  if (!picks.length) throw new Error('no usable picks')
  return picks
}
