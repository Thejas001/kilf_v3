import type { ReactNode } from 'react';
import { ChapterLabel } from './ChapterLabel';
import { Headline } from './Headline';
import RippleField from './motion/RippleField';

/**
 * Standard header for inner pages: a label, a big two-line headline whose
 * second line carries the gradient, and a short lead. Faint rings spread
 * slowly behind it, and follow the pointer a little.
 */
interface Props {
  chapter: number;
  label: string;
  text?: string;
  accent: string;
  lead?: string;
  tone?: 'cream' | 'blue' | 'lime';
  children?: ReactNode;
}

const bg = { cream: 'bg-cream text-navy waves', blue: 'bg-blue-bright text-white on-dark waves-light', lime: 'bg-lime text-navy' };

export function PageHero({ chapter, label, text, accent, lead, tone = 'cream', children }: Props) {
  const dark = tone === 'blue';
  return (
    <section className={['relative overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24', bg[tone]].join(' ')}>
      <RippleField tone={dark ? 'dark' : 'light'} x={86} y={46} size={540} follow />
      <div className="container-kilf relative">
        <ChapterLabel n={chapter} label={label} tone={dark ? 'dark' : 'light'} className="hero-in" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <Headline
            as="h1"
            size="xl"
            text={text}
            accent={accent}
            accentStyle="gradient"
            tone={dark ? 'blue' : tone === 'lime' ? 'lime' : 'light'}
            className="hero-in lg:col-span-8"
            style={{ '--d': '0.08s' } as React.CSSProperties}
          />
          {lead && (
            <p className={['hero-in max-w-md text-lg leading-relaxed lg:col-span-4 lg:pb-3', dark ? 'text-white/85' : 'text-muted'].join(' ')} style={{ '--d': '0.16s' } as React.CSSProperties}>
              {lead}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
