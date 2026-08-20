# 此时此地 · Ancient Echoes

A ritual, not a search box. You say what happened today, drop it into the water,
and a thousand-year-old voice answers.

## Run it

```bash
npm install
npm run dev
```

## The oracle (optional — the app works without it)

Matching used to be `indexOf` over hand-written keywords, which cannot tell that
「加班到很晚，一个人走回家」 is about **独**, not about **夜**. With a key, DeepSeek
reads the moment and chooses which poems answer it.

```bash
cp .env.example .env      # then paste your key into DEEPSEEK_API_KEY
npm run dev
```

Without a key `/api/oracle` returns 503 and the client falls back to the local
keyword matcher — silently, with no broken ritual. That fallback also catches
network failures, timeouts (12s), and malformed responses.

### How it's wired

```
src/ritual/oracle.ts   client — calls /api/oracle, falls back to matchPoems on ANY failure
api/oracle.ts          Vercel adapter (thin — swap this file to change host)
api/_core.ts           the prompt, the schema, the call. Server-side only.
```

**Claude returns poem *ids*, never poem text.** The response schema constrains
`id` to a JSON-Schema `enum` built from the corpus itself, so a fabricated poem
cannot come back; `_core.ts` and the client each re-check the id against `POEMS`
as defence in depth. Every line, poet, and 人/境/回声/互文 the reader sees still
renders from the hand-verified local corpus. The model *chooses*; it never *authors*.

> Do not generate this schema from zod: zod 4's converter demotes `z.enum()` to
> `{type: "string", description: "{enum: […]}"}` — a hint, not a constraint,
> which silently removes the guarantee. It is hand-written for that reason.

The one thing Claude does author is the line explaining *why this poem answers
you* — that's about your words, not history, so it can't misattribute anything.

### Cost

Model: `deepseek-chat` via plain `fetch` (the API is OpenAI-shaped, so there is
no SDK dependency). The corpus index is a stable prefix, so DeepSeek's automatic
context caching bills most of the input at its cache-hit rate. Cost per cast is
roughly an order of magnitude below the equivalent Claude call — check
[DeepSeek's current pricing](https://platform.deepseek.com) rather than trusting
a number written here.

**One honest caveat.** With Anthropic the id constraint was a JSON-Schema `enum`
the API enforced. DeepSeek's `json_object` mode guarantees only *valid JSON*, so
the allowed ids are stated in the prompt and the real enforcement is the
server-side filter in `_core.ts` (plus a second check on the client). The
guarantee still holds — it lives in code now rather than in the API contract.

## Deploy (Vercel)

Push the repo, then set `DEEPSEEK_API_KEY` in Project → Settings → Environment
Variables. `api/oracle.ts` is picked up automatically as a serverless function.

**No database.** 花径 lives in `localStorage` (`hn-moments`). That means it is
per-browser and lost if the user clears site data — see the export/import note
in the backlog before asking people to invest months of moments in it.
