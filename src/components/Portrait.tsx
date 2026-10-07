import type { ReactNode } from 'react';
import { asset } from '@/lib/images';

/**
 * A speaker portrait in a rounded rectangle (4:5). Until the real duotone
 * photo is in kilf-assets/speakers/, a quiet stand-in shows the speaker's
 * initials in live type: pale blue on light sections, deep blue on dark ones.
 */
interface Props {
  name: string;
  photo: string;
  sizes?: string;
  /** Kept for API compatibility with existing call sites; no longer used to
   * filter a srcset (asset() no longer returns width metadata). */
  widths?: number[];
  className?: string;
  eager?: boolean;
  tone?: 'light' | 'dark';
  children?: ReactNode;
}

const moods = {
  light: [
    'linear-gradient(165deg, #F3F6FD 0%, #DFE6F8 58%, #C9D4F4 100%)',
    'linear-gradient(200deg, #F5F7FD 0%, #E2E8F8 52%, #CDD6F4 100%)',
    'linear-gradient(145deg, #EFF3FC 0%, #D9E1F7 60%, #C2CEF2 100%)',
  ],
  dark: [
    'linear-gradient(165deg, #2A4BEF 0%, #1A36C4 55%, #13288F 100%)',
    'linear-gradient(200deg, #2D4EF0 0%, #1C39C9 50%, #142A94 100%)',
    'linear-gradient(145deg, #2748EE 0%, #1733BD 60%, #122689 100%)',
  ],
};

export function Portrait({ name, photo, sizes = '(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw', className = '', eager = false, tone = 'light', children }: Props) {
  const { src, placeholder } = asset(`speakers/${photo}`);
  const initials = name
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 || /[A-Z]/.test(w))
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const dark = tone === 'dark';
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const mood = moods[tone][hash % moods[tone].length];

  return (
    <div className={['relative aspect-[4/5] overflow-hidden rounded-[1.25rem]', dark ? 'bg-blue' : 'bg-sky', className].filter(Boolean).join(' ')}>
      {placeholder ? (
        <div className="absolute inset-0" style={{ background: mood }} role="img" aria-label={`Portrait of ${name} (photo to come)`}>
          <svg
            className={['absolute -right-12 -top-12 size-56 transition-transform duration-[1.4s] ease-[var(--ease-calm)] group-hover:scale-110', dark ? 'text-white/15' : 'text-white/80'].join(' ')}
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="30" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="58" strokeWidth="1" />
            <circle cx="100" cy="100" r="86" strokeWidth="0.8" />
          </svg>
          <span
            className={['absolute bottom-4 left-5 font-display text-[3.6rem] font-semibold leading-none tracking-[-0.04em] sm:text-[4.2rem]', dark ? 'text-white/85' : 'text-navy/75'].join(' ')}
            aria-hidden="true"
          >
            {initials}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Portrait of ${name}`}
          sizes={sizes}
          className="size-full object-cover transition-transform duration-700 ease-[var(--ease-calm)] group-hover:scale-[1.04]"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      {children}
    </div>
  );
}
