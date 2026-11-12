'use client';

/**
 * Five days by the lake: five paper boats, folded from book pages, one for
 * each day of the festival (31, 01, 02, 03, 04), drifting toward you across
 * Ashtamudi. They bob gently; rings spread around them. Decorative.
 */
interface Props {
  className?: string;
}

const W = 480;
const H = 360;
const WATER = 150;
// Far to near: the first day furthest away, the last one closest.
const boats = [
  { x: 318, y: 176, s: 0.46, day: '31', flag: '#ff8870', d: 0 },
  { x: 176, y: 196, s: 0.56, day: '01', flag: '#2447ed', d: -1.4 },
  { x: 322, y: 224, s: 0.68, day: '02', flag: '#8a3fd1', d: -2.6 },
  { x: 150, y: 262, s: 0.82, day: '03', flag: '#c6d23c', d: -0.8 },
  { x: 318, y: 306, s: 1, day: '04', flag: '#ff8870', d: -3.2 },
];
const shimmer = [
  [40, 170, 60],
  [390, 186, 50],
  [70, 214, 44],
  [236, 244, 70],
  [400, 262, 40],
  [36, 300, 80],
  [196, 332, 56],
  [420, 340, 44],
];

export function PaperBoats({ className = '' }: Props) {
  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={['boats-art block h-auto w-full', className].filter(Boolean).join(' ')}
        role="img"
        aria-label="Five paper boats folded from book pages, one for each festival day, floating on the lake."
      >
        <defs>
          <linearGradient id="pb-sky" x1="0" y1="0" x2="0" y2={WATER} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fffdf4" />
            <stop offset="1" stopColor="#f3ecdf" />
          </linearGradient>
          <linearGradient id="pb-water" x1="0" y1={WATER} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d6e0f7" />
            <stop offset="1" stopColor="#a9bced" />
          </linearGradient>
          <radialGradient id="pb-sun">
            <stop offset="0" stopColor="#ff8870" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ff8870" stopOpacity="0" />
          </radialGradient>
          <g id="pb-boat">
            {/* the shadow on the water */}
            <ellipse cx="0" cy="30" rx="58" ry="6" fill="#6f86d6" fillOpacity="0.35" />
            {/* hull */}
            <path d="M-62 0H62L44 25H-44Z" fill="#fffdf4" />
            <path d="M0 0H62L44 25H0Z" fill="#e6ebf8" />
            <path d="M-62 0H62L57 6H-57Z" fill="#cfd8f2" />
            {/* printed lines: the boat was a page */}
            <g stroke="#152f81" strokeOpacity="0.18" strokeWidth="1.4">
              <line x1="-52" x2="-22" y1="10" y2="10" />
              <line x1="-48" x2="-24" y1="15" y2="15" />
              <line x1="22" x2="50" y1="10" y2="10" />
              <line x1="24" x2="46" y1="15" y2="15" />
            </g>
            {/* sail */}
            <path d="M-32 0L0 -52L0 0Z" fill="#ffffff" />
            <path d="M0 0L0 -52L32 0Z" fill="#dde4f5" />
            <g stroke="#152f81" strokeOpacity="0.16" strokeWidth="1.2">
              <line x1="-20" x2="-6" y1="-14" y2="-14" />
              <line x1="-16" x2="-6" y1="-22" y2="-22" />
              <line x1="-12" x2="-6" y1="-30" y2="-30" />
            </g>
            {/* mast */}
            <line x1="0" y1="-52" x2="0" y2="-70" stroke="#152f81" strokeWidth="1.6" />
          </g>
        </defs>

        <rect width={W} height={WATER} fill="url(#pb-sky)" />
        <circle cx="392" cy="92" r="70" fill="url(#pb-sun)" />
        <circle cx="392" cy="92" r="24" fill="#ff8870" />
        {/* far shore */}
        <path d={`M0 ${WATER} L0 128 C40 118 70 124 104 120 C150 114 170 126 214 122 C260 118 290 108 330 114 C380 122 420 112 480 118 L480 ${WATER}Z`} fill="#b9c8ef" />
        <g fill="#9fb2e6">
          <path d="M44 124c1-10 1-18 0-26h2c1 8 1 16 0 26zM45 98c-5-4-12-4-16-1 5 0 11 1 16 3zm0 0c-2-5-8-8-14-7 5 1 10 4 14 7zm0 0c4-4 10-6 15-4-5 0-10 2-15 4zm0 0c5-1 11 1 14 5-4-2-9-3-14-5z" />
          <path d="M430 116c1-12 1-22 0-32h2c1 10 1 20 0 32zM431 84c-6-5-14-5-19-1 6 0 13 1 19 3zm0 0c-3-6-9-9-16-8 6 1 12 4 16 8zm0 0c4-5 11-7 18-5-6 0-12 2-18 5zm0 0c6-1 13 1 16 6-5-3-10-4-16-6z" />
          <path d="M452 118c1-9 1-17 0-24h2c1 7 1 15 0 24zM453 94c-4-4-10-4-14-1 4 0 9 1 14 3zm0 0c3-4 8-5 13-4-4 0-9 2-13 4z" />
        </g>
        <rect y={WATER} width={W} height={H - WATER} fill="url(#pb-water)" />
        <line x1="0" x2={W} y1={WATER} y2={WATER} stroke="#fffdf4" strokeWidth="2" />
        {/* the sun's path on the water */}
        <g fill="#ff8870" fillOpacity="0.45">
          <rect x="370" y="160" width="44" height="3" rx="1.5" />
          <rect x="376" y="172" width="32" height="3" rx="1.5" />
          <rect x="381" y="184" width="22" height="3" rx="1.5" />
        </g>
        <g stroke="#fffdf4" strokeLinecap="round" strokeWidth="2" strokeOpacity="0.85">
          {shimmer.map(([x, y, w], i) => (
            <line key={i} x1={x} x2={x + w} y1={y} y2={y} />
          ))}
        </g>

        {boats.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <ellipse className="pb-ring" cx="0" cy="28" rx="70" ry="9" fill="none" stroke="#fffdf4" strokeWidth="2" style={{ animationDelay: `${b.d}s` }} />
            <g className="pb-bob" style={{ animationDelay: `${b.d}s`, animationDuration: `${4.6 + b.s * 1.6}s` }}>
              <use href="#pb-boat" />
              <path d="M0 -70L20 -65L0 -59Z" fill={b.flag} />
              <text x="0" y="19" textAnchor="middle" fontSize="15" fontWeight="800" fill="#152f81" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" letterSpacing="-0.02em">
                {b.day}
              </text>
            </g>
          </g>
        ))}
      </svg>

      <style jsx global>{`
        .pb-bob {
          transform-box: fill-box;
          transform-origin: 50% 90%;
          animation: pb-bob 5s ease-in-out infinite;
        }
        .pb-ring {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          opacity: 0;
          animation: pb-ring 5.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        @keyframes pb-bob {
          0%,
          100% {
            transform: translateY(0) rotate(-1.8deg);
          }
          50% {
            transform: translateY(3px) rotate(1.6deg);
          }
        }
        @keyframes pb-ring {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .pb-bob {
            animation: none;
          }
          .pb-ring {
            animation: none;
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
