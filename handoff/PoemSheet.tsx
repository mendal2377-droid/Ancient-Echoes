// ─────────────────────────────────────────────────────────────────────────
// Drop-in replacement for src/components/PoemSheet.tsx
// Implements ui_principles.md §4 (vertical 楷体), §7 (印章 honesty seals),
// §6 (line breath + ink-bloom), §10 (closing 「你并不孤单」).
//
// Behaviour preserved 1:1 from the original: planting + dew modal, related
// poems, place links, poet/place navigation. Only the VISUAL treatment of the
// poem + reliability changed.
//
// Requires: append handoff/poem-sheet-ink.css to src/index.css (or import it).
// The old `.bar` / `.rel-bars` styles are no longer used by this component.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react'
import type { Lang, SeedData, RadarHit, Reliability, Poet, Place } from '../types'
import { t } from '../utils/i18n'
import { makeSyntheticHit } from '../utils/makeHit'
import { isPlanted, plantPoem } from '../utils/garden'
import DewModal from './DewModal'

// Relation → the 4 chars stamped on the seal (§7)
const REL_SEAL: Record<string, { zh: string; en: string }> = {
  written_here: { zh: '作于此地', en: 'Written here' },
  describes:    { zh: '描写此地', en: 'Describes' },
  poet_present: { zh: '诗人曾驻', en: 'Poet present' },
  event_here:   { zh: '史事发生', en: 'Event here' },
}

const CONF_CHAR: Record<Reliability, string> = {
  high: '高', medium: '中', low: '低', disputed: '疑',
}
// Reliability → seal weight (§7): full vermilion / half-tone / outline / outline+疑
const CONF_WEIGHT: Record<Reliability, 'high' | 'medium' | 'low' | 'disputed'> = {
  high: 'high', medium: 'medium', low: 'low', disputed: 'disputed',
}

const FIELD_LABEL = {
  attribution: { zh: '作者', en: 'Author' },
  location:    { zh: '地点', en: 'Place' },
  relation:    { zh: '关系', en: 'Relation' },
} as const

// 朝代 → single zh char for the author column 〔 〕
const DYNASTY_ZH: Record<string, string> = {
  Tang: '唐', Song: '宋', Jin: '晋', Han: '汉', Wei: '魏',
  Sui: '隋', Yuan: '元', Ming: '明', Qing: '清', Zhou: '周',
}

