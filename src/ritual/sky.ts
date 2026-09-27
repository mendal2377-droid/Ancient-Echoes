// 天时 · what the sky is actually doing, right now, where the reader is.
//
// The slogan is 「今人不见古时月，今月曾经照古人」 — and until now the moon on
// the home screen was a fixed gradient, which quietly made that a decoration
// rather than a claim. Everything here is computed from the date so the claim
// is literally true: that is tonight's moon, and it is the one 李白 drank under.
//
// No API, no dependency. Solar longitude is Meeus' low-precision solar
// position (accurate to ~0.01°, i.e. about a quarter hour — far inside the
// resolution of "which 节气 is it"), and the moon is the mean synodic cycle,
// which drifts by at most a few hours against the true new moon. Both are
// well within what a person can tell by looking up.

const RAD = Math.PI / 180

/** Julian Day for an instant. */
function julian(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5
}

// ── 月相 ─────────────────────────────────────────────────────────────────
// Reference new moon: 2000-01-06 18:14 UTC. The synodic month is the average
// new-moon-to-new-moon period.
const NEW_MOON_JD = 2451550.26
const SYNODIC = 29.530588853

export type Moon = {
  phase: number       // 0 new → 0.5 full → 1 new again
  illum: number       // lit fraction, 0..1
  waxing: boolean     // lit limb on the right
  name: string        // 新月 / 蛾眉月 / 上弦月 / 盈凸月 / 满月 / 亏凸月 / 下弦月 / 残月
  isFull: boolean     // within a day of full — worth remarking on
}

export function moonOf(date = new Date()): Moon {
  const phase = (((julian(date) - NEW_MOON_JD) / SYNODIC) % 1 + 1) % 1
  const theta = 2 * Math.PI * phase
  const illum = (1 - Math.cos(theta)) / 2
  const waxing = phase < 0.5
  // one day either side of full, as a fraction of the cycle
  const isFull = Math.abs(phase - 0.5) < 1 / SYNODIC

  const NAMES = ['新月', '蛾眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']
  // eight equal arcs, centred on the named phases rather than starting at them
  const name = NAMES[Math.floor(((phase + 1 / 16) % 1) * 8)]

  return { phase, illum, waxing, name, isFull }
}

/**
 * SVG path for the LIT part of a moon of radius r, centred on (0,0).
 *
 * Outer edge is a semicircle on the lit limb; inner edge is the terminator,
 * a half-ellipse whose width is r·|cos θ|, bulging away from the lit side when
 * gibbous and into it when crescent — which is the whole reason a crescent
 * looks like a crescent.
 *
 * SVG's y axis points down, so sweep=1 is clockwise ON SCREEN. Going from the
 * bottom of the disc back to the top, clockwise passes down the LEFT side.
 * Getting that backwards makes both arcs curve the same way and the figure
 * collapses to a half-disc — which is what shipped, and which no amount of
 * checking the area FORMULA would have caught, because the formula was never
 * what was being drawn. Verify this with getBBox on a rendered path.
 */
export function moonPath(r: number, m: Moon): string {
  const a = r * Math.abs(Math.cos(2 * Math.PI * m.phase))
  const gibbous = m.illum > 0.5
  const outer = m.waxing ? 1 : 0          // lit limb: right when waxing
  const inner = m.waxing ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1)
  return `M 0 ${-r} A ${r} ${r} 0 0 ${outer} 0 ${r} A ${a} ${r} 0 0 ${inner} 0 ${-r} Z`
}

// ── 节气 ─────────────────────────────────────────────────────────────────
// 立春 sits at solar longitude 315°, and each term is 15° further on.
const TERMS = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
]

/** Apparent solar longitude in degrees. Meeus, Astronomical Algorithms §25. */
function solarLongitude(d: Date): number {
  const T = (julian(d) - 2451545) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M)
  const apparent = L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * RAD)
  return ((apparent % 360) + 360) % 360
}

const termIndex = (d: Date) => Math.floor((((solarLongitude(d) - 315) % 360) + 360) % 360 / 15)

// 节气 belong to the Chinese day, so the boundary is midnight UTC+8 wherever
// the reader happens to be.
const CN_MIDNIGHT = (d: Date, addDays = 0) => {
  const cn = new Date(d.getTime() + 8 * 3600000)
  return new Date(Date.UTC(cn.getUTCFullYear(), cn.getUTCMonth(), cn.getUTCDate() + addDays) - 8 * 3600000)
}

export type Term = {
  name: string        // the 节气 we are currently inside
  entersToday: boolean // today is its first day — the one worth naming
}

// A 节气 begins at an instant DURING a day — 春分 2026 falls in the evening of
// the 20th — and the whole day takes its name from it. So the day is read at
// its END, not its start; reading it at midnight reports yesterday's term for
// every single boundary day, which is the one day anybody would notice.
const CN_DAY_END = (d: Date, addDays = 0) => new Date(CN_MIDNIGHT(d, addDays + 1).getTime() - 1)

export function termOf(date = new Date()): Term {
  const i = termIndex(CN_DAY_END(date))
  return { name: TERMS[i], entersToday: termIndex(CN_DAY_END(date, -1)) !== i }
}

// ── 中秋 ──────────────────────────────────────────────────────────────────
// The 8th lunar month's full moon. Deriving it honestly needs the whole
// lunisolar calendar with its leap-month rule, which is a great deal of
// machinery for one night a year — so it is tabulated. Extend when it runs out
// rather than guessing: a wrong 中秋 is worse than a silent one.
const MID_AUTUMN = new Set([
  '2026-09-25', '2027-09-15', '2028-10-03', '2029-09-22', '2030-09-12',
  '2031-10-01', '2032-09-19', '2033-09-08', '2034-09-27', '2035-09-16',
])

export function isMidAutumn(date = new Date()): boolean {
  const cn = new Date(date.getTime() + 8 * 3600000)
  const k = `${cn.getUTCFullYear()}-${String(cn.getUTCMonth() + 1).padStart(2, '0')}-${String(cn.getUTCDate()).padStart(2, '0')}`
  return MID_AUTUMN.has(k)
}
