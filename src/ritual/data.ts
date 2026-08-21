// 此时此地 · Here & Now — poem corpus + ritual constants.
// Ported verbatim from the design reference. Rule-based matching only (no AI):
// input text + chips are scored by keyword overlap; top 3 returned.

export interface Poem {
  title: string
  author: string
  dynasty: string
  lines: string[]
  meaning: string
  rgb: string   // the flower / glow tint for this poem
  kw: string[]  // keywords used for rule-based matching
  // ── 诗后有人 · the human behind the line ──
  // A poem lands because a specific person, in a specific situation, had to say
  // it. These three fields restore that. Kept to one sentence each: the poem
  // must still arrive first, this is the whisper after it.
  person: string   // 人 — who they were, that year
  scene: string    // 境 — what was actually happening
  echo: string     // 回声 — how the line travelled
  // Honesty rule (same discipline as the 印章 reliability seals): much poem
  // biography is tradition, not record. 'trad' = 相传/一说 — shown as a marker.
  srcConfidence: 'high' | 'trad'
}

export const POEMS: Record<string, Poem> = {
  jingye: {
    title: '静夜思', author: '李白', dynasty: '唐',
    lines: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    meaning: '月光如霜，千载共此一望。', rgb: '111,182,184',
    kw: ['想家了', '家', '看见月亮', '月', '夜', '思乡', '故乡'],
    person: '那一年，李白二十六岁，出蜀已两年。',
    scene: '客舍夜里醒来，月光落在地上，像霜。此后一生，他再未回过蜀中。',
    echo: '宋本原作「看月光」「望山月」——你从小背的这一版，是明人改的。',
    srcConfidence: 'trad',
  },
  jiangxue: {
    title: '江雪', author: '柳宗元', dynasty: '唐',
    lines: ['千山鸟飞绝', '万径人踪灭', '孤舟蓑笠翁', '独钓寒江雪'],
    meaning: '千山寂寂，独钓寒江。', rgb: '154,143,208',
    kw: ['一个人', '孤独', '独', '雪', '冬', '安静'],
    person: '那一年，柳宗元三十三岁，贬永州第一年。',
    scene: '革新失败，同党八人尽数外放。他在永州住了十年；母亲第一年就病故了。',
    echo: '四句首字连起来读——千、万、孤、独。',
    srcConfidence: 'high',
  },
  dingfengbo: {
    title: '定风波', author: '苏轼', dynasty: '宋',
    lines: ['莫听穿林打叶声', '何妨吟啸且徐行', '竹杖芒鞋轻胜马', '一蓑烟雨任平生'],
    meaning: '风雨由它，徐行自若。', rgb: '111,184,138',
    kw: ['窗外的雨', '雨', '风', '豁达', '烦'],
    person: '那一年，苏轼四十五岁，贬黄州第三年。',
    scene: '「三月七日，沙湖道中遇雨。雨具先去，同行皆狼狈，余独不觉。」',
    echo: '三年前，他因乌台诗案下狱，几乎被处死。',
    srcConfidence: 'high',
  },
  chunxiao: {
    title: '春晓', author: '孟浩然', dynasty: '唐',
    lines: ['春眠不觉晓', '处处闻啼鸟', '夜来风雨声', '花落知多少'],
    meaning: '一夜风雨，唤醒满地春意。', rgb: '224,150,170',
    kw: ['春', '鸟', '早晨', '花'],
    person: '孟浩然一生未入仕。四十岁赴长安应试，落第而归。',
    scene: '隐居鹿门山。一夜风雨，醒来满地落花。',
    echo: '读来是喜，落到末句才是惜——花落知多少。',
    srcConfidence: 'trad',
  },
  fengqiao: {
    title: '枫桥夜泊', author: '张继', dynasty: '唐',
    lines: ['月落乌啼霜满天', '江枫渔火对愁眠', '姑苏城外寒山寺', '夜半钟声到客船'],
    meaning: '客船夜泊，钟声入愁眠。', rgb: '127,166,216',
    kw: ['夜', '愁', '一个人', '江', '钟'],
    person: '安史之乱后，张继避乱南下，客舟夜泊姑苏城外。',
    scene: '一夜未眠。子夜钟声从寒山寺渡水而来。',
    echo: '一千二百年后，寒山寺除夕仍在撞钟，日本人专程渡海来听。',
    srcConfidence: 'trad',
  },
  shanju: {
    title: '山居秋暝', author: '王维', dynasty: '唐',
    lines: ['空山新雨后', '天气晚来秋', '明月松间照', '清泉石上流'],
    meaning: '雨后空山，清泉照月。', rgb: '111,184,138',
    kw: ['山', '雨', '月', '静', '秋'],
    person: '晚年的王维，在辋川半官半隐。妻子早亡，他独居三十年，未再娶。',
    scene: '秋雨初停的傍晚。空山无人，月光穿过松林，泉水流过石头。',
    echo: '苏轼说他「诗中有画，画中有诗」。',
    srcConfidence: 'high',
  },
  taicheng: {
    title: '台城', author: '韦庄', dynasty: '唐',
    lines: ['江雨霏霏江草齐', '六朝如梦鸟空啼', '无情最是台城柳', '依旧烟笼十里堤'],
    meaning: '台城，六朝故址，今在南京。', rgb: '176,156,216',
    kw: ['南京', '怀古', '六朝', '柳', '城'],
    person: '唐末的韦庄，亲历黄巢之乱，看着王朝走向尽头。',
    scene: '他站在六朝废墟上凭吊前朝——而他自己的王朝，正在重蹈覆辙。',
    echo: '十余年后，唐亡。',
    srcConfidence: 'high',
  },
  shuidiao: {
    title: '水调歌头', author: '苏轼', dynasty: '宋',
    lines: ['明月几时有', '把酒问青天', '但愿人长久', '千里共婵娟'],
    meaning: '千里之外，共一轮明月。', rgb: '232,184,106',
    kw: ['看见月亮', '月', '思念', '团圆', '中秋'],
    person: '那一年，苏轼四十岁，在密州。他与弟弟苏辙已七年未见。',
    scene: '「丙辰中秋，欢饮达旦，大醉，作此篇，兼怀子由。」',
    echo: '他曾请求调任密州，只为离弟弟近一些——终究还是没见上。',
    srcConfidence: 'high',
  },
  yeyu: {
    title: '夜雨寄北', author: '李商隐', dynasty: '唐',
    lines: ['君问归期未有期', '巴山夜雨涨秋池', '何当共剪西窗烛', '却话巴山夜雨时'],
    meaning: '夜雨涨池，思念如约。', rgb: '127,166,216',
    kw: ['窗外的雨', '雨', '夜', '思念', '想'],
    person: '李商隐困在巴蜀幕府，写信寄往北方。',
    scene: '秋雨涨满池塘。他想象将来某夜剪烛西窗，回头细说今夜这场雨。',
    echo: '一说这封信寄给妻子王氏——而她可能已经不在了。',
    srcConfidence: 'trad',
  },
  mujiang: {
    title: '暮江吟', author: '白居易', dynasty: '唐',
    lines: ['一道残阳铺水中', '半江瑟瑟半江红', '可怜九月初三夜', '露似珍珠月似弓'],
    meaning: '残阳铺水，月似弯弓。', rgb: '232,150,120',
    kw: ['江', '月', '黄昏', '傍晚'],
    person: '那一年，白居易五十一岁，自请离开长安，出任杭州刺史。',
    scene: '终于脱开朝中党争，一路向南，行至江边，天光正好。',
    echo: '这首诗的亮，是逃出来的人才写得出的亮。',
    srcConfidence: 'high',
  },
  xiangsi: {
    title: '相思', author: '王维', dynasty: '唐',
    lines: ['红豆生南国', '春来发几枝', '愿君多采撷', '此物最相思'],
    meaning: '红豆生于南国，以寄相思。', rgb: '224,112,154',
    kw: ['相思', '思念', '红豆', '想你', '喜欢'],
    person: '一说此诗又题《江上赠李龟年》——赠给开元第一乐师。',
    scene: '安史之乱后，李龟年流落江南，唱起这首歌，满座落泪。',
    echo: '杜甫也在江南遇见了他：「正是江南好风景，落花时节又逢君」。',
    srcConfidence: 'trad',
  },
  songyuaner: {
    title: '送元二使安西', author: '王维', dynasty: '唐',
    lines: ['渭城朝雨浥轻尘', '客舍青青柳色新', '劝君更尽一杯酒', '西出阳关无故人'],
    meaning: '渭城折柳，一杯离酒。', rgb: '127,166,216',
    kw: ['离别', '送别', '酒', '柳', '再见'],
    person: '元二奉命出使安西都护府——今新疆库车，去路数千里。',
    scene: '渭城清晨，雨刚停，柳色新。这一别，可能就是一生。',
    echo: '后谱为《阳关三叠》，唱了一千多年，成了中国人共同的告别。',
    srcConfidence: 'high',
  },
}

