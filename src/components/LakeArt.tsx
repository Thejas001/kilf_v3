import type { ReactNode } from 'react';
import Image from 'next/image';
import lakeHero from '@/assets/art/lake-hero.jpg';
import lakeJetty from '@/assets/art/lake-jetty.jpg';
import { LakeWaterBoot } from './LakeWaterBoot';

/**
 * The festival's lake illustrations, with live water: the still artwork is
 * a normal responsive next/image, and src/scripts/lake-water.ts redraws only
 * its water as a moving surface once the page is ready. `mask` traces the
 * water in each picture (0–1 of its width and height), so the jetty and the
 * book stay dry.
 */
interface Props {
  art: 'hero' | 'jetty';
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** object-position, 0–1 on each axis. */
  focus?: [number, number];
  /** Classes for the <img>, e.g. responsive object-position; replaces `focus` for the picture. */
  imgClassName?: string;
  alt?: string;
  interactive?: boolean;
  children?: ReactNode;
}

const arts = {
  hero: {
    img: lakeHero,
    alt: 'An open book on a wooden jetty by a calm lake at sunrise, palms on the far shore and a coral sun low in the sky.',
    squash: 2.4,
    mask: [
      [0.0, 0.245], [1.0, 0.245], [1.0, 0.412], [0.948, 0.448], [0.9, 0.486], [0.852, 0.523], [0.811, 0.545], [0.779, 0.534], [0.739, 0.523], [0.699, 0.531], [0.642, 0.562], [0.586, 0.614], [0.546, 0.653], [0.521, 0.684], [0.465, 0.716], [0.433, 0.731], [0.332, 0.791], [0.332, 0.875], [0.0, 0.773],
    ],
  },
  jetty: {
    img: lakeJetty,
    alt: 'A wide, still lake at dusk with palm islands on the horizon, a wooden jetty with an open book, and leaves in the foreground.',
    squash: 2.6,
    mask: [
      [0, 0.182], [1, 0.182], [1, 0.686], [0.967, 0.698], [0.927, 0.686], [0.878, 0.698], [0.819, 0.724], [0.819, 0.612],
      [0.783, 0.612], [0.783, 0.739], [0.584, 0.788], [0.584, 0.674], [0.54, 0.674], [0.54, 1], [0.278, 1], [0.278, 0.959],
      [0.242, 0.898], [0.21, 0.878], [0.173, 0.816], [0.149, 0.724], [0.121, 0.674], [0.101, 0.612], [0.048, 0.592], [0, 0.535],
    ],
  },
} as const;

export function LakeArt({ art, className = '', sizes = '100vw', priority = false, focus = [0.5, 0.5], alt, interactive = true, imgClassName, children }: Props) {
  const a = arts[art];
  const mask = a.mask.map(([x, y]) => [x, y] as [number, number]);

  return (
    <div className={['relative isolate overflow-hidden bg-sky', className].filter(Boolean).join(' ')} data-lake>
      <Image
        src={a.img}
        alt={alt ?? a.alt}
        sizes={sizes}
        className={['absolute inset-0 size-full object-cover', imgClassName].filter(Boolean).join(' ')}
        style={imgClassName ? undefined : { objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%` }}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        priority={priority}
      />
      <canvas
        className="absolute inset-0 block size-full opacity-0 transition-opacity duration-[1.2s] ease-[var(--ease-calm)]"
        data-water={JSON.stringify({ mask, squash: a.squash, focus, interactive })}
        aria-hidden="true"
      ></canvas>
      {children}
      <LakeWaterBoot />
    </div>
  );
}