function formatDist(km: number, lang: Lang): string {
  if (km < 0.1) return lang === 'zh' ? '你在这里' : 'You are here'
  if (km < 1)   return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} ${lang === 'zh' ? '公里' : 'km'}`
}

// ── 印章 seal ─────────────────────────────────────────────────────────────
function Seal({ chars, weight, size = 'sm' }: {
  chars: string
  weight: 'high' | 'medium' | 'low' | 'disputed'
  size?: 'sm' | 'lg'
}) {
  const cn = `ps2-seal ps2-seal--${size} ps2-seal--${weight} ${chars.length > 2 ? 'ps2-seal--grid' : 'ps2-seal--stack'}`
  return (
    <span className={cn} aria-hidden>
      {chars.split('').map((c, i) => <span key={i}>{c}</span>)}
    </span>
  )
}

interface Props {
  hit: RadarHit
  lang: Lang
  data: SeedData
  onClose: () => void
  onOpenPoet: (poet: Poet) => void
  onOpenPlace: (place: Place) => void
  onSelectPoem: (hit: RadarHit) => void
}

export default function PoemSheet({ hit, lang, data, onClose, onOpenPoet, onOpenPlace, onSelectPoem }: Props) {
  const { poem, link, place: primaryPlace, pos } = hit
  const poet = data.poets.find(p => p.id === poem.author_id)

  const [planted, setPlanted] = useState(() => isPlanted(poem.id))
  const [justPlanted, setJustPlanted] = useState(false)
  const [showDew, setShowDew] = useState(false)

  useEffect(() => {
    setPlanted(isPlanted(poem.id))
    setJustPlanted(false)
  }, [poem.id])

  const handleDewSave = useCallback((dew?: string) => {
    plantPoem(poem.id, dew)
    setShowDew(false)
    setPlanted(true)
    setJustPlanted(true)
    setTimeout(() => setJustPlanted(false), 2500)
  }, [poem.id])

  if (!poet) return null

  const relatedPoems = data.poems.filter(p =>
    p.id !== poem.id && p.place_links.some(l => l.place_id === link.place_id)
  )

  const rawLines = poem.body[lang] ?? poem.body.zh
  // separate poem lines from prose-paraphrase / translator notes
  const isNote = (s: string) => s.startsWith('(') || /paraphrase|译|license/i.test(s)
  const poemLines = rawLines.filter(l => !isNote(l))
  const notes = rawLines.filter(isNote)

  const relSeal = REL_SEAL[link.relation] ?? REL_SEAL.describes
  const dynastyChar = DYNASTY_ZH[poem.dynasty] ?? ''
  const isZh = lang === 'zh'

  // breath schedule (ms): title, author, each line, then seal + closing
  const tTitle = 200, tAuthor = 440, tLine0 = 760, tStep = 520
  const tSeal = tLine0 + poemLines.length * tStep + 240
  const tClosing = tSeal + 700

  return (
    <>
      {/* ① Sticky top bar — distance + close (relation now lives as a seal on the poem) */}
      <div className="sheet-topbar ps2-topbar">
        <span className="sheet-dist">{formatDist(pos.km, lang)}</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* ② Poem — vertical 楷体 (zh) / horizontal serif (en), breathing in. key replays breath per poem */}
      <div className="ps2-poem-wrap" key={poem.id}>
        {isZh ? (
          <div className="ps2-poem">
            <div className="ps2-col ps2-title ae-rise" style={{ animationDelay: `${tTitle}ms` }}>
              {t(poem.title, lang)}
            </div>
            <button
              className="ps2-col ps2-author ae-rise"
              style={{ animationDelay: `${tAuthor}ms` }}
              onClick={() => onOpenPoet(poet)}
            >
              {dynastyChar ? `〔${dynastyChar}〕` : ''}{t(poet.name, lang)}
            </button>
            {poemLines.map((line, i) => (
              <div
                key={i}
                className="ps2-col ps2-line ae-rise"
                style={{ animationDelay: `${tLine0 + i * tStep}ms` }}
              >
                {line.replace(/[，。、；]$/u, '')}
              </div>
            ))}
            <span className="ps2-seal-slot ae-rise" style={{ animationDelay: `${tSeal}ms` }}>
              <Seal chars={relSeal.zh} weight="high" size="lg" />
            </span>
          </div>
        ) : (
          <div className="ps2-poem-en">
            <div className="ps2-title-en ae-rise" style={{ animationDelay: `${tTitle}ms` }}>
              {t(poem.title, lang)}
            </div>
            <button className="ps2-author-en ae-rise" style={{ animationDelay: `${tAuthor}ms` }} onClick={() => onOpenPoet(poet)}>
              {t(poet.name, lang)} · {poet.lifespan.born}–{poet.lifespan.died} ›
            </button>
            <div className="ps2-body-en">
              {poemLines.map((line, i) => (
                <div key={i} className="ps2-line-en ae-rise" style={{ animationDelay: `${tLine0 + i * tStep}ms` }}>{line}</div>
              ))}
            </div>
            <span className="ps2-seal-slot ae-rise" style={{ animationDelay: `${tSeal}ms` }}>
              <Seal chars={relSeal.zh} weight="high" size="lg" />
            </span>
          </div>
        )}

        {/* ③ closing line — last (§10) */}
        <div className="ps2-closing ae-rise" style={{ animationDelay: `${tClosing}ms` }}>
          {lang === 'zh' ? '你并不孤单' : 'You are not alone'}
        </div>
      </div>

      {/* prose paraphrase / honest translation note, kept quiet */}
      {notes.length > 0 && (
        <div className="ps2-para">{notes.map((n, i) => <div key={i}>{n}</div>)}</div>
      )}

      {/* ④ Leave on 花径 */}
      <div className="ps-plant-row">
        {justPlanted ? (
          <span className="ps-planted-ok">✦ {lang === 'zh' ? '已留在花径' : 'Left on your path'}</span>
        ) : planted ? (
          <span className="ps-planted-already">{lang === 'zh' ? '已在花径 ✦' : 'On your path ✦'}</span>
        ) : (
          <button className="ps-plant-btn" onClick={() => setShowDew(true)}>
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
              <line x1="11" y1="20" x2="11" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M11 14 Q6 11 5 7 Q9 7 11 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              <path d="M11 12 Q16 9 17 5 Q13 6 11 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
            </svg>
            {lang === 'zh' ? '留在花径' : 'Leave on path'}
          </button>
        )}
      </div>

      {showDew && (
        <DewModal
          poemTitle={t(poem.title, lang)}
          poetName={t(poet.name, lang)}
          lang={lang}
          onSave={handleDewSave}
          onCancel={() => setShowDew(false)}
        />
      )}

      {/* ⑤ connection note — the honesty hook */}
      {link.note && (
        <div className="ps2-note">{t(link.note, lang)}</div>
      )}

      {/* ⑥ reliability — weighted seals, NOT digital bars (§7) */}
      <div className="ps2-rel">
        <div className="ps2-rel-label">{lang === 'zh' ? '可信度' : 'Reliability'}</div>
        <div className="ps2-rel-seals">
          {(['attribution', 'location', 'relation'] as const).map(field => {
            const conf = link.reliability[field]
            return (
              <div className="ps2-rel-item" key={field}>
                <Seal chars={CONF_CHAR[conf]} weight={CONF_WEIGHT[conf]} size="sm" />
                <span className="ps2-rel-field">{t(FIELD_LABEL[field], lang)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ⑦ what this place is today */}
      <div className="modern-section">
        <div className="section-label">{lang === 'zh' ? '今日此地' : 'This place today'}</div>
        <div className="modern-text">
          {t(primaryPlace.modern_status, lang)}
          {!primaryPlace.still_exists && (
            <span className="site-lost-inline">
              {' — '}{lang === 'zh' ? '遗址不存' : 'the site no longer survives'}
            </span>
          )}
        </div>
      </div>

      {/* ⑧ all place links */}
      {poem.place_links.map(l => {
        const pl = data.places.find(p => p.id === l.place_id)
        if (!pl) return null
        const rs = REL_SEAL[l.relation] ?? REL_SEAL.describes
        return (
          <div key={l.place_id}>
            <button className="place-row" onClick={() => onOpenPlace(pl)}>
              <Seal chars={rs.zh} weight={CONF_WEIGHT[l.reliability.relation]} size="sm" />
              <span className="place-name">{t(pl.name, lang)}</span>
              <span className="relbl">
                {!pl.still_exists && `${lang === 'zh' ? '遗址不存' : 'site lost'}`}
              </span>
            </button>
          </div>
        )
      })}

      {/* ⑨ related poems at the same place */}
      {relatedPoems.length > 0 && (
        <div className="related-section">
          <div className="section-label">{lang === 'zh' ? '此地另有诗作' : 'More at this place'}</div>
          {relatedPoems.map(rp => {
            const rHit = makeSyntheticHit(rp, data)
            if (!rHit) return null
            const rPoet = data.poets.find(p => p.id === rp.author_id)
            return (
              <button key={rp.id} className="list-item" onClick={() => onSelectPoem(rHit)}>
                <Seal chars={(REL_SEAL[rHit.link.relation] ?? REL_SEAL.describes).zh} weight={CONF_WEIGHT[rHit.link.reliability.relation]} size="sm" />
                <span className="list-body">
                  <span className="list-title">{t(rp.title, lang)}</span>
                  <span className="list-meta">{rPoet ? t(rPoet.name, lang) : ''}</span>
                </span>
                <span className="list-dist">›</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