// ── 互文 · poems answering poems ────────────────────────────────────────
// Chinese poems are a conversation, not a shelf of separate objects: 苏轼 is
// literally re-asking 李白's question three centuries later. The corpus held
// four moon poems as unrelated keyword rows — this restores the thread.
// Keyed by poem id; `id` is set when the counterpart is also in the corpus.
export interface Kin {
  id?: string      // corpus key, when the answering poem is one of ours
  title: string
  author: string
  line: string
  relation: string
}

export const KIN: Record<string, Kin> = {
  jingye: {
    id: 'shuidiao', title: '水调歌头', author: '苏轼',
    line: '但愿人长久，千里共婵娟',
    relation: '同一轮月，三百年后落到苏轼笔下——李白低头思乡，他却把它写成了重逢。',
  },
  shuidiao: {
    title: '把酒问月', author: '李白',
    line: '青天有月来几时？我今停杯一问之',
    relation: '苏轼开篇的问句，是从李白那里借来的——隔着三百年，他接着往下问。',
  },
  jiangxue: {
    id: 'fengqiao', title: '枫桥夜泊', author: '张继',
    line: '江枫渔火对愁眠',
    relation: '同样是江上的寒夜——柳宗元独自垂钓，张继在船上等天亮。',
  },
  fengqiao: {
    id: 'jiangxue', title: '江雪', author: '柳宗元',
    line: '独钓寒江雪',
    relation: '同样是无人的寒夜——张继没能睡着，柳宗元把船停在了雪里。',
  },
  dingfengbo: {
    id: 'yeyu', title: '夜雨寄北', author: '李商隐',
    line: '君问归期未有期',
    relation: '同是雨里的人——李商隐困在巴山，等一个说不出的归期；苏轼没有等。',
  },
  yeyu: {
    id: 'dingfengbo', title: '定风波', author: '苏轼',
    line: '一蓑烟雨任平生',
    relation: '两百年后，另一个人也在路上遇了雨——他没有等它停。',
  },
  chunxiao: {
    id: 'xiangsi', title: '相思', author: '王维',
    line: '春来发几枝',
    relation: '同样在数春天——孟浩然数的是落了多少，王维数的是又发了几枝。',
  },
  xiangsi: {
    id: 'songyuaner', title: '送元二使安西', author: '王维',
    line: '劝君更尽一杯酒',
    relation: '王维写过两种惦念：一种寄在红豆里，一种斟在酒杯中。',
  },
  songyuaner: {
    id: 'shuidiao', title: '水调歌头', author: '苏轼',
    line: '但愿人长久，千里共婵娟',
    relation: '王维说，出了阳关就再无故人。三百年后苏轼答他：千里之外，仍共一轮月。',
  },
  shanju: {
    id: 'mujiang', title: '暮江吟', author: '白居易',
    line: '一道残阳铺水中',
    relation: '都是水边的日暮——王维看月光落进松林，白居易看残阳铺满江面。',
  },
  mujiang: {
    id: 'shanju', title: '山居秋暝', author: '王维',
    line: '明月松间照',
    relation: '同样是黄昏的水边——白居易送走残阳，王维等来了月亮。',
  },
  taicheng: {
    title: '乌衣巷', author: '刘禹锡',
    line: '旧时王谢堂前燕，飞入寻常百姓家',
    relation: '同样站在六朝故地——刘禹锡看见的，是飞进百姓家的那只燕子。',
  },
}

