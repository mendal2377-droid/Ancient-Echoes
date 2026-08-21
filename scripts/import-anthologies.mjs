// PROVENANCE. Run once; its output is committed into src/ritual/data.ts.
//   npm i -D opencc-js
//   curl -o tang_meng.json https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/蒙学/tangshisanbaishou.json
//   curl -o song300.json   https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/宋词/宋词三百首.json
//
// Build corpus entries from 唐诗三百首 (蒙学 edition) + 宋词三百首.
//
// Nothing here authors poetry. The text is the anthologies' own, converted
// 繁→簡. rgb and kw are derived mechanically from the poem's own characters —
// indexing, not writing. meaning/person/scene/echo are left undefined: those
// are claims about history, and an unmade claim is the whole point.
//
// SOURCE CHOICE. The repo carries two 唐诗三百首. 全唐诗/唐诗三百首.json follows
// the Kangxi imperial text — scholarly, and wrong for this app: it reads
// 「床前看月光」「秋来发故枝」「两岸猨声啼不尽」. 蒙学/tangshisanbaishou.json is
// the primer lineage, which is the text people actually memorised. Recognition
// is what this app trades in, so the primer wins. (The variants are not lost —
// they are exactly the material 回声 exists for, later.)

import fs from 'node:fs'
import crypto from 'node:crypto'
import OpenCC from 'opencc-js'

const t2s = OpenCC.Converter({ from: 'tw', to: 'cn' })
const here = p => new URL(p, import.meta.url)

// 「(明年 一作：年年)」 — the editor's variant notes, not the poem.
const denote = s => s.replace(/[（(][^）)]*[）)]/g, '')
const clauses = s => denote(s).split(/[，。！？；]/).map(x => x.trim()).filter(Boolean)

const tang = []
for (const g of JSON.parse(fs.readFileSync(here('./tang_meng.json'), 'utf8')).content) {
  for (const c of g.content) {
    tang.push({
      title: t2s(c.chapter).trim(),
      // 「送别 / 山中送别」 — the other names this poem answers to. Free
      // resolution accuracy: the oracle may cite any of them.
      alias: c.subchapter ? t2s(c.subchapter).split(/[\/／]/).map(s => s.trim()).filter(Boolean) : [],
      author: t2s(c.author).trim(),
      dynasty: '唐',
      form: t2s(g.type),
      lines: clauses(t2s((c.paragraphs || []).join(''))),
    })
  }
}

const song = JSON.parse(fs.readFileSync(here('./song300.json'), 'utf8')).map(r => ({
  title: (r.rhythmic || '').trim(), alias: [], author: (r.author || '').trim(),
  dynasty: '宋', form: '词', lines: clauses(r.paragraphs.join('')),
}))

// A regulated form is a checksum the transcription must satisfy: 五言绝句 is
// four lines of five characters and nothing else. Anything failing its own
// declared form has lost or gained text and is dropped rather than shown.
const FORMS = { 五言绝句: [4, 5], 七言绝句: [4, 7], 五言律诗: [8, 5], 七言律诗: [8, 7] }

const TINTS = [
  [/[雪冰寒冬]/, '154,143,208'], [/[雨霖]/, '127,166,216'], [/月/, '232,184,106'],
  [/[春花柳]/, '224,150,170'], [/[秋霜枫菊]/, '232,150,120'], [/[别送离]/, '127,166,216'],
  [/[思忆恋]/, '224,112,154'], [/[山泉松竹]/, '111,184,138'], [/[江河湖海]/, '111,182,184'],
]
const MOTIFS = {
  月: ['月', '看见月亮'], 雨: ['雨', '窗外的雨'], 雪: ['雪', '冬'], 风: ['风'],
  春: ['春'], 秋: ['秋'], 花: ['花'], 山: ['山'], 江: ['江'], 酒: ['酒'],
  梦: ['梦'], 夜: ['夜'], 家: ['家', '想家了'], 独: ['一个人', '孤独'],
  愁: ['愁', '难过'], 思: ['思念', '想'], 别: ['离别', '送别', '再见'],
  云: ['云'], 鸟: ['鸟'], 舟: ['船'], 归: ['回家'], 客: ['漂泊', '在路上'],
}

export function build(skip = new Set()) {
  const out = []
  const seen = new Set()
  const dropped = { long: 0, dup: 0, already: 0, malformed: 0 }

  for (const p of [...tang, ...song]) {
    const key = p.title + '||' + p.author
    if (skip.has(key)) { dropped.already++; continue }
    if (seen.has(key)) { dropped.dup++; continue }
    // Each line becomes a vertical column on the card; past 8 it will not fit.
    if (p.lines.length < 2 || p.lines.length > 8) { dropped.long++; continue }
    const f = FORMS[p.form]
    if (f && (p.lines.length !== f[0] || !p.lines.every(l => l.length === f[1]))) { dropped.malformed++; continue }
    seen.add(key)

    const body = p.lines.join('')
    const rgb = (TINTS.find(([re]) => re.test(body)) ?? [null, '176,156,216'])[1]
    const kw = new Set()
    for (const [ch, words] of Object.entries(MOTIFS)) if (body.includes(ch)) words.forEach(w => kw.add(w))

    out.push({
      // Stable forever: a saved 花径 moment holds this id.
      id: 'p' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 7),
      title: p.title, alias: p.alias.filter(a => a && a !== p.title),
      author: p.author, dynasty: p.dynasty, lines: p.lines,
      rgb, kw: [...kw].slice(0, 8),
    })
  }
  return { out, dropped }
}

const esc = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
export function emit(entries) {
  return entries.map(e =>
    `  ${e.id}: {\n` +
    `    title: ${esc(e.title)}, author: ${esc(e.author)}, dynasty: ${esc(e.dynasty)},\n` +
    `    lines: [${e.lines.map(esc).join(', ')}],\n` +
    `    rgb: ${esc(e.rgb)},` +
    (e.kw.length ? ` kw: [${e.kw.map(esc).join(', ')}],` : '') +
    (e.alias.length ? ` alias: [${e.alias.map(esc).join(', ')}],` : '') + '\n' +
    `  },`
  ).join('\n')
}
