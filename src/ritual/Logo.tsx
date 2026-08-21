// 標 · the mark.
//
// Artwork supplied by the user (ancient_echoes_logo_dark / _light). Transcribed
// verbatim — the path data is theirs and should not be "improved". My earlier
// hand-built version is gone; this reads as a brush drawing, which it wasn't.
//
// From 李白《把酒问月》: 今人不见古时月，今月曾经照古人。
//   圆 an open brush arc, dry tail at the upper right
//   月 flat gold disc
//   山 a low ridge
//   江 the river, sweeping right then back out to the lower left
//   影 five gold lenses shrinking as they fall
//
// Two variants, same geometry:
//   dark  — ivory ink on the app's night ground (splash, chrome)
//   light — dark ink on paper (the poem screen, the share poster)
//
// No background rect here: the mark sits on whatever ground it is placed on.
// public/logo.svg and public/logo-light.svg carry a ground, for favicon use.

type Variant = 'dark' | 'light'

const PALETTE = {
  dark: {
    gold: ['#D9B777', '#C59B55'],
    ink: ['#E9E2D7', '#BDB6AD'],
    circleW: 13,
    hair: '#FFFFFF', hairO: 0.1,
    ridge: '#FFFFFF', ridgeO: 0.18,
    mountainO: 0.42,
    riverW: 10, riverO: 0.88,
    riverHair: '#FFFFFF', riverHairO: 0.18,
    riverShadow: null as null | { c: string; o: number; w: number },
  },
  light: {
    gold: ['#D6B374', '#B88D4D'],
    ink: ['#2A2521', '#4A433D'],
    circleW: 14,
    hair: '#7A726B', hairO: 0.22,
    ridge: '#A29B93', ridgeO: 0.32,
    mountainO: 0.78,
    riverW: 11, riverO: 0.9,
    riverHair: '#F9F6F0', riverHairO: 0.42,
    riverShadow: { c: '#413A35', o: 0.14, w: 3.5 },
  },
} satisfies Record<Variant, unknown>

// Shared geometry — identical across variants.
const D = {
  circle: 'M269 752 C 206 679, 177 588, 185 491 C 194 364, 259 257, 356 195 C 458 129, 598 123, 712 164 C 816 201, 891 278, 928 390',
  circleHair: 'M270 753 C 210 683, 183 592, 191 497 C 201 370, 264 264, 359 203 C 459 139, 595 135, 705 174 C 805 210, 878 286, 915 394',
  mountain: 'M467 428 C 535 418, 595 385, 659 328 C 685 305, 708 290, 731 298 C 748 304, 762 318, 775 337 C 792 360, 809 370, 831 360 C 852 349, 877 349, 901 364 C 855 370, 811 367, 760 357 C 707 346, 653 348, 594 362 C 546 373, 505 385, 467 428 Z',
  ridge: 'M467 426 C 551 425, 633 403, 709 321',
  river: 'M529 463 C 616 461, 683 468, 733 489 C 792 514, 807 557, 778 597 C 728 666, 632 677, 531 679 C 427 681, 349 698, 285 741',
  riverHair: 'M532 464 C 615 464, 676 470, 723 489 C 776 511, 790 550, 762 587 C 716 650, 626 661, 531 663 C 436 665, 362 680, 300 721',
  riverShadow: 'M527 462 C 619 461, 688 468, 744 491 C 807 517, 822 564, 790 606 C 737 679, 638 691, 530 693 C 421 695, 339 712, 271 757',
}

const REFLECTION: [string, number][] = [
  ['M460 814 C 512 809, 589 809, 664 814 C 589 826, 514 826, 460 814 Z', 0.92],
  ['M498 844 C 540 840, 592 840, 639 844 C 591 853, 541 853, 498 844 Z', 0.88],
  ['M523 872 C 555 868, 596 868, 629 872 C 595 880, 557 880, 523 872 Z', 0.84],
  ['M544 900 C 567 897, 589 897, 609 900 C 588 907, 567 907, 544 900 Z', 0.8],
  ['M563 927 C 576 924, 589 924, 600 927 C 589 932, 576 932, 563 927 Z', 0.76],
]

export default function Logo({ size = 96, variant = 'dark' }: { size?: number; variant?: Variant }) {
  const p = PALETTE[variant]
  // Gradient ids are document-global — namespace them so a light and a dark
  // mark can coexist on the same screen without one stealing the other's fill.
  const gid = `ae-gold-${variant}`
  const iid = `ae-ink-${variant}`

  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none" aria-label="此时此地" role="img">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.gold[0]} />
          <stop offset="100%" stopColor={p.gold[1]} />
        </linearGradient>
        <linearGradient id={iid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.ink[0]} />
          <stop offset="100%" stopColor={p.ink[1]} />
        </linearGradient>
      </defs>

      {/* 圆 */}
      <path d={D.circle} stroke={`url(#${iid})`} strokeWidth={p.circleW} strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d={D.circleHair} stroke={p.hair} strokeWidth={variant === 'light' ? 3.2 : 2.8} strokeLinecap="round" strokeLinejoin="round" opacity={p.hairO} />

      {/* 月 */}
      <circle cx="388" cy="276" r="53" fill={`url(#${gid})`} />

      {/* 山 */}
      <path d={D.mountain} fill={`url(#${iid})`} opacity={p.mountainO} />
      <path d={D.ridge} stroke={p.ridge} strokeWidth={variant === 'light' ? 2.4 : 2.2} strokeLinecap="round" opacity={p.ridgeO} />

      {/* 江 */}
      <path d={D.river} stroke={`url(#${iid})`} strokeWidth={p.riverW} strokeLinecap="round" strokeLinejoin="round" opacity={p.riverO} />
      <path d={D.riverHair} stroke={p.riverHair} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={p.riverHairO} />
      {p.riverShadow && (
        <path d={D.riverShadow} stroke={p.riverShadow.c} strokeWidth={p.riverShadow.w} strokeLinecap="round" strokeLinejoin="round" opacity={p.riverShadow.o} />
      )}

      {/* 影 */}
      {REFLECTION.map(([d, o]) => (
        <path key={d} d={d} fill={`url(#${gid})`} opacity={o} />
      ))}
    </svg>
  )
}
