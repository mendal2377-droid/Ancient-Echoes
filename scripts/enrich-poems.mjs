// ─────────────────────────────────────────────────────────────────────────
// scripts/enrich-poems.mjs — build-time content pipeline.
//
// Turns raw poem drafts (content/drafts.json) into enriched, app-ready entries
// merged into public/anthology_seed.json.
//
// AI (Claude Opus 4.8) is used here as an OFFLINE AUTHORING TOOL, not a runtime
// backend: it fills the interpretive/translation metadata the matcher eats —
// emotions, EN translation, themes, form, and the poet's lifespan. It does NOT
// fabricate place links, coordinates, or reliability flags: those are the app's
// honesty layer and must come from real sources, so anthology poems are
// place-free (they surface in 此情/此景/此刻/oracle, never on the radar).
//
// Usage:
//   npm run enrich                 # enrich every new draft (needs credentials)
//   npm run enrich -- --dry-run    # validate drafts + list new work, no API calls
//
// Auth: uses the default Anthropic() client — set ANTHROPIC_API_KEY, or run
//   `ant auth login`. It never prompts; on missing creds it prints how to fix.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DRAFTS_PATH = path.join(ROOT, 'content', 'drafts.json')
const OUT_PATH = path.join(ROOT, 'public', 'anthology_seed.json')

// The seven canonical emotion types the app understands (types/index.ts EmotionType)
const EMOTIONS = ['怀古', '思乡', '离别', '相思', '友情', '山水', '独居']

// Structured-output schema — the model must return exactly this shape.
const EnrichedMeta = z.object({
  title_en: z.string(),
  author_en: z.string(),
  poet_born: z.number(),
  poet_died: z.number(),
  form_zh: z.string(),
  form_en: z.string(),
  body_en: z.array(z.string()),
  themes_zh: z.array(z.string()),
  themes_en: z.array(z.string()),
  emotions: z.array(z.object({
    type: z.enum(EMOTIONS),
    primary: z.boolean(),
    percentage: z.number(),
    confidence: z.enum(['high', 'medium', 'low', 'disputed']),
  })).min(1),
})

const dryRun = process.argv.includes('--dry-run')

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback }
}

// ── Load drafts + existing corpus ────────────────────────────────────────
const drafts = readJson(DRAFTS_PATH, null)
if (!Array.isArray(drafts) || drafts.length === 0) {
  console.error(`No drafts found in ${path.relative(ROOT, DRAFTS_PATH)}`)
  process.exit(1)
}

// Validate draft shape up front so a typo fails loudly, not mid-run.
const seenIds = new Set()
for (const d of drafts) {
  const missing = ['id', 'poet_id', 'title_zh', 'author_zh', 'dynasty', 'body_zh'].filter(k => !d[k])
  if (missing.length) { console.error(`Draft ${d.id ?? '(no id)'} missing: ${missing.join(', ')}`); process.exit(1) }
  if (!Array.isArray(d.body_zh) || d.body_zh.length === 0) { console.error(`Draft ${d.id} has empty body_zh`); process.exit(1) }
  if (seenIds.has(d.id)) { console.error(`Duplicate draft id: ${d.id}`); process.exit(1) }
  seenIds.add(d.id)
}

const seed = readJson(OUT_PATH, null) ?? {
  schema_version: '1.0',
  default_lang: 'zh',
  supported_langs: ['zh', 'en'],
  city: { id: 'city_anthology', name: { zh: '', en: '' }, historical_names: { zh: [], en: [] } },
  places: [],
  poets: [],
  poems: [],
}
const havePoem = new Set(seed.poems.map(p => p.id))
const havePoet = new Set(seed.poets.map(p => p.id))

const todo = drafts.filter(d => !havePoem.has(d.id))
console.log(`${drafts.length} drafts, ${havePoem.size} already enriched, ${todo.length} new.`)

if (todo.length === 0) { console.log('Nothing to do.'); process.exit(0) }
if (dryRun) {
  console.log('\n[dry-run] would enrich:')
  for (const d of todo) console.log(`  ${d.id}  ${d.title_zh} · ${d.author_zh}`)
  console.log('\nRun without --dry-run (with credentials) to generate metadata.')
  process.exit(0)
}

// ── Enrich (real run) ────────────────────────────────────────────────────
let Anthropic, zodOutputFormat
try {
  ;({ default: Anthropic } = await import('@anthropic-ai/sdk'))
  ;({ zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod'))
} catch {
  console.error('Missing dependency. Run:  npm install -D @anthropic-ai/sdk zod')
  process.exit(1)
}

const client = new Anthropic()

function prompt(d) {
  return `You are enriching a classical Chinese poem for a bilingual poetry app. Do not alter the original text.

标题：${d.title_zh}
作者：${d.author_zh}（${d.dynasty}）
正文：
${d.body_zh.join('\n')}

Produce metadata:
- title_en, author_en (romanized name, e.g. "Li Bai")
- poet_born, poet_died: the poet's real lifespan years (use your knowledge; best estimate if uncertain)
- form_zh (诗体, e.g. 五言绝句), form_en (e.g. "wujue (5-char quatrain)")
- body_en: a faithful literary English translation, ONE array element per original line (same number of lines as the original)
- themes_zh, themes_en: 2–4 short theme words each
- emotions: 1–2 entries using ONLY these types [${EMOTIONS.join(' ')}]. Each has primary (boolean), percentage (0–100), confidence (high|medium|low|disputed). EXACTLY ONE entry has primary:true — the dominant feeling.`
}

let added = 0
for (const d of todo) {
  process.stdout.write(`  ${d.id} … `)
  let meta
  try {
    const res = await client.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      output_config: { format: zodOutputFormat(EnrichedMeta, 'poem_meta') },
      messages: [{ role: 'user', content: prompt(d) }],
    })
    meta = res.parsed_output
    if (!meta) throw new Error('no parsed_output (possibly a refusal)')
  } catch (e) {
    console.log(`FAILED (${e?.message ?? e})`)
    continue
  }

  // Assemble the app-shaped Poem (place-free) …
  seed.poems.push({
    id: d.id,
    title: { zh: d.title_zh, en: meta.title_en },
    author_id: d.poet_id,
    dynasty: d.dynasty,
    form: { zh: meta.form_zh, en: meta.form_en },
    date_composed: { year: Math.round((meta.poet_born + meta.poet_died) / 2), precision: 'unknown' },
    body: { zh: d.body_zh, en: meta.body_en },
    place_links: [],
    themes: { zh: meta.themes_zh, en: meta.themes_en },
    emotions: meta.emotions,
  })
  havePoem.add(d.id)

  // … and the Poet, once per author.
  if (!havePoet.has(d.poet_id)) {
    seed.poets.push({
      id: d.poet_id,
      name: { zh: d.author_zh, en: meta.author_en },
      lifespan: { born: meta.poet_born, died: meta.poet_died },
      epithet: { zh: null, en: null },
    })
    havePoet.add(d.poet_id)
  }

  added++
  console.log(`ok (${meta.emotions.find(e => e.primary)?.type ?? '?'})`)
}

if (added > 0) {
  fs.writeFileSync(OUT_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf8')
  console.log(`\nWrote ${added} new poem(s) → ${path.relative(ROOT, OUT_PATH)} (${seed.poems.length} total). Review before committing.`)
} else {
  console.log('\nNo poems added.')
}