// 標語 · the app's spine, shown on the splash.
// 李白《把酒问月》— the same poem 苏轼 borrowed 「明月几时有？把酒问青天」 from,
// which is already the 隔世应答 recorded for 水调歌头 in KIN above. The corpus
// named this poem as its deepest source before it became the slogan.
export const SLOGAN = {
  title: '把酒问月',
  author: '李白',
  dynasty: '唐',
  lines: [
    '今人不见古时月',
    '今月曾经照古人',
    '古人今人若流水',
    '共看明月皆如此',
    '唯愿当歌对酒时',
    '月光长照金樽里',
  ],
}

export const DEFAULTS = ['jingye', 'shanju', 'dingfengbo']
export const CHIPS = ['南京', '想家了', '窗外的雨', '一个人', '看见月亮']

export interface IntroSlide { label: string; copy: string }
export const INTRO: IntroSlide[] = [
  { label: '此地', copy: '此地有诗。山河之间，曾有人把一瞬写成永恒。' },
  { label: '此景', copy: '此景有诗。一场雪，一阵雨，一轮月，都会唤醒一句诗。' },
  { label: '此情', copy: '此情有诗。孤独、思念、欢喜、告别，都曾被人写下。' },
  { label: '此时', copy: '此时有诗。有些诗，要等你走到某一天，才会真正读懂。' },
  { label: '开始', copy: '' },
]

