// ═══════════════════════════════════════════════════════════════════════
// 此时此地 · Here & Now — the whole product is one ritual.
//   1. First Launch Wonder (5 cinematic slides)  →  2. Home / Daily Ritual
//   →  3. Water Waiting  →  4. Poem Encounter  →  5. Plant Moment
//   →  6. Planted  →  7. Life Path (人生花径)
// Faithful port of design-reference/…/Here & Now - Ritual.dc.html.
// ═══════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Particles from './ritual/Particles'
import Logo from './ritual/Logo'
import { shrinkImage, guessScene, PHOTO_POSTER_EDGE, PHOTO_KEEP_EDGE, PHOTO_KEEP_QUALITY } from './ritual/photo'
import {
  POEMS, KIN, DEFAULTS, CHIPS, INTRO, SLOGAN, matchPoems,
  loadMoments, saveMoments, seenIntro, setSeenIntro,
  pickReunion, markReunionSeen,
  type Moment, type Poem, type Reunion, type Kin,
} from './ritual/data'
import { askOracle } from './ritual/oracle'
import { sharePoster, drawPosterTo, BACKGROUNDS, type PosterBackground, type PosterInput } from './ritual/poster'

const KAI = "var(--hn-kai)"
const SONG = "'Noto Serif SC',serif"
const WATER_SECONDS = 3.5

type Screen = 'splash' | 'intro' | 'reunion' | 'home' | 'water' | 'poem' | 'plant' | 'planted' | 'copy' | 'share' | 'path'

const SPLASH_SECONDS = 4.4

