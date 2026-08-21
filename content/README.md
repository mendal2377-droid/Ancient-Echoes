# Adding poems (content pipeline)

The oracle/此情/此景/此刻 draw from a place-free **anthology** corpus. To add poems:

1. **Write a draft** — append an object to `content/drafts.json`:

   ```json
   {
     "id": "poem_anth_<slug>",          // unique; prefix poem_anth_
     "poet_id": "poet_anth_<slug>",     // reuse an existing id to reuse the poet
     "title_zh": "静夜思",
     "author_zh": "李白",
     "dynasty": "Tang",                  // English name (Tang / Song / Jin …)
     "body_zh": ["床前明月光，", "疑是地上霜。", "..."]   // one line per element, keep punctuation
   }
   ```

   That's all a human writes — no translation, no tagging.

2. **Enrich** — Claude fills the rest (EN translation, emotions, themes, form, poet lifespan):

   ```
   npm run enrich -- --dry-run    # preview what's new, no API calls
   npm run enrich                 # generate metadata + merge into public/anthology_seed.json
   ```

   Needs credentials: set `ANTHROPIC_API_KEY`, or run `ant auth login`. Already-enriched
   ids are skipped, so it only processes new drafts. **Review the diff** in
   `public/anthology_seed.json` before committing — the model's translations and
   emotion tags are a starting point, not gospel.

## Why anthology poems have no place

`place_links` is intentionally empty. Coordinates, reliability, and "written here
vs describes" are the app's honesty layer and must come from real sources — the
pipeline never fabricates them. Anthology poems surface wherever emotion/scene/
text matching happens (the oracle), never on the 此地 radar. Poems tied to a real,
verified place belong in a city seed (`public/<city>_seed.json`), hand-curated.