// Rule-based matcher: score every poem by keyword hits in (text + chips),
// return the top 3 ids; pad with calm defaults when nothing matches.
export function matchPoems(text: string, tags: string[]): string[] {
  const hay = (text || '') + ' ' + (tags || []).join(' ')
  const scored = Object.keys(POEMS)
    .map(id => ({ id, score: POEMS[id].kw.reduce((n, k) => n + (hay.indexOf(k) >= 0 ? 1 : 0), 0) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
  if (!scored.length) return DEFAULTS.slice()
  const ids = scored.slice(0, 3).map(s => s.id)
  for (let i = 0; ids.length < 3 && i < DEFAULTS.length; i++) {
    if (ids.indexOf(DEFAULTS[i]) < 0) ids.push(DEFAULTS[i])
  }
  return ids
}

export interface Moment {
  id: string
  poemId: string
  createdAt: string
  inputText: string
  note: string
  m: number
  d: number
  copied?: boolean   // 抄过一遍 — the poem was hand-traced, not just kept
  place?: string     // 此地 — where you were
  photo?: string     // the small edition (see ritual/photo.ts), for re-sharing
}

const MOMENTS_KEY = 'hn-moments'
export function loadMoments(): Moment[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY)
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p }
  } catch { /* ignore */ }
  return []
}
/**
 * Photos push moments past the ~5MB localStorage budget quickly. Rather than
 * silently lose the whole path when the quota is hit, shed photos — newest
 * kept first — and only then give up. The words are what matter; the pictures
 * are recoverable losses.
 */
export function saveMoments(moments: Moment[]) {
  const write = (v: Moment[]) => localStorage.setItem(MOMENTS_KEY, JSON.stringify(v))
  try { write(moments); return } catch { /* probably QuotaExceededError */ }
  try { write(moments.map((mo, i) => (i === 0 ? mo : { ...mo, photo: undefined }))); return } catch { /* still too big */ }
  try { write(moments.map(mo => ({ ...mo, photo: undefined }))) } catch { /* give up quietly */ }
}