export default function App() {
  // 重逢 — decided once, at open. If an old poem is due back today it greets
  // you before the ritual; it is a doorway (its CTA leads into 今天), not a wall.
  const [reunion] = useState<Reunion | null>(() => (seenIntro() ? pickReunion(loadMoments()) : null))
  // Every launch opens on the splash — the slogan poem is the app's spine, and
  // seeing 「今人不见古时月」 before anything else sets what the whole thing is for.
  const [screen, setScreen] = useState<Screen>('splash')
  const [introSlide, setIntroSlide] = useState(0)
  const [draftText, setDraftText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [noteText, setNoteText] = useState('')
  const [choices, setChoices] = useState<string[]>([])
  const [choiceIdx, setChoiceIdx] = useState(0)
  // Why this poem answers you — written by the oracle about *your* words.
  // Empty when the local matcher answered; the poem's own gloss stands in.
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const castToken = useRef(0)
  const [moments, setMoments] = useState<Moment[]>(() => loadMoments())
  const [lastMomentId, setLastMomentId] = useState<string | null>(null)

  // 照片 — two editions. `photo` is poster-sized and lives only for this
  // session; `photoKeep` is small enough to store on a moment without blowing
  // the ~5MB localStorage budget.
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoKeep, setPhotoKeep] = useState<string | null>(null)
  const [sceneGuess, setSceneGuess] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  // 此地 — typed or picked. Deliberately not GPS: reverse geocoding needs an
  // external service, and the reliable ones are unreachable in mainland China.
  const [place, setPlace] = useState('')
  const [placeOpen, setPlaceOpen] = useState(false)

  const pickPhoto = (file: File) => {
    void shrinkImage(file, PHOTO_POSTER_EDGE).then(async big => {
      setPhoto(big)
      setPhotoKeep(await shrinkImage(file, PHOTO_KEEP_EDGE, PHOTO_KEEP_QUALITY).catch(() => big))
      setSceneGuess(await guessScene(big).catch(() => ''))
    }).catch(() => { /* unreadable image — leave the ritual untouched */ })
  }
  const clearPhoto = () => { setPhoto(null); setPhotoKeep(null); setSceneGuess('') }

  const introTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const waterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // ── ambient particle fields (stable across renders) ──
  const starField = useMemo(() => <Particles kind="star" seed={0} />, [])
  const starField2 = useMemo(() => <Particles kind="star" seed={1} />, [])
  const starField3 = useMemo(() => <Particles kind="star" seed={2} />, [])
  const fireflyField = useMemo(() => <Particles kind="firefly" seed={0} />, [])
  const fireflyField2 = useMemo(() => <Particles kind="firefly" seed={1} />, [])
  const petalField = useMemo(() => <Particles kind="petal" seed={0} />, [])
  const snowField = useMemo(() => <Particles kind="snow" seed={0} />, [])
  const fallPetalField = useMemo(() => <Particles kind="fallpetal" seed={0} />, [])

  // ── intro auto-advance (~6.2s per slide) ──
  const scheduleIntro = () => {
    clearTimeout(introTimer.current)
    introTimer.current = setTimeout(() => nextIntroRef.current(), 6200)
  }
  const nextIntro = () => {
    setIntroSlide(s => {
      if (s < INTRO.length - 1) { scheduleIntro(); return s + 1 }
      finishIntro()
      return s
    })
  }
  // keep a stable ref so the timer callback always sees the latest nextIntro
  const nextIntroRef = useRef(nextIntro)
  nextIntroRef.current = nextIntro

  const finishIntro = () => {
    clearTimeout(introTimer.current)
    setSeenIntro()
    setScreen('home')
  }
  const startIntro = () => { setScreen('intro'); setIntroSlide(0); scheduleIntro() }

  // Splash always runs first, then routes. It must start the intro timer
  // itself — the mount effect below can no longer do it, because on mount the
  // screen is 'splash', not 'intro'.
  const finishSplash = () => {
    if (!seenIntro()) { startIntro(); return }
    setScreen(reunion ? 'reunion' : 'home')
  }

  useEffect(() => {
    if (screen === 'intro') scheduleIntro()
    return () => clearTimeout(introTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => { clearTimeout(introTimer.current); clearTimeout(waterTimer.current) }, [])

  // Record the reunion as delivered, so a reload doesn't re-gift the same day.
  useEffect(() => { if (reunion) markReunionSeen(reunion.moment.id) }, [reunion])

  // ── ritual actions ──
  const toggleTag = (t: string) =>
    setTags(cur => (cur.indexOf(t) >= 0 ? cur.filter(x => x !== t) : [...cur, t]))

  // 投入水中 — the pause is no longer decorative. The ritual waits on a real
  // answer, but never *less* than WATER_SECONDS, so a fast reply doesn't rush
  // the ceremony and a slow one doesn't strand anyone (askOracle self-limits
  // and falls back to the keyword matcher rather than throwing).
  const offer = () => {
    clearTimeout(waterTimer.current)
    // 此地 and the photo's scene guess are ordinary context — the oracle reads
    // them as part of the moment, alongside the chips.
    const allTags = [...tags, place, sceneGuess].filter(Boolean)
    setChoices(matchPoems(draftText, allTags))   // fallback already in place
    setReasons({})
    setChoiceIdx(0)
    setScreen('water')

    const token = ++castToken.current
    const minWait = new Promise<void>(resolve => {
      waterTimer.current = setTimeout(resolve, WATER_SECONDS * 1000)
    })

    void Promise.all([askOracle(draftText, allTags), minWait]).then(([answer]) => {
      if (castToken.current !== token) return   // a newer cast superseded this one
      setChoices(answer.picks)
      setReasons(answer.reasons)
      setScreen('poem')
    })
  }
  // 缘分 still has no reroll. The three answers are now laid out side by side
  // as cards rather than revealed one at a time, so 另一种回答 is gone — but
  // the offer is still finite (事不过三, the limit 求签 observes). To try again
  // you cast again, which is a new casting, not a re-pick.
  const touched = () => setScreen('plant')
  // A photo belongs to ONE moment. It is deliberately kept alive through
  // plant → planted → share (the card is drawn from the full-size edition),
  // so it must be released when that flow ends — otherwise it silently rides
  // along on every later moment.
  const endMomentFlow = () => { clearPhoto(); setPlace('') }

  const skipPoem = () => { setScreen('home'); setDraftText(''); setTags([]); endMomentFlow() }
  const currentPoemId = () => choices[choiceIdx] || DEFAULTS[0]

  const plant = () => {
    const poemId = currentPoemId()
    const now = new Date()
    const moment: Moment = {
      id: 'm' + now.getTime(), poemId, createdAt: now.toISOString(),
      inputText: draftText, note: noteText,
      m: now.getMonth() + 1, d: now.getDate(),
      place: place || undefined,
      photo: photoKeep || undefined,
    }
    const next = [moment, ...moments]
    saveMoments(next)
    setMoments(next)
    setLastMomentId(moment.id)
    setDraftText(''); setTags([]); setNoteText('')
    // the photo stays in memory until the planted screen is done with it —
    // the share card is generated from the full-size edition
    setPlace(''); setSceneGuess('')
    setScreen('planted')
  }

  // 抄毕 — the moment is marked as hand-copied; 花径 shows it thereafter.
  const markCopied = () => {
    if (!lastMomentId) return
    const next = moments.map(mo => (mo.id === lastMomentId ? { ...mo, copied: true } : mo))
    saveMoments(next)
    setMoments(next)
  }

  const go = (s: Screen) => setScreen(s)
  const poem = POEMS[currentPoemId()] || POEMS[DEFAULTS[0]]
  // plant() clears the draft, so the card reads the words back off the moment.
  const plantedMoment = lastMomentId ? moments.find(mo => mo.id === lastMomentId) : undefined

  return (
    <div className="hn-backdrop">
      <div className="hn-stage">
        {placeOpen && (
          <PlaceSheet
            initial={place}
            onPick={v => { setPlace(v.trim()); setPlaceOpen(false) }}
            onCancel={() => setPlaceOpen(false)}
          />
        )}

        {screen === 'splash' && <SplashScreen onDone={finishSplash} />}

        {screen === 'intro' && (
          <IntroFlow
            slide={introSlide}
            snowField={snowField} starField3={starField3} fallPetalField={fallPetalField}
            onNext={nextIntro} onSkip={finishIntro} onStart={finishIntro}
          />
        )}

        {screen === 'reunion' && reunion && (
          <ReunionScreen
            reunion={reunion} fireflyField={fireflyField}
            onBegin={() => go('home')} onToPath={() => go('path')}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            starField={starField}
            draftText={draftText} onDraft={setDraftText}
            tags={tags} onToggleTag={toggleTag}
            photo={photo} onPickPhoto={pickPhoto} onClearPhoto={clearPhoto} photoInputRef={photoInputRef}
            sceneGuess={sceneGuess} onSceneGuess={setSceneGuess}
            place={place} onOpenPlace={() => setPlaceOpen(true)} onClearPlace={() => setPlace('')}
            onOffer={offer}
            cur={screen} onNav={go} onReplayIntro={startIntro}
          />
        )}

        {screen === 'water' && <WaterScreen petalField={petalField} />}

        {screen === 'poem' && (
          <PoemScreen
            poems={choices.map(id => POEMS[id] || POEMS[DEFAULTS[0]])}
            kins={choices.map(id => KIN[id])}
            reasons={choices.map(id => reasons[id])}
            idx={choiceIdx} onSelect={setChoiceIdx}
            onTouched={touched} onSkip={skipPoem}
          />
        )}

        {screen === 'plant' && (
          <PlantScreen
            poem={poem} starField2={starField2}
            noteText={noteText} onNote={setNoteText} onPlant={plant}
          />
        )}

        {screen === 'planted' && (
          <PlantedScreen
            poem={poem} fireflyField={fireflyField}
            onCopy={() => go('copy')} onShare={() => go('share')}
            onToPath={() => { endMomentFlow(); go('path') }}
          />
        )}

        {screen === 'share' && (
          <ShareScreen
            poem={plantedMoment ? POEMS[plantedMoment.poemId] || poem : poem}
            words={plantedMoment?.note || plantedMoment?.inputText || undefined}
            reason={plantedMoment ? reasons[plantedMoment.poemId] : undefined}
            place={plantedMoment?.place}
            photo={photo}
            onBack={() => go('planted')}
          />
        )}

        {screen === 'copy' && (
          <CopyScreen
            poem={poem}
            onFinish={() => { markCopied(); endMomentFlow(); go('path') }}
            onExit={() => { endMomentFlow(); go('path') }}
          />
        )}

        {screen === 'path' && (
          <PathScreen
            moments={moments} fireflyField2={fireflyField2}
            cur={screen} onNav={go} onReplayIntro={startIntro}
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Shared chrome
// ─────────────────────────────────────────────────────────────────────────
function StatusBar({ dark }: { dark?: boolean }) {
  const color = dark ? '#2a2438' : 'rgba(243,238,228,.85)'
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 24px 0', font: '600 13px system-ui', color, pointerEvents: 'none' }}>
      <span>9:41</span>
      <span style={{ fontSize: 10, letterSpacing: 3 }}>◐ ▪▪▪ ▮</span>
    </div>
  )
}

// 花园 was deleted: it and 花径 are near-synonyms (both 花 — a garden contains a
// path), so the split confused rather than organised, and it was a dead tab
// besides. One place to keep things; if grouping by 七情 is wanted later it
// belongs as a toggle inside 花径, not a second destination.
const NAV_DEFS: { label: string; screen: Screen | null; replay?: boolean }[] = [
  { label: '今日', screen: 'home' },
  { label: '花径', screen: 'path' },
  { label: '我的', screen: null, replay: true },
]
function TabBar({ cur, onNav, onReplayIntro }: { cur: Screen; onNav: (s: Screen) => void; onReplayIntro: () => void }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '14px 14px 22px', background: 'linear-gradient(0deg,rgba(9,8,14,.9),transparent)' }}>
      {NAV_DEFS.map(d => {
        const active = d.screen != null && d.screen === cur
        const clickable = d.replay || (d.screen != null)
        const onClick = d.replay ? onReplayIntro : (d.screen ? () => onNav(d.screen!) : () => {})
        return (
          <span key={d.label} onClick={onClick}
            style={{ color: active ? '#ebcd8c' : 'rgba(243,238,228,.4)', font: `400 11px ${SONG}`, letterSpacing: '.12em', cursor: clickable ? 'pointer' : 'default' }}>
            {d.label}
          </span>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 此地 · where you are. Typed or picked — not GPS, which would need a
// reverse-geocoding service, and the reliable ones don't answer in mainland
// China. The suggestions are places the corpus actually knows about.
// ─────────────────────────────────────────────────────────────────────────
const PLACE_SUGGESTIONS = ['南京', '西安', '杭州', '扬州', '洛阳', '苏州']

function PlaceSheet({ initial, onPick, onCancel }: { initial: string; onPick: (v: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(initial)
  return (
    <div onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(6,6,10,.72)', animation: 'hnBloom .4s ease both' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 24px 34px', borderRadius: '18px 18px 0 0', background: 'linear-gradient(180deg,#15111f,#0d0b14)', boxShadow: '0 -8px 40px rgba(0,0,0,.6)' }}>
        <div style={{ textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.3em', color: 'rgba(243,238,228,.6)' }}>此 地</div>
        <div style={{ marginTop: 6, textAlign: 'center', font: `400 11.5px ${SONG}`, letterSpacing: '.06em', color: 'rgba(243,238,228,.34)' }}>你在哪里？</div>

        <input
          value={text} onChange={e => setText(e.target.value)} placeholder="写下一个地方……" autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onPick(text) }}
          style={{ width: '100%', boxSizing: 'border-box', marginTop: 18, border: 'none', borderRadius: 14, padding: '13px 15px', background: 'rgba(243,238,228,.06)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.12)', color: '#f3eee4', fontSize: 14, letterSpacing: '.04em', outline: 'none' }}
        />

        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center' }}>
          {PLACE_SUGGESTIONS.map(p => (
            <span key={p} onClick={() => onPick(p)}
              style={{ padding: '7px 14px', borderRadius: 16, cursor: 'pointer', font: `400 12px ${SONG}`, letterSpacing: '.06em', color: 'rgba(243,238,228,.75)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.14)' }}>
              {p}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
          <div onClick={onCancel} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 24, boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.18)', font: `400 13px ${SONG}`, letterSpacing: '.12em', color: 'rgba(243,238,228,.6)', cursor: 'pointer' }}>取消</div>
          <div onClick={() => text.trim() && onPick(text)} style={{ flex: 1.3, textAlign: 'center', padding: '12px 0', borderRadius: 24, background: text.trim() ? '#c9a86a' : 'rgba(201,168,106,.25)', font: `500 13px ${SONG}`, letterSpacing: '.12em', color: text.trim() ? '#231b10' : 'rgba(243,238,228,.4)', cursor: text.trim() ? 'pointer' : 'default' }}>就是这里</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 标 · SPLASH — the slogan poem, every launch.
// 李白《把酒问月》 states the app's whole premise before a single feature does:
// the moon is the same one they saw, and we are the water passing under it.
// Tap to skip; otherwise it lifts on its own.
// ─────────────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const fired = useRef(false)
  const done = () => { if (!fired.current) { fired.current = true; onDone() } }

  useEffect(() => {
    const t = setTimeout(done, SPLASH_SECONDS * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div onClick={done} style={{ position: 'absolute', inset: 0, cursor: 'pointer', animation: 'hnBloom 1.4s ease both', background: 'radial-gradient(62% 34% at 50% 18%,rgba(216,176,114,.13),transparent 62%),linear-gradient(180deg,#07070c 0%,#0d0b16 56%,#12101c 100%)' }}>
      {/* The artwork occupies ~73% of its 1024 box, so the drawn mark is much
          smaller than `size` — 150 renders as roughly a 110px mark. */}
      <div style={{ position: 'absolute', top: 84, left: 0, right: 0, display: 'flex', justifyContent: 'center', animation: 'hnRise 1.8s .2s both' }}>
        <Logo size={150} />
      </div>

      {/* the poem, read right to left */}
      <div style={{ position: 'absolute', top: 268, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'flex-start', gap: 13, pointerEvents: 'none' }}>
        {SLOGAN.lines.map((l, i) => (
          <div key={i} style={{ writingMode: 'vertical-rl', textOrientation: 'upright', fontFamily: KAI, fontSize: 19, lineHeight: 1, letterSpacing: '.2em', whiteSpace: 'nowrap', color: '#f3eee4', opacity: 0.9, animation: `hnRise 1.6s ${(0.6 + i * 0.22).toFixed(2)}s both` }}>
            {l}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 508, left: 0, right: 0, textAlign: 'center', font: `400 11.5px ${SONG}`, letterSpacing: '.18em', color: 'rgba(235,205,140,.5)', pointerEvents: 'none', animation: 'hnRise 1.6s 2.1s both' }}>
        〔{SLOGAN.dynasty}〕{SLOGAN.author} · {SLOGAN.title}
      </div>

      <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, textAlign: 'center', font: `600 16px ${SONG}`, letterSpacing: '.34em', textIndent: '.34em', color: 'rgba(243,238,228,.82)', pointerEvents: 'none', animation: 'hnRise 1.6s 2.5s both' }}>此时此地</div>
      <div style={{ position: 'absolute', bottom: 68, left: 0, right: 0, textAlign: 'center', font: `italic 400 11px var(--hn-en)`, letterSpacing: '.1em', color: 'rgba(243,238,228,.3)', pointerEvents: 'none', animation: 'hnRise 1.6s 2.7s both' }}>Here &amp; Now</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// FLOW 1 · First Launch Wonder — 5 cinematic slides
// ─────────────────────────────────────────────────────────────────────────
function IntroFlow(props: {
  slide: number
  snowField: JSX.Element; starField3: JSX.Element; fallPetalField: JSX.Element
  onNext: () => void; onSkip: () => void; onStart: () => void
}) {
  const { slide, onNext, onSkip, onStart } = props
  const kaiVert = (fontSize: number, ls: string, color: string, delay: number): CSSProperties => ({
    writingMode: 'vertical-rl', textOrientation: 'upright', fontFamily: KAI,
    fontSize, letterSpacing: ls, color, animation: `hnRise 1.6s ${delay}s both`,
  })
  return (
    <div onClick={onNext} style={{ position: 'absolute', inset: 0, cursor: 'pointer', background: '#07070c', overflow: 'hidden' }}>

      {/* Slide 1 · 此地 Place — desert dunes, 孤烟直, long river + setting sun */}
      {slide === 0 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.2s ease both', background: 'radial-gradient(66% 40% at 68% 30%,rgba(224,158,96,.26),transparent 60%),linear-gradient(180deg,#1a1320 0%,#241826 44%,#2c1b1c 74%,#331f1a 100%)' }}>
          <div style={{ position: 'absolute', top: 150, right: 74, width: 58, height: 58, borderRadius: '50%', background: 'radial-gradient(circle at 44% 42%,#f8dca4,#e0a75e 60%,#bf7338)', boxShadow: '0 0 48px 14px rgba(224,167,94,.36)', animation: 'hnMoon 7s ease-in-out infinite' }} />
          {/* 长河 · long river catching the last light */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 490, height: 56, background: 'linear-gradient(180deg,rgba(214,170,120,.22),transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 492, height: 2, background: 'linear-gradient(90deg,transparent,rgba(232,196,140,.5) 30%,rgba(246,214,160,.8) 50%,rgba(232,196,140,.5) 70%,transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 494, left: 202, width: 14, height: 52, background: 'linear-gradient(180deg,rgba(246,214,160,.6),transparent)', filter: 'blur(2px)', pointerEvents: 'none' }} />
          {/* 大漠 · rolling desert dunes */}
          <svg viewBox="0 0 318 210" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '30%' }}>
            <path d="M0 96 Q86 66 172 92 T318 84 L318 210 L0 210 Z" fill="#20141c" opacity=".95" />
            <path d="M0 140 Q100 112 196 138 T318 132 L318 210 L0 210 Z" fill="#160d14" />
          </svg>
          {/* 孤烟直 · a lone column of beacon smoke rising straight */}
          <div style={{ position: 'absolute', left: 84, top: 352, width: 4, height: 150, background: 'linear-gradient(to top,rgba(214,200,184,.5),rgba(214,200,184,.12) 58%,transparent)', filter: 'blur(2.4px)', borderRadius: 2, transformOrigin: 'bottom', animation: 'hnSmoke 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
            <div style={kaiVert(25, '.3em', '#f3eee4', 0.5)}>大漠孤烟直</div>
            <div style={kaiVert(25, '.3em', '#f3eee4', 1.2)}>长河落日圆</div>
          </div>
          <div style={{ position: 'absolute', top: 210, left: 56, ...kaiVert(12, '.14em', 'rgba(235,205,140,.55)', 2.6) }}>〔唐〕王维</div>
        </div>
      )}

      {/* Slide 2 · 此景 Scene — lone boat, 蓑笠翁, 千山, falling snow */}
      {slide === 1 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.2s ease both', background: 'radial-gradient(64% 40% at 50% 18%,rgba(180,196,224,.14),transparent 60%),linear-gradient(180deg,#0a0c16 0%,#0e1120 54%,#0b0d18 100%)' }}>
          <svg viewBox="0 0 318 160" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, top: 404, width: '100%', height: '22%', opacity: .5 }}>
            <path d="M0 90 L44 52 L74 78 L120 40 L168 82 L214 48 L268 84 L318 56 L318 160 L0 160 Z" fill="#141824" />
            <path d="M120 40 L134 56 L106 56 Z M214 48 L226 62 L202 62 Z" fill="rgba(224,232,244,.35)" />
          </svg>
          {props.snowField}
          <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle at 40% 36%,#e7ecf3,#c1cbd8 64%,rgba(150,162,182,.35))', boxShadow: '0 0 28px 8px rgba(196,208,228,.16)', animation: 'hnMoon 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 520, height: 70, background: 'linear-gradient(180deg,rgba(150,168,196,.14),transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 521, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,214,234,.4),transparent)', pointerEvents: 'none' }} />
          {/* 孤舟蓑笠翁 · the lone boat and the old fisherman */}
          <svg width="118" height="72" viewBox="0 0 118 72" style={{ position: 'absolute', top: 496, left: '50%', transform: 'translateX(-30%)', animation: 'hnBoat 9s ease-in-out infinite', pointerEvents: 'none' }}>
            <line x1="86" y1="20" x2="100" y2="52" stroke="rgba(214,226,244,.45)" strokeWidth="1" />
            <path d="M52 8 L64 24 L40 24 Z" fill="rgba(210,222,240,.6)" />
            <path d="M45 22 Q52 16 59 22 L57 40 Q52 44 47 40 Z" fill="rgba(150,164,188,.72)" />
            <line x1="60" y1="18" x2="88" y2="22" stroke="rgba(200,214,234,.55)" strokeWidth="1.2" />
            <path d="M16 44 Q59 66 102 44 Q88 58 59 60 Q30 58 16 44 Z" fill="rgba(120,132,156,.8)" />
          </svg>
          <div style={{ position: 'absolute', top: 224, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
            <div style={kaiVert(25, '.3em', '#eef1f6', 0.5)}>孤舟蓑笠翁</div>
            <div style={kaiVert(25, '.3em', '#eef1f6', 1.2)}>独钓寒江雪</div>
          </div>
          <div style={{ position: 'absolute', top: 224, left: 60, ...kaiVert(12, '.14em', 'rgba(200,212,230,.55)', 2.6) }}>〔唐〕柳宗元</div>
        </div>
      )}

      {/* Slide 3 · 此情 Emotion — 锦瑟 strings, drifting butterfly, feeling words */}
      {slide === 2 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.2s ease both', background: 'radial-gradient(80% 50% at 50% 92%,rgba(120,110,170,.2),transparent 66%),linear-gradient(180deg,#0a0910 0%,#100d1c 60%,#14101f 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', padding: '0 22px', pointerEvents: 'none' }}>
            {[
              [.14, 7, .2], [.1, 8, 1.1], [.12, 6.5, 2], [.1, 7.5, .6], [.13, 8.5, 1.6], [.1, 7, 2.6], [.12, 6.8, 1.3],
            ].map(([op, dur, delay], k) => (
              <span key={k} style={{ width: 1, height: '100%', background: `linear-gradient(180deg,transparent,rgba(224,206,236,${op}) 30%,rgba(224,206,236,${op}) 70%,transparent)`, animation: `hnGlow ${dur}s ease-in-out ${delay}s infinite` }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 150, left: 210, animation: 'hnFlutter 9s ease-in-out infinite', pointerEvents: 'none' }}>
            <svg width="26" height="20" viewBox="0 0 26 20"><path d="M13 10 Q4 -2 1 8 Q1 16 13 11 Z" fill="rgba(216,180,224,.5)" /><path d="M13 10 Q22 -2 25 8 Q25 16 13 11 Z" fill="rgba(200,168,214,.44)" /><line x1="13" y1="6" x2="13" y2="14" stroke="rgba(235,222,244,.55)" strokeWidth="1" /></svg>
          </div>
          <div style={{ position: 'absolute', left: 44, top: 150, fontFamily: KAI, fontSize: 18, letterSpacing: '.1em', color: 'rgba(224,150,170,.55)', animation: 'hnWordDrift 6s ease-in-out .2s infinite' }}>孤独</div>
          <div style={{ position: 'absolute', right: 52, top: 180, fontFamily: KAI, fontSize: 16, letterSpacing: '.1em', color: 'rgba(176,156,216,.5)', animation: 'hnWordDrift 6s ease-in-out 1.4s infinite' }}>思念</div>
          <div style={{ position: 'absolute', left: 64, top: 410, fontFamily: KAI, fontSize: 15, letterSpacing: '.1em', color: 'rgba(232,184,106,.5)', animation: 'hnWordDrift 6s ease-in-out 2.6s infinite' }}>欢喜</div>
          <div style={{ position: 'absolute', right: 60, top: 440, fontFamily: KAI, fontSize: 15, letterSpacing: '.1em', color: 'rgba(127,166,216,.5)', animation: 'hnWordDrift 6s ease-in-out 3.6s infinite' }}>告别</div>
          <div style={{ position: 'absolute', bottom: -4, left: '-20%', right: '-20%', height: 180, background: 'radial-gradient(60% 100% at 50% 100%,rgba(120,110,170,.28),transparent 72%)', filter: 'blur(14px)', animation: 'hnMist 26s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', top: 270, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
            <div style={kaiVert(23, '.26em', '#f3eee4', 0.6)}>此情可待成追忆</div>
            <div style={kaiVert(23, '.26em', '#f3eee4', 1.3)}>只是当时已惘然</div>
          </div>
          <div style={{ position: 'absolute', top: 270, left: 58, ...kaiVert(12, '.14em', 'rgba(235,205,140,.5)', 2.8) }}>〔唐〕李商隐</div>
        </div>
      )}

      {/* Slide 4 · 此时 Time — glowing flower, 春夏秋冬 circling, falling petals */}
      {slide === 3 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.2s ease both', background: 'radial-gradient(60% 40% at 50% 40%,rgba(216,176,114,.12),transparent 64%),linear-gradient(180deg,#09090f 0%,#120e1c 58%,#161020 100%)' }}>
          {props.fallPetalField}
          {/* Three nested layers, each with exactly one job. Positioning and
              rotation MUST NOT share an element: an animated transform replaces
              the inline one, and a `to`-only keyframe interpolates from it —
              which drifts the ring and makes the spin non-linear, so no
              counter-spin can cancel it. That is what left 春夏秋冬 tumbling.
              outer = place · middle = spin · inner = counter-spin (upright). */}
          <div style={{ position: 'absolute', top: 190, left: '50%', transform: 'translate(-50%,-50%)', width: 150, height: 150, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', animation: 'hnSpinSlow 34s linear infinite' }}>
              {([
                ['春', { top: -2, left: '50%', marginLeft: -7 }, 'rgba(224,150,170,.7)'],
                ['夏', { top: '50%', right: -4, marginTop: -8 }, 'rgba(111,184,138,.7)'],
                ['秋', { bottom: -2, left: '50%', marginLeft: -7 }, 'rgba(216,150,90,.75)'],
                ['冬', { top: '50%', left: -4, marginTop: -8 }, 'rgba(180,196,224,.7)'],
              ] as [string, CSSProperties, string][]).map(([label, pos, color]) => (
                <span key={label} style={{ position: 'absolute', ...pos }}>
                  <span style={{ display: 'inline-block', fontFamily: KAI, fontSize: 15, color, animation: 'hnSpinBack 34s linear infinite' }}>{label}</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', top: 190, left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle,#fff 0%,rgba(235,205,140,.85) 40%,transparent 72%)', boxShadow: '0 0 26px 8px rgba(235,205,140,.4)', animation: 'hnBreathe 5s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', gap: 10, pointerEvents: 'none' }}>
            <div style={kaiVert(23, '.26em', '#f3eee4', 0.6)}>年年岁岁花相似</div>
            <div style={kaiVert(23, '.26em', '#f3eee4', 1.3)}>岁岁年年人不同</div>
          </div>
          <div style={{ position: 'absolute', top: 300, left: 58, ...kaiVert(12, '.14em', 'rgba(235,205,140,.5)', 2.8) }}>〔唐〕刘希夷</div>
        </div>
      )}

      {/* Slide 5 · 开始 Start */}
      {slide === 4 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.2s ease both', background: 'radial-gradient(64% 40% at 50% 22%,rgba(216,176,114,.14),transparent 60%),linear-gradient(180deg,#09090f 0%,#120e1c 58%,#171120 100%)' }}>
          {props.starField3}
          <div style={{ position: 'absolute', top: 150, left: '50%', transform: 'translateX(-50%)', width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%,#f6ecd0,#e0c184 62%,#c9a86a)', boxShadow: '0 0 40px 12px rgba(235,205,140,.32)', animation: 'hnMoon 7s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', font: `400 22px ${SONG}`, letterSpacing: '.16em', color: '#f3eee4', pointerEvents: 'none', animation: 'hnRise 1.4s .6s both' }}>今天发生了什么？</div>
          <div style={{ position: 'absolute', top: 352, left: 34, right: 34, textAlign: 'center', font: `400 12.5px/1.8 ${SONG}`, letterSpacing: '.1em', color: 'rgba(243,238,228,.5)', pointerEvents: 'none', animation: 'hnRise 1.4s 1s both' }}>此刻的一点心事，<br />也许正与千年前的某个人相通。</div>
          <div onClick={(e) => { e.stopPropagation(); onStart() }} style={{ position: 'absolute', top: 440, left: 80, right: 80, textAlign: 'center', padding: '14px 0', borderRadius: 28, background: 'radial-gradient(120% 140% at 50% 0%,rgba(235,205,140,.24),rgba(216,176,114,.1))', boxShadow: 'inset 0 0 0 1px rgba(216,176,114,.6),0 0 26px rgba(235,205,140,.16)', color: '#ebcd8c', font: `500 15px ${SONG}`, letterSpacing: '.34em', cursor: 'pointer', animation: 'hnRise 1.4s 1.6s both' }}>开 始</div>
        </div>
      )}

      {/* Intro theme line + chrome */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', font: `400 11px ${SONG}`, letterSpacing: '.4em', color: 'rgba(235,205,140,.72)', pointerEvents: 'none' }}>{INTRO[slide].label}</div>
      {INTRO[slide].copy && (
        <div style={{ position: 'absolute', bottom: 96, left: 34, right: 34, textAlign: 'center', font: `400 12.5px/1.8 ${SONG}`, letterSpacing: '.08em', color: 'rgba(243,238,228,.62)', pointerEvents: 'none', animation: 'hnRise 1.6s 2.2s both' }}>{INTRO[slide].copy}</div>
      )}
      <div style={{ position: 'absolute', bottom: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
        {INTRO.map((_, i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === slide ? '#ebcd8c' : 'rgba(243,238,228,.25)', boxShadow: i === slide ? '0 0 8px 1px rgba(235,205,140,.6)' : 'none', transition: 'all .4s' }} />
        ))}
      </div>
      <div onClick={(e) => { e.stopPropagation(); onSkip() }} style={{ position: 'absolute', top: 48, right: 22, padding: '6px 14px', borderRadius: 16, border: '1px solid rgba(243,238,228,.2)', font: `400 11px ${SONG}`, letterSpacing: '.14em', color: 'rgba(243,238,228,.55)', cursor: 'pointer' }}>跳过</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// HOME · Daily Ritual
// ─────────────────────────────────────────────────────────────────────────
function HomeScreen(props: {
  starField: JSX.Element
  draftText: string; onDraft: (v: string) => void
  tags: string[]; onToggleTag: (t: string) => void
  photo: string | null; onPickPhoto: (f: File) => void; onClearPhoto: () => void
  photoInputRef: React.RefObject<HTMLInputElement>
  sceneGuess: string; onSceneGuess: (t: string) => void
  place: string; onOpenPlace: () => void; onClearPlace: () => void
  onOffer: () => void
  cur: Screen; onNav: (s: Screen) => void; onReplayIntro: () => void
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .8s ease both', background: 'radial-gradient(64% 40% at 50% 8%,rgba(216,176,114,.12),transparent 60%),radial-gradient(120% 80% at 50% 128%,#1b1526 0%,transparent 60%),linear-gradient(180deg,#09090f 0%,#120e1c 58%,#171120 100%)' }}>
      {props.starField}
      <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%,#f6ecd0,#e0c184 62%,#c9a86a)', boxShadow: '0 0 34px 10px rgba(235,205,140,.32)', pointerEvents: 'none', animation: 'hnMoon 7s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', left: '-22%', right: '-22%', top: '60%', height: 150, background: 'radial-gradient(56% 100% at 50% 50%,rgba(216,176,114,.08),transparent 74%)', filter: 'blur(18px)', pointerEvents: 'none', animation: 'hnMist 30s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0', height: 220, background: 'linear-gradient(0deg,rgba(9,8,14,.92),transparent)', pointerEvents: 'none' }} />

      <StatusBar />
      <div style={{ position: 'absolute', top: 48, left: 26, right: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <span style={{ font: `600 14px ${SONG}`, letterSpacing: '.2em', color: 'rgba(243,238,228,.78)' }}>此时此地</span>
        <span style={{ font: `400 10px ${SONG}`, letterSpacing: '.12em', color: 'rgba(243,238,228,.5)', padding: '2px 8px', border: '1px solid rgba(243,238,228,.2)', borderRadius: 10 }}>EN</span>
      </div>

      <div style={{ position: 'absolute', top: 146, left: 28, right: 28, textAlign: 'center', font: `400 21px ${SONG}`, letterSpacing: '.14em', color: '#f3eee4', pointerEvents: 'none', animation: 'hnRise 1.1s .2s both' }}>今天发生了什么？</div>

      <div style={{ position: 'absolute', top: 206, left: 28, right: 28, animation: 'hnRise 1.1s .45s both' }}>
        <textarea value={props.draftText} onChange={(e) => props.onDraft(e.target.value)} placeholder="写下此刻的一点痕迹……"
          style={{ width: '100%', height: 96, boxSizing: 'border-box', resize: 'none', border: 'none', borderRadius: 16, padding: '16px 17px', background: 'rgba(243,238,228,.05)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.1)', color: '#f3eee4', fontSize: 14, lineHeight: 1.8, letterSpacing: '.04em' }} />
      </div>

      <div style={{ position: 'absolute', top: 322, left: 24, right: 24, display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', animation: 'hnRise 1.1s .65s both' }}>
        {CHIPS.map(label => {
          const on = props.tags.indexOf(label) >= 0
          return (
            <span key={label} onClick={() => props.onToggleTag(label)}
              style={{ padding: '7px 14px', borderRadius: 16, cursor: 'pointer', font: `400 12px ${SONG}`, letterSpacing: '.06em', color: on ? '#231b10' : 'rgba(243,238,228,.75)', background: on ? '#c9a86a' : 'rgba(243,238,228,.05)', boxShadow: on ? 'none' : 'inset 0 0 0 1px rgba(243,238,228,.14)' }}>
              {label}
            </span>
          )
        })}
      </div>

      {/* 照片 · 此地 — these were `pointerEvents: none` labels once; they do
          something now. 声音 is not here: recording is a heavy ask for a quiet
          app, and there is nothing honest to do with the audio yet. */}
      <div style={{ position: 'absolute', top: 388, left: 24, right: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, animation: 'hnRise 1.1s .8s both' }}>
        <input
          ref={props.photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) props.onPickPhoto(f); e.target.value = '' }}
        />

        {props.photo ? (
          <span onClick={props.onClearPhoto} title="移除照片"
            style={{ position: 'relative', width: 46, height: 46, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.22)' }}>
            <img src={props.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(9,8,14,.42)', color: 'rgba(243,238,228,.9)', font: `400 13px ${SONG}` }}>×</span>
          </span>
        ) : (
          <span onClick={() => props.photoInputRef.current?.click()}
            style={{ padding: '9px 15px', borderRadius: 16, cursor: 'pointer', font: `400 12px ${SONG}`, letterSpacing: '.06em', color: 'rgba(243,238,228,.72)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.14)' }}>＋ 照片</span>
        )}

        {props.place ? (
          <span onClick={props.onClearPlace} title="移除地点"
            style={{ padding: '9px 13px', borderRadius: 16, cursor: 'pointer', font: `400 12px ${SONG}`, letterSpacing: '.06em', color: '#231b10', background: '#c9a86a' }}>
            {props.place} ×
          </span>
        ) : (
          <span onClick={props.onOpenPlace}
            style={{ padding: '9px 15px', borderRadius: 16, cursor: 'pointer', font: `400 12px ${SONG}`, letterSpacing: '.06em', color: 'rgba(243,238,228,.72)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.14)' }}>＋ 此地</span>
        )}
      </div>

      {/* The colour guess is a suggestion, never applied silently — it sits
          here so it can be corrected or dismissed before it reaches the oracle. */}
      {props.photo && props.sceneGuess && (
        <div style={{ position: 'absolute', top: 440, left: 24, right: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, animation: 'hnRise .9s both' }}>
          <span style={{ font: `400 10.5px ${SONG}`, letterSpacing: '.08em', color: 'rgba(243,238,228,.34)' }}>看起来像</span>
          <span onClick={() => props.onSceneGuess('')} title="不对就去掉"
            style={{ padding: '5px 11px', borderRadius: 13, cursor: 'pointer', font: `400 11px ${SONG}`, color: '#231b10', background: 'rgba(201,168,106,.85)' }}>
            {props.sceneGuess} ×
          </span>
        </div>
      )}

      <div onClick={props.onOffer} style={{ position: 'absolute', top: 452, left: 60, right: 60, textAlign: 'center', padding: '15px 0', borderRadius: 30, background: 'radial-gradient(120% 140% at 50% 0%,rgba(235,205,140,.22),rgba(216,176,114,.1))', boxShadow: 'inset 0 0 0 1px rgba(216,176,114,.6),0 0 26px rgba(235,205,140,.14)', color: '#ebcd8c', font: `500 15px ${SONG}`, letterSpacing: '.34em', cursor: 'pointer', animation: 'hnRise 1.1s .95s both' }}>投入水中</div>

      <div style={{ position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', font: `italic 400 12px var(--hn-en)`, letterSpacing: '.06em', color: 'rgba(243,238,228,.34)', pointerEvents: 'none' }}>let this moment fall into water</div>

      <TabBar cur={props.cur} onNav={props.onNav} onReplayIntro={props.onReplayIntro} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// WATER · Waiting (no progress bar, no "generating" — a ritual pause)
// ─────────────────────────────────────────────────────────────────────────
function WaterScreen({ petalField }: { petalField: JSX.Element }) {
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1s ease both', background: 'radial-gradient(90% 60% at 50% 78%,#141a2a 0%,#0b0d16 60%,#08080d 100%)' }}>
      {petalField}
      <div style={{ position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)', width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle at 40% 36%,#f6ecd0,#e0c184 60%,rgba(201,168,106,.4))', boxShadow: '0 0 52px 16px rgba(235,205,140,.26)', pointerEvents: 'none', animation: 'hnMoon 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 76, height: 340, background: 'linear-gradient(180deg,rgba(235,205,140,.28),rgba(235,205,140,.02) 70%,transparent)', filter: 'blur(7px)', pointerEvents: 'none', animation: 'hnShimmer 4s ease-in-out infinite' }} />

      {/* 共看明月皆如此 — the moon scattered across moving water, the same image
          the logo is built from. Each band ripples on its own beat, so the
          reflection never resolves into a disc. */}
      {[
        { y: 188, w: 92, h: 5, o: 0.5, d: 0 },
        { y: 214, w: 64, h: 4, o: 0.4, d: 0.7 },
        { y: 236, w: 78, h: 4, o: 0.34, d: 1.4 },
        { y: 256, w: 44, h: 3, o: 0.26, d: 0.35 },
        { y: 273, w: 58, h: 3, o: 0.18, d: 1.9 },
      ].map(b => (
        <div key={b.y} style={{
          position: 'absolute', top: b.y, left: '50%', transform: 'translateX(-50%)',
          width: b.w, height: b.h, borderRadius: '50%',
          background: 'linear-gradient(90deg,transparent,rgba(240,220,174,.9),transparent)',
          opacity: b.o, pointerEvents: 'none',
          animation: `hnMoonRipple ${(4.2 + b.d).toFixed(1)}s ease-in-out ${b.d}s infinite`,
        }} />
      ))}
      <div style={{ position: 'absolute', top: 430, left: '50%', width: 220, height: 220, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '32%', border: '1px solid rgba(235,205,140,.4)', borderRadius: '50%', animation: 'hnRing 5s ease-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '32%', border: '1px solid rgba(235,205,140,.3)', borderRadius: '50%', animation: 'hnRing 5s ease-out 1.6s infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '32%', border: '1px solid rgba(235,205,140,.22)', borderRadius: '50%', animation: 'hnRing 5s ease-out 3.2s infinite' }} />
      </div>
      <div style={{ position: 'absolute', top: 306, left: 32, right: 32, textAlign: 'center', font: `400 15px/2 ${SONG}`, letterSpacing: '.22em', color: 'rgba(243,238,228,.82)', pointerEvents: 'none', animation: 'hnRise 1.6s .3s both' }}>你的瞬间，<br />正在水中荡漾……</div>

      {/* the slogan's own line, while you wait under the same moon */}
      <div style={{ position: 'absolute', top: 386, left: 32, right: 32, textAlign: 'center', font: `400 13px ${KAI}`, letterSpacing: '.3em', textIndent: '.3em', color: 'rgba(235,205,140,.46)', pointerEvents: 'none', animation: 'hnRise 2s 1.6s both' }}>今月曾经照古人</div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────
// 诗 · THE ENCOUNTER — three cards, each with a story on its back.
//
// This replaces 另一种回答 (which revealed answers one at a time) and absorbs
// the separate 诗后有人 study screen. Three answers laid side by side is a
// different, better offer: you see the whole reply and choose, rather than
// being handed one and asked whether you'd like a different one.
//
// Swipe or tap a dot to move between them. Tap a card to turn it over —
// 人 / 境 / 回声 / 隔世应答 live on the back, where they belong: the poem
// lands first, the scholarship waits until you ask for it.
// ─────────────────────────────────────────────────────────────────────────
const CARD_H = 360

function PoemScreen({ poems, kins, reasons, idx, onSelect, onTouched, onSkip }: {
  poems: Poem[]
  kins: (Kin | undefined)[]
  reasons: (string | undefined)[]
  idx: number
  onSelect: (i: number) => void
  onTouched: () => void
  onSkip: () => void
}) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const down = useRef<{ x: number; y: number } | null>(null)

  const tint = `rgba(${poems[idx]?.rgb ?? '216,176,114'},.4)`
  const paper = 'linear-gradient(180deg,#f7f1e5,#f1e9db)'

  // One gesture handler for the whole deck: a small movement is a tap (turn
  // the card over), a horizontal drag moves between cards. Vertical movement
  // is ignored so scrolling a long card back never flips it.
  const onUp = (x: number, y: number) => {
    const s = down.current
    down.current = null
    if (!s) return
    const dx = x - s.x, dy = y - s.y
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      setFlipped(f => ({ ...f, [idx]: !f[idx] }))
    } else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      const next = dx < 0 ? idx + 1 : idx - 1
      if (next >= 0 && next < poems.length) onSelect(next)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .9s ease both', background: `radial-gradient(120% 60% at 50% -8%,#f5efe2 0%,#ece4d3 52%,transparent 80%),radial-gradient(70% 30% at 88% 6%,${tint},transparent 60%),linear-gradient(180deg,#efe9db 0%,#e6decb 60%,#dcd3c1 100%)` }}>
      <StatusBar dark />
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.28em', color: 'rgba(42,36,56,.55)', pointerEvents: 'none', animation: 'hnRise 1.1s .3s both' }}>为你浮现的三句诗</div>

      {/* the deck */}
      <div
        style={{ position: 'absolute', top: 88, left: 0, right: 0, height: CARD_H, perspective: 1400, overflow: 'hidden', touchAction: 'pan-y' }}
        onPointerDown={e => { down.current = { x: e.clientX, y: e.clientY } }}
        onPointerUp={e => onUp(e.clientX, e.clientY)}
        onPointerCancel={() => { down.current = null }}
      >
        <div style={{ display: 'flex', height: '100%', transform: `translateX(${-idx * 100}%)`, transition: 'transform .5s var(--hn-ease, cubic-bezier(.22,.61,.36,1))' }}>
          {poems.map((poem, i) => {
            const cols = buildCols(poem, '#231d2b')
            const kin = kins[i]
            const isFlipped = !!flipped[i]
            return (
              <div key={i} style={{ minWidth: '100%', height: '100%', padding: '0 26px', boxSizing: 'border-box' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .7s cubic-bezier(.4,.1,.2,1)', transform: isFlipped ? 'rotateY(180deg)' : 'none', cursor: 'pointer' }}>

                  {/* ── front: the poem ── */}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: paper, boxShadow: '0 2px 20px rgba(74,58,40,.12),inset 0 0 0 1px rgba(74,58,40,.06)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 26, left: 0, right: 0, bottom: 74, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                      {cols.map((c, k) => <div key={k} style={c.style}>{c.text}</div>)}
                    </div>

                    <span style={{ position: 'absolute', bottom: 16, left: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', width: 32, height: 32, borderRadius: 5, background: '#a83a2a', color: '#f6ece0', font: `600 11px/1 ${SONG}`, boxShadow: '0 1px 5px rgba(168,58,42,.35)' }}>
                      <span>此</span><span>时</span><span>此</span><span>地</span>
                    </span>

                    {/* why this one answers you — the oracle's line, or the gloss */}
                    <div style={{ position: 'absolute', left: 58, right: 18, bottom: 34, font: `400 11px/1.6 ${SONG}`, letterSpacing: '.03em', color: 'rgba(42,36,56,.58)' }}>
                      {reasons[i] || poem.meaning}
                    </div>
                    <div style={{ position: 'absolute', left: 58, right: 18, bottom: 15, font: `400 10px ${SONG}`, letterSpacing: '.12em', color: 'rgba(42,36,56,.32)' }}>轻触，看它背后</div>
                  </div>

                  {/* ── back: 诗后有人 ── */}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: paper, boxShadow: '0 2px 20px rgba(74,58,40,.12),inset 0 0 0 1px rgba(74,58,40,.06)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, padding: '20px 18px 34px', overflowY: 'auto', textAlign: 'center' }}>
                      <div style={{ font: `400 14px ${KAI}`, letterSpacing: '.14em', color: '#231d2b' }}>
                        {poem.title}　〔{poem.dynasty}〕{poem.author}
                      </div>
                      <div style={{ marginTop: 14, font: `400 12.5px/1.85 ${SONG}`, letterSpacing: '.03em', color: 'rgba(42,36,56,.72)' }}>{poem.person}</div>
                      <div style={{ marginTop: 8, font: `400 11.5px/1.9 ${SONG}`, letterSpacing: '.03em', color: 'rgba(42,36,56,.56)' }}>
                        {poem.scene}
                        {poem.srcConfidence === 'trad' && (
                          <span style={{ marginLeft: 5, fontSize: 10, color: 'rgba(42,36,56,.34)' }}>〔相传〕</span>
                        )}
                      </div>
                      <div style={{ width: 24, height: 1, margin: '16px auto 0', background: 'rgba(42,36,56,.18)' }} />
                      <div style={{ marginTop: 14, font: `400 11.5px/1.9 ${SONG}`, letterSpacing: '.03em', color: 'rgba(42,36,56,.52)' }}>
                        <span style={{ marginRight: 6, fontSize: 10, letterSpacing: '.1em', color: 'rgba(168,58,42,.72)' }}>回声</span>
                        {poem.echo}
                      </div>
                      {kin && (
                        <div style={{ marginTop: 16, padding: '12px 14px 13px', borderRadius: 5, background: 'rgba(168,58,42,.035)', boxShadow: 'inset 0 0 0 1px rgba(168,58,42,.16)', textAlign: 'left' }}>
                          <div style={{ font: `400 10px ${SONG}`, letterSpacing: '.3em', textIndent: '.3em', color: 'rgba(168,58,42,.72)' }}>隔 世 应 答</div>
                          <div style={{ marginTop: 8, font: `400 11px/1.8 ${SONG}`, color: 'rgba(42,36,56,.55)' }}>{kin.relation}</div>
                          <div style={{ marginTop: 9, font: `400 14px/1.7 ${KAI}`, letterSpacing: '.08em', color: 'rgba(35,29,43,.82)' }}>{kin.line}</div>
                          <div style={{ marginTop: 5, font: `400 10px ${SONG}`, color: 'rgba(42,36,56,.42)' }}>——《{kin.title}》{kin.author}</div>
                        </div>
                      )}
                      <div style={{ marginTop: 16, font: `400 10px ${SONG}`, letterSpacing: '.12em', color: 'rgba(42,36,56,.3)' }}>轻触，翻回来</div>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* which of the three */}
      <div style={{ position: 'absolute', top: 88 + CARD_H + 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 9 }}>
        {poems.map((_, i) => (
          <span key={i} onClick={() => onSelect(i)}
            style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, cursor: 'pointer', transition: 'width .3s, background .3s', background: i === idx ? 'rgba(168,58,42,.7)' : 'rgba(42,36,56,.22)' }} />
        ))}
      </div>

      <div style={{ position: 'absolute', top: 88 + CARD_H + 44, left: 0, right: 0, textAlign: 'center', font: `400 13px ${SONG}`, letterSpacing: '.3em', color: 'rgba(42,36,56,.62)', pointerEvents: 'none', animation: 'hnRise 1.3s 2.4s both' }}>你并不孤单</div>

      <div onClick={onTouched} style={{ position: 'absolute', bottom: 74, left: 24, right: 24, textAlign: 'center', padding: '13px 0', borderRadius: 24, background: '#c9a86a', font: `500 13px ${SONG}`, letterSpacing: '.14em', color: '#231b10', cursor: 'pointer', animation: 'hnRise 1.2s 2.6s both' }}>这一句触动了我</div>
      <div onClick={onSkip} style={{ position: 'absolute', bottom: 34, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(42,36,56,.42)', cursor: 'pointer' }}>暂时不种</div>
    </div>
  )
}


interface Col { text: string; style: CSSProperties }
function buildCols(poem: Poem, color: string): Col[] {
  const col = (text: string, size: string, ls: string, op: number, ml: string, delay: number): Col => ({
    text,
    style: {
      writingMode: 'vertical-rl', textOrientation: 'upright', fontFamily: KAI,
      fontSize: size, letterSpacing: ls, opacity: op, marginLeft: ml, color,
      animation: `hnRise 1.2s ${delay}s both`,
    },
  })
  const cols = [
    col(poem.title, '18px', '.14em', .92, '9px', .5),
    col(`〔${poem.dynasty}〕${poem.author}`, '11.5px', '.1em', .5, '12px', .7),
  ]
  poem.lines.forEach((l, i) => cols.push(col(l, '22px', '.24em', 1, '0px', 1.0 + 0.4 * i)))
  return cols
}

// ─────────────────────────────────────────────────────────────────────────
// PLANT · optional note → 留在花径
// ─────────────────────────────────────────────────────────────────────────
function PlantScreen({ poem, starField2, noteText, onNote, onPlant }: { poem: Poem; starField2: JSX.Element; noteText: string; onNote: (v: string) => void; onPlant: () => void }) {
  const tint = `rgb(${poem.rgb})`, tintSoft = `rgba(${poem.rgb},.4)`
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .9s ease both', background: 'radial-gradient(70% 44% at 50% 30%,rgba(216,176,114,.08),transparent 62%),linear-gradient(180deg,#09090f 0%,#120e1c 58%,#161020 100%)' }}>
      {starField2}
      <div style={{ position: 'absolute', top: 118, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: `radial-gradient(circle,#fff 0%,${tint} 40%,transparent 72%)`, boxShadow: `0 0 24px 6px ${tintSoft}`, pointerEvents: 'none', animation: 'hnBreathe 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 180, left: 34, right: 34, textAlign: 'center', font: `400 15px/1.9 ${SONG}`, letterSpacing: '.12em', color: '#f3eee4', pointerEvents: 'none', animation: 'hnRise 1.1s .3s both' }}>如果愿意，<br />可以为这一刻留下一点什么。</div>

      <div style={{ position: 'absolute', top: 290, left: 30, right: 30, animation: 'hnRise 1.1s .5s both' }}>
        <textarea value={noteText} onChange={(e) => onNote(e.target.value)} placeholder="一句话，或什么都不写……"
          style={{ width: '100%', height: 88, boxSizing: 'border-box', resize: 'none', border: 'none', borderRadius: 16, padding: '15px 16px', background: 'rgba(243,238,228,.05)', boxShadow: 'inset 0 0 0 1px rgba(243,238,228,.1)', color: '#f3eee4', fontSize: 13.5, lineHeight: 1.8, letterSpacing: '.04em' }} />
      </div>

      <div onClick={onPlant} style={{ position: 'absolute', top: 414, left: 56, right: 56, textAlign: 'center', padding: '14px 0', borderRadius: 28, background: '#c9a86a', color: '#231b10', font: `500 14px ${SONG}`, letterSpacing: '.28em', cursor: 'pointer', animation: 'hnRise 1.1s .7s both' }}>留在花径</div>
      <div onClick={onPlant} style={{ position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.4)', cursor: 'pointer' }}>不写也可以</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PLANTED · success
// ─────────────────────────────────────────────────────────────────────────
function PlantedScreen({ poem, fireflyField, onCopy, onShare, onToPath }: { poem: Poem; fireflyField: JSX.Element; onCopy: () => void; onShare: () => void; onToPath: () => void }) {
  const tint = `rgb(${poem.rgb})`, tintSoft = `rgba(${poem.rgb},.4)`
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1.1s ease both', background: 'radial-gradient(60% 40% at 50% 42%,rgba(216,176,114,.1),transparent 64%),linear-gradient(180deg,#09090f 0%,#120e1c 58%,#161020 100%)' }}>
      {fireflyField}
      <div style={{ position: 'absolute', top: 236, left: '50%', transform: 'translateX(-50%)', width: 66, height: 66, borderRadius: '50%', background: `radial-gradient(circle,#fff 0%,${tint} 38%,transparent 72%)`, boxShadow: `0 0 40px 12px ${tintSoft}`, pointerEvents: 'none', animation: 'hnBreathe 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 338, left: 0, right: 0, textAlign: 'center', font: `400 17px ${SONG}`, letterSpacing: '.18em', color: '#f3eee4', pointerEvents: 'none', animation: 'hnRise 1.4s .5s both' }}>已留在花径。</div>
      <div style={{ position: 'absolute', top: 376, left: 0, right: 0, textAlign: 'center', font: `400 12.5px ${SONG}`, letterSpacing: '.16em', color: 'rgba(235,205,140,.7)', pointerEvents: 'none', animation: 'hnRise 1.4s .8s both' }}>这朵花，会在未来等你。</div>

      {/* 抄 — the one act that asks something of the hand. 临帖 is how this
          poetry has always been absorbed; the app should not be read-only. */}
      <div onClick={onCopy} style={{ position: 'absolute', top: 442, left: 58, right: 58, textAlign: 'center', padding: '14px 0', borderRadius: 28, background: 'radial-gradient(120% 140% at 50% 0%,rgba(235,205,140,.22),rgba(216,176,114,.1))', boxShadow: 'inset 0 0 0 1px rgba(216,176,114,.6),0 0 26px rgba(235,205,140,.14)', color: '#ebcd8c', font: `500 14px ${SONG}`, letterSpacing: '.34em', cursor: 'pointer', animation: 'hnRise 1.4s 1.3s both' }}>抄 一 遍</div>
      <div style={{ position: 'absolute', top: 494, left: 34, right: 34, textAlign: 'center', font: `400 11px/1.7 ${SONG}`, letterSpacing: '.06em', color: 'rgba(243,238,228,.34)', pointerEvents: 'none', animation: 'hnRise 1.4s 1.5s both' }}>一笔一画写过，才算真的留下。</div>

      <div style={{ position: 'absolute', bottom: 52, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, animation: 'hnRise 1.4s 1.7s both' }}>
        <span onClick={onShare} style={{ font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.5)', cursor: 'pointer' }}>存为卡片</span>
        <span style={{ color: 'rgba(243,238,228,.2)', fontSize: 11 }}>·</span>
        <span onClick={onToPath} style={{ font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.5)', cursor: 'pointer' }}>走进花径</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 分享 · THE SHARE STUDIO.
//
// The growth mechanic, so it is held to a higher bar: the card has to be worth
// posting. You choose the ground — 宣纸 / 月夜 / 山水, or your own photograph
// ink-washed — and decide whether your words and the reason ride along.
//
// The preview is the real thing: the same 1080×1440 canvas that gets saved,
// shown at CSS scale. What you see is exactly the file.
// ─────────────────────────────────────────────────────────────────────────
function ShareScreen({ poem, words, reason, place, photo, onBack }: {
  poem: Poem
  words?: string
  reason?: string
  place?: string
  photo?: string | null
  onBack: () => void
}) {
  const [background, setBackground] = useState<PosterBackground>(photo ? 'photo' : 'paper')
  const [showWords, setShowWords] = useState(true)
  const [showReason, setShowReason] = useState(true)
  const [onlyLine, setOnlyLine] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draw = useRef(0)

  const input = (): PosterInput => ({
    title: poem.title, author: poem.author, dynasty: poem.dynasty, lines: poem.lines,
    words, reason, place,
    background, photo: photo ?? undefined,
    showWords, showReason, onlyLine: onlyLine ?? undefined,
  })

  // redraw on every change; a token guards against a slow draw (photo decode)
  // landing after a newer one
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const token = ++draw.current
    void drawPosterTo(c, input()).then(() => {
      if (token !== draw.current) return   // superseded
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background, showWords, showReason, onlyLine])

  const save = () => {
    if (saving) return
    setSaving(true)
    void sharePoster(input()).catch(() => {}).finally(() => setSaving(false))
  }

  const Toggle = ({ on, label, onTap }: { on: boolean; label: string; onTap: () => void }) => (
    <span onClick={onTap} style={{
      padding: '7px 14px', borderRadius: 16, cursor: 'pointer',
      font: `400 12px ${SONG}`, letterSpacing: '.06em',
      color: on ? '#231b10' : 'rgba(243,238,228,.7)',
      background: on ? '#c9a86a' : 'transparent',
      boxShadow: on ? 'none' : 'inset 0 0 0 1px rgba(243,238,228,.16)',
    }}>{label}</span>
  )

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .8s ease both', background: 'radial-gradient(70% 40% at 50% 4%,rgba(216,176,114,.10),transparent 60%),linear-gradient(180deg,#09090f 0%,#110d1b 58%,#161020 100%)' }}>
      <StatusBar />
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.4em', color: 'rgba(235,205,140,.72)' }}>存 为 卡 片</div>

      {/* the preview IS the artefact */}
      <div style={{ position: 'absolute', top: 86, left: 0, right: 0, display: 'flex', justifyContent: 'center', animation: 'hnRise 1s .1s both' }}>
        <canvas ref={canvasRef} style={{ width: 258, height: 344, borderRadius: 6, display: 'block', boxShadow: '0 18px 46px rgba(0,0,0,.55)' }} />
      </div>

      {/* controls */}
      <div style={{ position: 'absolute', top: 452, bottom: 122, left: 20, right: 20, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {BACKGROUNDS.map(b => {
            const disabled = b.id === 'photo' && !photo
            const on = background === b.id
            return (
              <span key={b.id} onClick={() => !disabled && setBackground(b.id)}
                title={disabled ? '这一刻没有照片' : undefined}
                style={{
                  padding: '7px 15px', borderRadius: 16,
                  cursor: disabled ? 'default' : 'pointer',
                  font: `400 12px ${SONG}`, letterSpacing: '.08em',
                  color: disabled ? 'rgba(243,238,228,.24)' : on ? '#231b10' : 'rgba(243,238,228,.75)',
                  background: on ? '#c9a86a' : 'transparent',
                  boxShadow: on ? 'none' : `inset 0 0 0 1px rgba(243,238,228,${disabled ? '.07' : '.16'})`,
                }}>{b.label}</span>
            )
          })}
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {words && <Toggle on={showWords} label="我的话" onTap={() => setShowWords(v => !v)} />}
          {reason && <Toggle on={showReason} label="缘由" onTap={() => setShowReason(v => !v)} />}
          <Toggle on={!!onlyLine} label="只留一句" onTap={() => setOnlyLine(v => (v ? null : poem.lines[poem.lines.length - 1]))} />
        </div>

        {onlyLine && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
            {poem.lines.map(l => (
              <span key={l} onClick={() => setOnlyLine(l)}
                style={{
                  padding: '6px 11px', borderRadius: 14, cursor: 'pointer',
                  font: `400 12px ${KAI}`, letterSpacing: '.06em',
                  color: l === onlyLine ? '#231b10' : 'rgba(243,238,228,.62)',
                  background: l === onlyLine ? 'rgba(201,168,106,.85)' : 'transparent',
                  boxShadow: l === onlyLine ? 'none' : 'inset 0 0 0 1px rgba(243,238,228,.12)',
                }}>{l}</span>
            ))}
          </div>
        )}
      </div>

      <div onClick={save} style={{ position: 'absolute', bottom: 74, left: 24, right: 24, textAlign: 'center', padding: '13px 0', borderRadius: 24, background: saving ? 'rgba(201,168,106,.4)' : '#c9a86a', font: `500 13px ${SONG}`, letterSpacing: '.2em', color: '#231b10', cursor: 'pointer' }}>
        {saving ? '生成中…' : '保存 · 分享'}
      </div>
      <div onClick={onBack} style={{ position: 'absolute', bottom: 34, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.42)', cursor: 'pointer' }}>返回</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 抄 · COPY — 临摹, not 描红.
//
// It used to trace: the glyph sat pale on the paper and a finger inked it in,
// scored by coverage. That was the *children's* form — 描红本 is a primary
// school object, the 米字格 is a schoolbook grid, and a 55%-coverage threshold
// meant a scribble passed, so the app pretended to check the writing and
// didn't. Anything that grades you badly is worse than not grading you.
//
// Now: you choose the line that moved you, look at the model, and write it
// yourself in an empty box. Nothing is scored and nothing auto-advances — you
// tap when you are done. A traced character is the app's handwriting; a
// written one is yours, wobbly and unmistakably a person's. That is what makes
// the 抄 seal on 花径 mean anything.
// ─────────────────────────────────────────────────────────────────────────
const COPY_BOX = 226     // CSS px — the writing square
const COPY_MODEL = 88    // the 帖 shown above it
const COPY_BRUSH = 9     // a writing nib, not a filling brush

function CopyScreen({ poem, onFinish, onExit }: { poem: Poem; onFinish: () => void; onExit: () => void }) {
  // Which line moved you — chosen, not assumed. Copying all 20–28 characters
  // was ten minutes of finger-work with no skill curve; one line is a minute.
  const [lineIdx, setLineIdx] = useState<number | null>(null)
  const [charIdx, setCharIdx] = useState(0)
  const [inked, setInked] = useState(false)
  const [ready, setReady] = useState(false)

  const inkRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const line = lineIdx === null ? '' : poem.lines[lineIdx]
  const chars = useMemo(() => [...line], [line])
  const done = lineIdx !== null && charIdx >= chars.length
  const ch = chars[charIdx] || ''
  const dpr = () => Math.min(window.devicePixelRatio || 1, 3)

  // the model must be the real 楷 — wait for the bundled webfont
  useEffect(() => {
    let alive = true
    document.fonts.ready.then(() => { if (alive) setReady(true) })
    return () => { alive = false }
  }, [])

  // fresh paper for each character
  useEffect(() => {
    if (lineIdx === null || done) return
    const ink = inkRef.current
    if (!ink) return
    const px = Math.round(COPY_BOX * dpr())
    ink.width = px; ink.height = px
    const ctx = ink.getContext('2d')!
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, px, px)
    last.current = null; drawing.current = false
    setInked(false)
  }, [ch, lineIdx, done])

  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const strokeTo = (p: { x: number; y: number }) => {
    const ink = inkRef.current
    if (!ink) return
    const ctx = ink.getContext('2d')!
    const r = dpr()
    ctx.setTransform(r, 0, 0, r, 0, 0)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.lineWidth = COPY_BRUSH
    ctx.strokeStyle = '#231d2b'
    const from = last.current || p
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    last.current = p
    if (!inked) setInked(true)
  }
  const clear = () => {
    const ink = inkRef.current
    if (!ink) return
    const ctx = ink.getContext('2d')!
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, ink.width, ink.height)
    last.current = null
    setInked(false)
  }

  const paper = 'radial-gradient(120% 60% at 50% -8%,#f5efe2 0%,#ece4d3 52%,transparent 80%),linear-gradient(180deg,#efe9db 0%,#e6decb 60%,#dcd3c1 100%)'

  // ── choose the line ──
  if (lineIdx === null) {
    return (
      <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .9s ease both', background: paper }}>
        <StatusBar dark />
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.4em', color: 'rgba(42,36,56,.55)' }}>抄 一 句</div>
        <div style={{ position: 'absolute', top: 104, left: 0, right: 0, textAlign: 'center', font: `400 12.5px ${SONG}`, letterSpacing: '.1em', color: 'rgba(42,36,56,.45)' }}>哪一句留住了你？</div>
        <div style={{ position: 'absolute', top: 168, left: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {poem.lines.map((l, i) => (
            <div key={i} onClick={() => { setLineIdx(i); setCharIdx(0) }}
              style={{ textAlign: 'center', padding: '15px 0', borderRadius: 8, background: 'rgba(255,255,255,.34)', boxShadow: 'inset 0 0 0 1px rgba(74,58,40,.12)', font: `400 20px ${KAI}`, letterSpacing: '.2em', textIndent: '.2em', color: '#231d2b', cursor: 'pointer', animation: `hnRise 1s ${(.15 + i * .1).toFixed(2)}s both` }}>
              {l}
            </div>
          ))}
        </div>
        <div onClick={onExit} style={{ position: 'absolute', bottom: 44, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(42,36,56,.42)', cursor: 'pointer' }}>下次再抄</div>
      </div>
    )
  }

  // ── 抄毕 ──
  if (done) {
    const cols = buildCols(poem, '#231d2b')
    return (
      <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .9s ease both', background: paper }}>
        <StatusBar dark />
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.4em', color: 'rgba(42,36,56,.55)', animation: 'hnRise 1.2s .2s both' }}>抄 毕</div>
        <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'flex-start', gap: 5, animation: 'hnRise 1.4s .5s both' }}>
          {cols.map((c, i) => <div key={i} style={c.style}>{c.text}</div>)}
        </div>
        <div style={{ position: 'absolute', bottom: 122, left: 34, right: 34, textAlign: 'center', font: `400 12.5px/1.8 ${SONG}`, letterSpacing: '.1em', color: 'rgba(42,36,56,.55)', animation: 'hnRise 1.3s 1.2s both' }}>「{line}」——你亲手写过一遍。</div>
        <div onClick={onFinish} style={{ position: 'absolute', bottom: 56, left: 58, right: 58, textAlign: 'center', padding: '13px 0', borderRadius: 26, background: '#c9a86a', color: '#231b10', font: `500 14px ${SONG}`, letterSpacing: '.28em', cursor: 'pointer', animation: 'hnRise 1.3s 1.5s both' }}>走进花径</div>
      </div>
    )
  }

  // ── write it ──
  const advance = () => { if (charIdx < chars.length) setCharIdx(i => i + 1) }
  const isLast = charIdx === chars.length - 1

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .9s ease both', background: paper }}>
      <StatusBar dark />
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.4em', color: 'rgba(42,36,56,.55)' }}>临 摹</div>

      {/* the line, lighting up as you go */}
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center', font: `400 17px ${KAI}`, letterSpacing: '.2em', textIndent: '.2em' }}>
        {chars.map((c, i) => (
          <span key={i} style={{ color: i < charIdx ? 'rgba(35,29,43,.82)' : i === charIdx ? '#a83a2a' : 'rgba(35,29,43,.22)', transition: 'color .5s' }}>{c}</span>
        ))}
      </div>

      {/* 帖 — the model you look at. You are copying it, not tracing it. */}
      <div style={{ position: 'absolute', top: 142, left: 0, right: 0, textAlign: 'center', font: `${COPY_MODEL}px ${KAI}`, lineHeight: 1, color: 'rgba(35,29,43,.30)', pointerEvents: 'none' }}>
        {ready ? ch : ''}
      </div>

      {/* empty paper — your hand, not the app's */}
      <div style={{ position: 'absolute', top: 268, left: '50%', transform: 'translateX(-50%)', width: COPY_BOX, height: COPY_BOX, borderRadius: 4, background: 'linear-gradient(180deg,#f7f1e5,#f1e9db)', boxShadow: '0 2px 18px rgba(74,58,40,.12),inset 0 0 0 1px rgba(74,58,40,.10)' }}>
        <canvas
          ref={inkRef}
          style={{ position: 'absolute', inset: 0, width: COPY_BOX, height: COPY_BOX, touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={e => { try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already released */ } drawing.current = true; last.current = null; strokeTo(at(e)) }}
          onPointerMove={e => { if (drawing.current) strokeTo(at(e)) }}
          onPointerUp={() => { drawing.current = false; last.current = null }}
          onPointerCancel={() => { drawing.current = false; last.current = null }}
        />
      </div>

      <div style={{ position: 'absolute', top: 516, left: 0, right: 0, textAlign: 'center', font: `400 11px ${SONG}`, letterSpacing: '.14em', color: 'rgba(42,36,56,.4)' }}>
        {charIdx + 1} / {chars.length} · 照着写，不用写好
      </div>

      <div style={{ position: 'absolute', bottom: 82, left: 24, right: 24, display: 'flex', gap: 12 }}>
        <div onClick={clear} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 24, border: '1px solid rgba(42,36,56,.22)', font: `400 13px ${SONG}`, letterSpacing: '.12em', color: inked ? 'rgba(42,36,56,.7)' : 'rgba(42,36,56,.3)', cursor: inked ? 'pointer' : 'default' }}>重 写</div>
        <div onClick={advance} style={{ flex: 1.3, textAlign: 'center', padding: '12px 0', borderRadius: 24, background: '#c9a86a', font: `500 13px ${SONG}`, letterSpacing: '.12em', color: '#231b10', cursor: 'pointer' }}>{isLast ? '写完了' : '下 一 字'}</div>
      </div>

      <div onClick={onExit} style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(42,36,56,.42)', cursor: 'pointer' }}>就抄到这里</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 重逢 · REUNION — a poem you planted long ago comes back, carrying the words
// you wrote beside it. Delivers the intro's 此时 promise:「有些诗，要等你走到
// 某一天，才会真正读懂。」The user's own past words are the payload.
// ─────────────────────────────────────────────────────────────────────────
function ReunionScreen({ reunion, fireflyField, onBegin, onToPath }: {
  reunion: Reunion; fireflyField: JSX.Element; onBegin: () => void; onToPath: () => void
}) {
  const { poem, phrase, words, moment } = reunion
  const tint = `rgb(${poem.rgb})`
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom 1s ease both', background: 'radial-gradient(60% 34% at 74% 12%,rgba(216,176,114,.1),transparent 58%),radial-gradient(120% 70% at 50% 128%,#1b1526 0%,transparent 60%),linear-gradient(180deg,#09090f 0%,#110d1b 58%,#161020 100%)' }}>
      {fireflyField}
      <div style={{ position: 'absolute', top: 58, right: 40, width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%,#f6ecd0,#e0c184 62%,#c9a86a)', boxShadow: '0 0 30px 9px rgba(235,205,140,.24)', pointerEvents: 'none', animation: 'hnMoon 7s ease-in-out infinite' }} />
      <StatusBar />

      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, textAlign: 'center', font: `400 11px ${SONG}`, letterSpacing: '.4em', color: 'rgba(235,205,140,.72)', pointerEvents: 'none', animation: 'hnRise 1.2s .3s both' }}>重 逢</div>

      {/* bounded flow — never collides with the actions, scrolls if it must */}
      <div style={{ position: 'absolute', top: 124, bottom: 140, left: 30, right: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflowY: 'auto' }}>
        <div style={{ flexShrink: 0, font: `400 18px/1.7 ${SONG}`, letterSpacing: '.14em', color: '#f3eee4', animation: 'hnRise 1.4s .5s both' }}>{phrase}</div>

        <div style={{ flexShrink: 0, marginTop: 30, font: `400 22px ${KAI}`, letterSpacing: '.24em', textIndent: '.24em', color: '#f3eee4', animation: 'hnRise 1.5s .9s both' }}>{poem.lines[0]}</div>
        <div style={{ flexShrink: 0, marginTop: 12, font: `400 11.5px ${SONG}`, letterSpacing: '.12em', color: 'rgba(243,238,228,.45)', animation: 'hnRise 1.4s 1.2s both' }}>
          {poem.title} · 〔{poem.dynasty}〕{poem.author}
        </div>

        <div style={{ flexShrink: 0, width: 24, height: 1, marginTop: 26, background: `rgba(${poem.rgb},.5)`, boxShadow: `0 0 8px ${tint}`, animation: 'hnRise 1.2s 1.5s both' }} />

        {words ? (
          <>
            <div style={{ flexShrink: 0, marginTop: 22, font: `400 11px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.4)', animation: 'hnRise 1.3s 1.7s both' }}>那天，你写下</div>
            <div style={{ flexShrink: 0, marginTop: 10, font: `400 16px/1.8 ${KAI}`, letterSpacing: '.08em', color: '#ebcd8c', animation: 'hnRise 1.5s 1.9s both' }}>「{words}」</div>
          </>
        ) : (
          <div style={{ flexShrink: 0, marginTop: 22, font: `400 12.5px/1.8 ${SONG}`, letterSpacing: '.08em', color: 'rgba(243,238,228,.45)', animation: 'hnRise 1.3s 1.7s both' }}>那天你什么也没说，只留下了它。</div>
        )}

        <div style={{ flexShrink: 0, marginTop: 26, paddingBottom: 4, font: `400 12.5px/1.8 ${SONG}`, letterSpacing: '.1em', color: 'rgba(243,238,228,.55)', animation: 'hnRise 1.4s 2.3s both' }}>今天再读，还是同一句吗？</div>
      </div>

      <div onClick={onBegin} style={{ position: 'absolute', bottom: 92, left: 58, right: 58, textAlign: 'center', padding: '14px 0', borderRadius: 28, background: 'radial-gradient(120% 140% at 50% 0%,rgba(235,205,140,.22),rgba(216,176,114,.1))', boxShadow: 'inset 0 0 0 1px rgba(216,176,114,.6),0 0 26px rgba(235,205,140,.14)', color: '#ebcd8c', font: `500 14px ${SONG}`, letterSpacing: '.28em', cursor: 'pointer', animation: 'hnRise 1.3s 2.6s both' }}>今天发生了什么？</div>
      <div onClick={onToPath} style={{ position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center', font: `400 12px ${SONG}`, letterSpacing: '.16em', color: 'rgba(243,238,228,.4)', cursor: 'pointer', animation: 'hnRise 1.3s 2.8s both' }}>
        {`回花径看看 · ${moment.m}.${moment.d}`}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LIFE PATH · 人生花径 — winding lit path, newest at top
// ─────────────────────────────────────────────────────────────────────────
function PathScreen({ moments, fireflyField2, cur, onNav, onReplayIntro }: { moments: Moment[]; fireflyField2: JSX.Element; cur: Screen; onNav: (s: Screen) => void; onReplayIntro: () => void }) {
  const n = moments.length
  const path = buildPath(moments)
  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'hnBloom .8s ease both', background: 'radial-gradient(60% 34% at 78% 12%,rgba(216,176,114,.12),transparent 58%),radial-gradient(120% 70% at 50% 128%,#1c1526 0%,transparent 60%),linear-gradient(180deg,#09090f 0%,#110d1b 58%,#161020 100%)' }}>
      {fireflyField2}
      <div style={{ position: 'absolute', top: 54, right: 44, width: 38, height: 38, borderRadius: '50%', background: 'radial-gradient(circle at 38% 36%,#f6ecd0,#e0c184 62%,#c9a86a)', boxShadow: '0 0 26px 8px rgba(235,205,140,.26)', pointerEvents: 'none', animation: 'hnMoon 7s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 130, background: 'linear-gradient(180deg,rgba(9,9,15,.8),transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0', height: 120, background: 'linear-gradient(0deg,rgba(9,8,14,.94),transparent)', pointerEvents: 'none' }} />
      <StatusBar />
      <div style={{ position: 'absolute', top: 46, left: 26, right: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pointerEvents: 'none' }}>
        <div>
          <div style={{ font: `600 15px ${SONG}`, letterSpacing: '.18em', color: '#f3eee4' }}>人生花径</div>
          <div style={{ font: `italic 400 11px var(--hn-en)`, color: 'rgba(243,238,228,.45)', marginTop: 2 }}>{n > 0 ? `${n} 朵花，沿路开放` : 'the path you will walk'}</div>
        </div>
      </div>

      {n > 0 ? (
        <div style={{ position: 'absolute', top: 92, bottom: 70, left: 0, right: 0, overflowY: 'auto' }}>
          <div style={{ position: 'relative', width: 318, height: path.H, margin: '0 auto' }}>
            <svg viewBox={`0 0 318 ${path.H}`} width="318" height={path.H} preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              <path d={path.d} fill="none" stroke="rgba(235,205,140,.42)" strokeWidth="1.6" strokeDasharray="3 8" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,205,140,.42))' }} />
            </svg>
            {path.nodes.map((nd, i) => (
              <span key={'b' + i} style={nd.bloomWrap}>
                <FlowerBloom rgb={nd.rgb} petals={nd.petals} size={34} />
              </span>
            ))}
            {path.nodes.map((nd, i) => (
              <div key={'l' + i} style={nd.label}>
                <div style={nd.dateStyle}>
                  {nd.date}
                  {nd.copied && (
                    <span style={{ marginLeft: 5, padding: '1px 3px', borderRadius: 2, background: 'rgba(168,58,42,.9)', color: '#f6ece0', font: `500 8px ${SONG}`, letterSpacing: 0 }}>抄</span>
                  )}
                </div>
                <div style={nd.titleStyle}>{nd.title}</div>
                <div style={nd.lineStyle}>{nd.line}</div>
                {nd.note && <div style={nd.noteStyle}>{nd.note}</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 34, right: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle,rgba(235,205,140,.5),transparent 70%)', animation: 'hnBreathe 5s ease-in-out infinite' }} />
          <div style={{ marginTop: 22, font: `400 15px/2 ${SONG}`, letterSpacing: '.14em', color: 'rgba(243,238,228,.72)' }}>花径还很安静。<br />第一朵花，会从今天开始。</div>
        </div>
      )}

      <TabBar cur={cur} onNav={onNav} onReplayIntro={onReplayIntro} />
    </div>
  )
}

// 花径 means a path of FLOWERS. It was drawing 22px glowing dots — which read
// as a star map, not a garden, and that mismatch matters beyond looks: 重逢 and
// 抄 both rest on the garden metaphor being true. Stars don't grow; flowers do.
// (The pre-port app had exactly this and the port lost it.)
function FlowerBloom({ rgb, petals, size }: { rgb: string; petals: number; size: number }) {
  const c = size / 2
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} aria-hidden>
      {Array.from({ length: petals }, (_, i) => {
        // asymmetric petals — a hand-drawn bloom, not a rosette stamp
        const a = (i / petals) * Math.PI * 2 - Math.PI / 2
        const push = r * (0.40 + 0.05 * Math.sin(i * 2.1))
        const px = c + push * Math.cos(a)
        const py = c + push * Math.sin(a)
        return (
          <ellipse
            key={i}
            cx={px} cy={py}
            rx={r * (0.21 + 0.03 * Math.sin(i * 1.7))}
            ry={r * (0.44 + 0.04 * Math.cos(i * 1.3))}
            fill={`rgb(${rgb})`}
            opacity={0.72 + 0.12 * (i % 3)}
            transform={`rotate(${(a * 180) / Math.PI + 90} ${px} ${py})`}
          />
        )
      })}
      <circle cx={c} cy={c} r={r * 0.19} fill={`rgb(${rgb})`} />
      <circle cx={c} cy={c} r={r * 0.09} fill="#f6e8c8" opacity="0.95" />
    </svg>
  )
}

interface PathNode {
  bloomWrap: CSSProperties; rgb: string; petals: number
  label: CSSProperties
  date: string; title: string; line: string; note: string; copied: boolean
  dateStyle: CSSProperties; titleStyle: CSSProperties; lineStyle: CSSProperties; noteStyle: CSSProperties
}
function buildPath(moments: Moment[]): { d: string; H: number; nodes: PathNode[] } {
  const N = moments.length
  const topPad = 48, gap = 132, cx0 = 159, amp = 74
  const H = Math.max(topPad * 2 + (N - 1) * gap, 320)
  const pts = moments.map((mo, i) => ({ x: cx0 + amp * Math.sin(i * 0.9 + 0.5), y: topPad + i * gap, mo }))
  let d = ''
  pts.forEach((p, i) => {
    if (i === 0) d = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    else {
      const pr = pts[i - 1]
      d += ` C ${pr.x.toFixed(1)} ${(pr.y + gap * .5).toFixed(1)}, ${p.x.toFixed(1)} ${(p.y - gap * .5).toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    }
  })
  const nodes = pts.map((p, i) => {
    const poem = POEMS[p.mo.poemId] || POEMS[DEFAULTS[0]]
    const tint = `rgb(${poem.rgb})`, tintSoft = `rgba(${poem.rgb},.4)`
    const toRight = p.x <= cx0
    // Petal count varies per poem so the path reads as a mixed garden rather
    // than one shape recoloured. Derived from the poem id, so a given poem
    // always grows the same flower.
    const BLOOM = 34
    const petals = 4 + ([...p.mo.poemId].reduce((n, chr) => n + chr.charCodeAt(0), 0) % 3)
    const bloomWrap: CSSProperties = {
      position: 'absolute',
      left: (p.x - BLOOM / 2).toFixed(1) + 'px',
      top: (p.y - BLOOM / 2).toFixed(1) + 'px',
      filter: `drop-shadow(0 0 7px ${tintSoft}) drop-shadow(0 0 2px ${tint})`,
      animation: `hnBreathe ${(4.5 + (i % 4) * .6).toFixed(1)}s ease-in-out ${(i * .3).toFixed(1)}s infinite`,
    }
    const label: CSSProperties = {
      position: 'absolute', top: p.y, transform: 'translateY(-50%)', width: 116,
      display: 'flex', flexDirection: 'column', gap: 2,
      textAlign: toRight ? 'left' : 'right', pointerEvents: 'none',
      animation: `hnRise 1s ${(.2 + i * .1).toFixed(2)}s both`,
    }
    if (toRight) label.left = (p.x + 18).toFixed(1) + 'px'
    else label.right = (318 - p.x + 18).toFixed(1) + 'px'
    const note = (p.mo.note || '').trim()
    return {
      bloomWrap, rgb: poem.rgb, petals, label,
      date: `${p.mo.m}.${p.mo.d}`,
      title: `${poem.title} · ${poem.author}`,
      line: poem.lines[0],
      note: note ? `「${note}」` : '',
      copied: !!p.mo.copied,
      dateStyle: { font: `400 9px ${SONG}`, letterSpacing: '.14em', color: 'rgba(235,205,140,.72)' },
      titleStyle: { font: `500 13px ${SONG}`, color: '#f3eee4' },
      lineStyle: { font: `400 10.5px ${SONG}`, color: 'rgba(243,238,228,.55)', letterSpacing: '.04em', marginTop: 1 },
      noteStyle: { font: `italic 400 10px ${SONG}`, color: 'rgba(235,205,140,.6)', marginTop: 3 },
    }
  })
  return { d, H, nodes }
}
