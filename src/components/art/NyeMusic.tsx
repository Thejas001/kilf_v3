'use client';

import { Fragment } from 'react';

/**
 * New Year's Eve, drawn as a night of music on Ashtamudi: the horizon is a
 * live sound equaliser with palms standing in it, the moon is a spinning
 * record, the lake mirrors it all, sound spreads over the water in rings and
 * notes drift up past the stars. The crowd watches from the shore.
 * Decorative (the section says it in words). Loops are CSS, so the page's
 * "Pause motion" and the reduced-motion setting stop them.
 */
interface Props {
  className?: string;
}

export function NyeMusic({ className = '' }: Props) {
  // A small seeded random, so the drawing is the same on every build.
  let seed = 20261231;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const W = 640;
  const H = 600;
  const HORIZON = 372;

  const stars = Array.from({ length: 38 }, () => ({
    x: 8 + rnd() * (W - 16),
    y: 8 + rnd() * (HORIZON - 150),
    r: 0.6 + rnd() * 1.3,
    twinkle: rnd() < 0.6,
    d: -(rnd() * 4).toFixed(2),
  }));

  // The equaliser skyline: taller in the middle, like a song at its height.
  const BARS = 34;
  const bw = 11;
  const gap = (W - BARS * bw) / (BARS - 1);
  const bars = Array.from({ length: BARS }, (_, i) => {
    const t = i / (BARS - 1);
    const env = 0.3 + 0.7 * Math.pow(Math.sin(Math.PI * t), 1.4);
    const h = Math.max(14, (26 + 118 * env) * (0.55 + 0.45 * rnd()));
    return { x: i * (bw + gap), h, dur: (0.9 + rnd() * 0.8).toFixed(2), d: -(rnd() * 2).toFixed(2) };
  });

  // Palms: a curved trunk and a crown of drooping fronds.
  function palm(x: number, base: number, h: number, lean: number) {
    const cx = x + lean;
    const cy = base - h;
    const trunk = `M${x} ${base} Q${x + lean * 0.1} ${base - h * 0.55} ${cx} ${cy}`;
    const L = h * 0.36;
    const leaves = [192, 218, 246, 272, 298, 326, 352, 18, 164].map((deg) => {
      const a = (deg * Math.PI) / 180;
      const droop = Math.abs(Math.cos(a)) * L * 0.42;
      const tx = cx + Math.cos(a) * L;
      const ty = cy + Math.sin(a) * L + droop;
      const mx = (cx + tx) / 2;
      const my = (cy + ty) / 2;
      const len = Math.hypot(tx - cx, ty - cy);
      const nx = -(ty - cy) / len;
      const ny = (tx - cx) / len;
      const s = ny < 0 ? 1 : -1;
      const w = L * 0.22;
      return `M${cx} ${cy}Q${(mx + nx * w * s).toFixed(1)} ${(my + ny * w * s - L * 0.14).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(mx - nx * w * 0.25 * s).toFixed(1)} ${(my - ny * w * 0.25 * s - L * 0.04).toFixed(1)} ${cx} ${cy}Z`;
    });
    return { trunk, leaves: leaves.join('') };
  }
  const palms = [palm(54, HORIZON, 150, 12), palm(566, HORIZON, 178, -16), palm(612, HORIZON, 126, 8)];

  // The crowd on the shore, a row of heads and shoulders; a few hands up.
  const crowd = Array.from({ length: 24 }, (_, i) => {
    const x = -6 + i * 28 + rnd() * 10;
    const r = 9 + rnd() * 3.5;
    const y = H - 36 + rnd() * 10;
    return { x, r, y };
  });
  const hands = [crowd[4], crowd[11], crowd[18]].map((p, i) => ({ x: p.x + (i % 2 ? 10 : -8), y: p.y - 44 - i * 4, from: p }));

  const reflection = Array.from({ length: 12 }, (_, i) => ({
    y: HORIZON + 22 + i * 13,
    w: 70 - i * 4.2,
    d: -(i * 0.35).toFixed(2),
  }));
  const notes = [
    { x: 150, y: 300, kind: 'one', c: '#e7ef92', d: 0 },
    { x: 268, y: 250, kind: 'two', c: '#ffc3a0', d: -2.3 },
    { x: 396, y: 296, kind: 'one', c: '#ffffff', d: -4.6 },
    { x: 520, y: 244, kind: 'two', c: '#e7ef92', d: -1.2 },
  ];

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className={['nye-art block h-auto w-full', className].filter(Boolean).join(' ')} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="nye-sky" x1="0" y1="0" x2="0" y2={HORIZON} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#060a2c" />
            <stop offset="0.5" stopColor="#101858" />
            <stop offset="0.82" stopColor="#2a2172" />
            <stop offset="1" stopColor="#4b2c88" />
          </linearGradient>
          <linearGradient id="nye-water" x1="0" y1={HORIZON} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1b1f68" />
            <stop offset="1" stopColor="#060a2c" />
          </linearGradient>
          <linearGradient id="nye-bar" x1="0" y1={HORIZON - 150} x2="0" y2={HORIZON} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e7ef92" />
            <stop offset="0.45" stopColor="#ffb49c" />
            <stop offset="1" stopColor="#6d6cf2" />
          </linearGradient>
          <radialGradient id="nye-phone">
            <stop offset="0" stopColor="#e7ef92" stopOpacity="0.55" />
            <stop offset="1" stopColor="#e7ef92" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nye-glow">
            <stop offset="0" stopColor="#ff9a82" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff9a82" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nye-disc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe3d4" />
            <stop offset="1" stopColor="#ff8870" />
          </linearGradient>
          <linearGradient id="nye-fade" x1="0" y1={HORIZON} x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="nye-mirror" maskUnits="userSpaceOnUse" x="0" y={HORIZON} width={W} height={H - HORIZON}>
            <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#nye-fade)" />
          </mask>
          <g id="note-one">
            <ellipse cx="0" cy="0" rx="6.5" ry="4.6" transform="rotate(-22)" />
            <rect x="4.6" y="-28" width="2" height="28" />
            <path d="M6.6 -28c9 4 11 11 6 19c0-7-2-10-6-12z" />
          </g>
          <g id="note-two">
            <ellipse cx="0" cy="0" rx="6.5" ry="4.6" transform="rotate(-22)" />
            <ellipse cx="22" cy="-4" rx="6.5" ry="4.6" transform="rotate(-22 22 -4)" />
            <rect x="4.6" y="-28" width="2" height="28" />
            <rect x="26.6" y="-32" width="2" height="28" />
            <path d="M4.6 -28L28.6 -32v5L4.6 -23z" />
          </g>
        </defs>

        {/* Night sky */}
        <rect width={W} height={HORIZON} fill="url(#nye-sky)" />
        {stars.map((s, i) => (
          <circle key={i} className={s.twinkle ? 'nye-tw' : undefined} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill="#fff" style={{ animationDelay: `${s.d}s` }} />
        ))}

        {/* The moon is a record, turning */}
        <circle cx="452" cy="150" r="176" fill="url(#nye-glow)" />
        <circle cx="452" cy="150" r="86" fill="url(#nye-disc)" />
        <g fill="none" stroke="#a3391f" strokeOpacity="0.16">
          <circle cx="452" cy="150" r="76" />
          <circle cx="452" cy="150" r="67" />
          <circle cx="452" cy="150" r="58" />
          <circle cx="452" cy="150" r="49" />
          <circle cx="452" cy="150" r="40" />
        </g>
        <path className="nye-glint" d="M452 80a70 70 0 0 1 56 28" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="452" cy="150" r="25" fill="#101b46" />
        <text x="452" y="154" textAnchor="middle" fill="#e7ef92" fontSize="11" fontWeight="700" letterSpacing="1.5" fontFamily="Plus Jakarta Sans, system-ui, sans-serif">
          2027
        </text>
        <circle cx="452" cy="163" r="2" fill="#ffe3d4" />

        {/* Sparkles near the moon */}
        <g fill="#fff">
          <path className="nye-tw" style={{ animationDelay: '-1.2s' }} d="M330 96l2.2 6.8 6.8 2.2-6.8 2.2-2.2 6.8-2.2-6.8-6.8-2.2 6.8-2.2z" />
          <path className="nye-tw" style={{ animationDelay: '-2.6s' }} d="M580 262l1.6 5 5 1.6-5 1.6-1.6 5-1.6-5-5-1.6 5-1.6z" />
          <path className="nye-tw" style={{ animationDelay: '-0.4s' }} d="M226 188l1.4 4.4 4.4 1.4-4.4 1.4-1.4 4.4-1.4-4.4-4.4-1.4 4.4-1.4z" />
        </g>

        {/* Notes rising from the music */}
        {notes.map((n, i) => (
          <use key={i} href={`#note-${n.kind}`} className="nye-note" x={n.x} y={n.y} fill={n.c} style={{ animationDelay: `${n.d}s` }} />
        ))}

        {/* The skyline plays */}
        <g id="nye-bars">
          {bars.map((b, i) => (
            <rect
              key={i}
              className="nye-eq"
              x={b.x.toFixed(1)}
              y={(HORIZON - b.h).toFixed(1)}
              width={bw}
              height={b.h.toFixed(1)}
              rx="2"
              fill="url(#nye-bar)"
              style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.d}s` }}
            />
          ))}
        </g>
        <g id="nye-palms" fill="#070a33" stroke="#070a33">
          {palms.map((p, i) => (
            <g key={i}>
              <path d={p.trunk} fill="none" strokeWidth="5" strokeLinecap="round" />
              <path d={p.leaves} stroke="none" />
            </g>
          ))}
        </g>

        {/* The lake, and everything mirrored in it */}
        <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#nye-water)" />
        <g mask="url(#nye-mirror)" opacity="0.55">
          <g transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`}>
            <use href="#nye-bars" />
            <use href="#nye-palms" />
          </g>
        </g>
        {/* Breaks in the reflection: the water moving */}
        <g stroke="#141a5e" strokeWidth="2.2">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="0" x2={W} y1={HORIZON + 6 + i * 8.5} y2={HORIZON + 6 + i * 8.5} strokeOpacity={(0.9 - i * 0.03).toFixed(2)} />
          ))}
        </g>
        <line x1="0" x2={W} y1={HORIZON} y2={HORIZON} stroke="#ffc3a0" strokeOpacity="0.55" />
        {/* The moon's path on the water */}
        <g fill="#ffc3a0">
          {reflection.map((r, i) => (
            <rect key={i} className="nye-shimmer" x={(452 - r.w / 2).toFixed(1)} y={r.y} width={r.w.toFixed(1)} height="2.4" rx="1.2" style={{ animationDelay: `${r.d}s` }} />
          ))}
        </g>
        {/* Sound spreading over the water */}
        <g fill="none" stroke="#e7ef92">
          {[0, -2, -4].map((d) => (
            <ellipse key={d} className="nye-ring" cx="300" cy="470" rx="120" ry="18" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>

        {/* The crowd on the shore */}
        <g fill="#03061f">
          {crowd.map((p, i) => (
            <Fragment key={i}>
              <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(1)} />
              <rect x={(p.x - p.r * 1.7).toFixed(1)} y={(p.y + p.r * 0.7).toFixed(1)} width={(p.r * 3.4).toFixed(1)} height="40" rx={(p.r * 1.4).toFixed(1)} />
            </Fragment>
          ))}
          {hands.map((h, i) => (
            <Fragment key={i}>
              <path
                d={`M${h.from.x.toFixed(1)} ${(h.from.y + 14).toFixed(1)} Q${((h.from.x + h.x) / 2 + 4).toFixed(1)} ${((h.from.y + h.y) / 2).toFixed(1)} ${h.x.toFixed(1)} ${(h.y + 6).toFixed(1)}`}
                fill="none"
                stroke="#03061f"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx={h.x.toFixed(1)} cy={(h.y + 4).toFixed(1)} r="5.5" />
            </Fragment>
          ))}
        </g>
        {/* A phone light held up */}
        <circle cx={hands[1].x} cy={hands[1].y - 5} r="22" fill="url(#nye-phone)" />
        <rect className="nye-tw" x={hands[1].x - 3.5} y={hands[1].y - 11} width="7" height="11" rx="1.5" fill="#f4f8c8" />
      </svg>

      <style jsx global>{`
        .nye-art .nye-eq {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: nye-eq 1.2s ease-in-out infinite alternate;
        }
        .nye-art .nye-tw {
          animation: nye-twinkle 3.6s ease-in-out infinite;
        }
        .nye-glint {
          transform-origin: 452px 150px;
          animation: nye-spin 9s linear infinite;
        }
        .nye-note {
          animation: nye-rise 7s ease-in-out infinite;
          opacity: 0.85;
        }
        .nye-shimmer {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: nye-shimmer 2.8s ease-in-out infinite alternate;
        }
        .nye-ring {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          vector-effect: non-scaling-stroke;
          stroke-width: 1.3;
          opacity: 0;
          animation: nye-ring 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        @keyframes nye-eq {
          from {
            transform: scaleY(0.38);
          }
          to {
            transform: scaleY(1);
          }
        }
        @keyframes nye-twinkle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
        @keyframes nye-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes nye-rise {
          0% {
            transform: translate(0, 30px);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          60% {
            transform: translate(8px, -60px);
            opacity: 0.75;
          }
          100% {
            transform: translate(-4px, -150px);
            opacity: 0;
          }
        }
        @keyframes nye-shimmer {
          from {
            transform: scaleX(0.7);
            opacity: 0.35;
          }
          to {
            transform: scaleX(1.12);
            opacity: 0.8;
          }
        }
        @keyframes nye-ring {
          0% {
            transform: scale(0.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .nye-art .nye-eq,
          .nye-art .nye-tw,
          .nye-glint,
          .nye-note,
          .nye-shimmer,
          .nye-ring {
            animation: none;
          }
          .nye-ring {
            opacity: 0.35;
          }
        }
      `}</style>
    </>
  );
}