const SEEN_INTRO_KEY = 'hn-seen-intro'
export function seenIntro(): boolean {
  try { return localStorage.getItem(SEEN_INTRO_KEY) === '1' } catch { return false }
}
export function setSeenIntro() {
  try { localStorage.setItem(SEEN_INTRO_KEY, '1') } catch { /* ignore */ }
}

// ── 重逢 · the return ───────────────────────────────────────────────────
// 「有些诗，要等你走到某一天，才会真正读懂。」The intro promises this; nothing
// delivered it. A poem you planted long ago comes back — and it carries the
// words YOU wrote beside it. The moving part is not the poem, it is meeting
// your own past self. (inputText/note were stored and never used until now.)
//
// 崔护:「去年今日此门中，人面桃花相映红。」 — the ancestor of this feature.

export type ReunionKind = 'anniversary' | 'season' | 'old'

export interface Reunion {
  moment: Moment
  poem: Poem
  kind: ReunionKind
  phrase: string   // the time-sentence shown as the headline
  days: number
  words: string    // what the user wrote back then ('' if they wrote nothing)
}

// A reunion must have real distance behind it, or it is just a list item.
const REUNION_MIN_DAYS = 30
const REUNION_KEY = 'hn-reunion'

const NUM_ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const numZh = (n: number) => NUM_ZH[n] || String(n)

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000)
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

function seasonZh(month1to12: number): string {
  if (month1to12 === 12 || month1to12 <= 2) return '冬天'
  if (month1to12 <= 5) return '春天'
  if (month1to12 <= 8) return '夏天'
  return '秋天'
}

/**
 * Choose today's reunion, or null. At most one per calendar day — a gift that
 * arrives daily stops being a gift. Tiers, strongest first:
 *   anniversary 去年今日        — same day of year, a year or more later
 *   season      季节已经换过     — the season has turned since you planted it
 *   old         单纯的时间距离   — ≥30 days
 */
export function pickReunion(moments: Moment[], now: Date = new Date()): Reunion | null {
  if (!moments.length) return null
  try {
    const raw = localStorage.getItem(REUNION_KEY)
    if (raw) { const p = JSON.parse(raw); if (p && p.date === dayKey(now)) return null }
  } catch { /* ignore */ }

  const scored = moments
    .map(mo => ({ mo, then: new Date(mo.createdAt), days: daysBetween(new Date(mo.createdAt), now) }))
    .filter(c => c.days >= REUNION_MIN_DAYS && !!POEMS[c.mo.poemId] && !isNaN(c.days))
    .map(c => {
      const years = Math.round(c.days / 365)
      if (years >= 1 && Math.abs(c.days - years * 365) <= 4) {
        return { ...c, kind: 'anniversary' as ReunionKind, rank: 3,
          phrase: years === 1 ? '去年今日' : `${numZh(years)}年前的今天` }
      }
      const was = seasonZh(c.then.getMonth() + 1)
      if (was !== seasonZh(now.getMonth() + 1)) {
        return { ...c, kind: 'season' as ReunionKind, rank: 2, phrase: `你留下这首的时候，还是${was}` }
      }
      return { ...c, kind: 'old' as ReunionKind, rank: 1, phrase: `那天之后，已经过去 ${c.days} 天` }
    })
    .sort((a, b) => b.rank - a.rank || b.days - a.days)

  if (!scored.length) return null
  const p = scored[0]
  return {
    moment: p.mo, poem: POEMS[p.mo.poemId], kind: p.kind, phrase: p.phrase, days: p.days,
    words: (p.mo.note || p.mo.inputText || '').trim(),
  }
}

export function markReunionSeen(momentId: string, now: Date = new Date()) {
  try { localStorage.setItem(REUNION_KEY, JSON.stringify({ date: dayKey(now), id: momentId })) } catch { /* ignore */ }
}
