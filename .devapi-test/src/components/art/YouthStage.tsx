'use client';

/**
 * "This stage is yours": a microphone in a spotlight, its sound spreading in
 * rings like ripples on the lake, with bubbles for the youth stage (slams,
 * rap, open mics, reels). Decorative.
 */
interface Props {
  className?: string;
}

const W = 520;
const H = 400;
const bubbles = [
  { x: 292, y: 70, w: 92, label: 'SLAM!', bg: '#e7ef92', fg: '#101b46', tail: 'left', d: 0 },
  { x: 372, y: 142, w: 118, label: 'OPEN MIC', bg: '#fffdf4', fg: '#152f81', tail: 'left', d: -1.6 },
  { x: 318, y: 214, w: 78, label: 'RAP', bg: '#ff8870', fg: '#101b46', tail: 'left', d: -3.1 },
  { x: 40, y: 92, w: 96, label: 'POETRY', bg: '#2447ed', fg: '#ffffff', tail: 'right', d: -2.2 },
];

export function YouthStage({ className = '' }: Props) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const dust = Array.from({ length: 16 }, () => ({ x: 150 + rnd() * 150, y: 40 + rnd() * 260, r: 0.8 + rnd() * 1.4, d: -(rnd() * 6).toFixed(2) }));

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={['youth-art block h-auto w-full', className].filter(Boolean).join(' ')}
        role="img"
        aria-label="A microphone in a spotlight, sending out rings of sound, with speech bubbles for slams, rap, open mics and poetry."
      >
        <defs>
          <linearGradient id="ys-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101b46" />
            <stop offset="1" stopColor="#1b2f86" />
          </linearGradient>
          <linearGradient id="ys-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf4" stopOpacity="0.38" />
            <stop offset="1" stopColor="#fffdf4" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id="ys-pool">
            <stop offset="0" stopColor="#e7ef92" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e7ef92" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ys-head" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eef1fb" />
            <stop offset="1" stopColor="#9aa8d6" />
          </linearGradient>
          <linearGradient id="ys-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2447ed" />
            <stop offset="1" stopColor="#152f81" />
          </linearGradient>
          <clipPath id="ys-grille">
            <circle cx="0" cy="0" r="30" />
          </clipPath>
          <filter id="ys-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#ys-bg)" />
        {/* spotlight */}
        <path d="M196 0H258L352 352H104Z" fill="url(#ys-beam)" filter="url(#ys-soft)" />
        <ellipse cx="228" cy="352" rx="150" ry="26" fill="url(#ys-pool)" />
        {dust.map((p, i) => (
          <circle key={i} className="ys-dust" cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(2)} fill="#fffdf4" style={{ animationDelay: `${p.d}s` }} />
        ))}

        {/* the stage floor and footlights */}
        <rect y="352" width={W} height={H - 352} fill="#0b1438" />
        <line x1="0" x2={W} y1="352" y2="352" stroke="#e7ef92" strokeOpacity="0.35" />
        <g fill="#e7ef92">
          {Array.from({ length: 13 }, (_, i) => (
            <circle key={i} className="ys-foot" cx={20 + i * 40} cy="366" r="2.6" style={{ animationDelay: `${-(i * 0.27).toFixed(2)}s` }} />
          ))}
        </g>

        {/* sound, spreading like ripples */}
        <g fill="none" stroke="#e7ef92" strokeLinecap="round">
          {[0, -1.2, -2.4].map((d) => (
            <path key={d} className="ys-wave" d="M262 96a64 64 0 0 1 0 90" strokeWidth="3" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>

        {/* the microphone on its stand */}
        <g stroke="#0a1233" strokeLinecap="round">
          <line x1="228" y1="190" x2="228" y2="340" strokeWidth="6" />
          <line x1="228" y1="340" x2="196" y2="354" strokeWidth="5" />
          <line x1="228" y1="340" x2="260" y2="354" strokeWidth="5" />
          <line x1="228" y1="340" x2="228" y2="356" strokeWidth="5" />
        </g>
        <g transform="translate(228 132) rotate(-14)">
          <path d="M-15 26H15L10 92Q0 100 -10 92Z" fill="url(#ys-body)" />
          <rect x="-17" y="24" width="34" height="9" rx="3" fill="#0a1233" />
          <circle r="30" fill="url(#ys-head)" />
          <g clipPath="url(#ys-grille)" stroke="#5e6ea8" strokeOpacity="0.55" strokeWidth="1.2">
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`v${i}`} x1={-30 + i * 6} y1="-30" x2={-30 + i * 6} y2="30" />
            ))}
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`h${i}`} x1="-30" y1={-30 + i * 6} x2="30" y2={-30 + i * 6} />
            ))}
          </g>
          <circle r="30" fill="none" stroke="#fffdf4" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M-18 -18a24 24 0 0 1 16 -8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9" />
        </g>

        {/* the youth stage, in speech bubbles */}
        {bubbles.map((b, i) => (
          <g key={i} className="ys-bubble" style={{ animationDelay: `${b.d}s` }}>
            <rect x={b.x} y={b.y} width={b.w} height="38" rx="19" fill={b.bg} />
            <path d={b.tail === 'left' ? `M${b.x + 14} ${b.y + 30}l-12 16l22-10z` : `M${b.x + b.w - 14} ${b.y + 30}l12 16l-22-10z`} fill={b.bg} />
            <text x={b.x + b.w / 2} y={b.y + 24.5} textAnchor="middle" fontSize="13" fontWeight="800" letterSpacing="0.08em" fill={b.fg} fontFamily="Plus Jakarta Sans, system-ui, sans-serif">
              {b.label}
            </text>
          </g>
        ))}

        {/* a phone recording a reel */}
        <g className="ys-bubble" style={{ animationDelay: '-0.8s' }} transform="rotate(8 430 292)">
          <rect x="394" y="232" width="72" height="120" rx="12" fill="#0a1233" />
          <rect x="400" y="240" width="60" height="104" rx="7" fill="#2447ed" />
          <path d="M422 276v32l26-16z" fill="#fffdf4" />
          <path d="M446 324c-4-5-12-2-9 4l9 8 9-8c3-6-5-9-9-4z" fill="#ff8870" />
          <text x="430" y="258" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="0.12em" fill="#e7ef92" fontFamily="Plus Jakarta Sans, system-ui, sans-serif">
            REELS
          </text>
        </g>

        {/* notes and sparkles */}
        <g fill="#ff8870">
          <path className="ys-float" style={{ animationDelay: '-1s' }} d="M92 214a7 5 -20 1 0 10 2V178l20 -5v28a7 5 -20 1 0 4 2V164l-28 7z" />
        </g>
        <g fill="#e7ef92">
          <path className="ys-twinkle" d="M150 44l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          <path className="ys-twinkle" style={{ animationDelay: '-1.5s' }} d="M478 70l1.6 4.8 4.8 1.6-4.8 1.6-1.6 4.8-1.6-4.8-4.8-1.6 4.8-1.6z" />
          <path className="ys-twinkle" style={{ animationDelay: '-2.4s' }} d="M60 300l1.6 4.8 4.8 1.6-4.8 1.6-1.6 4.8-1.6-4.8-4.8-1.6 4.8-1.6z" />
        </g>
      </svg>

      <style jsx global>{`
        .ys-wave {
          transform-box: view-box;
          transform-origin: 232px 141px;
          opacity: 0;
          animation: ys-wave 3.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .ys-bubble {
          transform-box: fill-box;
          animation: ys-bob 5s ease-in-out infinite;
        }
        .ys-float {
          transform-box: fill-box;
          animation: ys-bob 6s ease-in-out infinite;
        }
        .ys-dust {
          animation: ys-dust 7s ease-in-out infinite;
        }
        .ys-twinkle,
        .ys-foot {
          animation: ys-twinkle 3.2s ease-in-out infinite;
        }
        @keyframes ys-wave {
          0% {
            transform: scale(0.55);
            opacity: 0.95;
          }
          100% {
            transform: scale(2.1);
            opacity: 0;
          }
        }
        @keyframes ys-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes ys-dust {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(6px, -14px);
            opacity: 0.8;
          }
        }
        @keyframes ys-twinkle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ys-wave,
          .ys-bubble,
          .ys-float,
          .ys-dust,
          .ys-twinkle,
          .ys-foot {
            animation: none;
          }
          .ys-wave {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
