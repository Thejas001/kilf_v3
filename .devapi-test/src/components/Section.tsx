import type { ReactNode } from 'react';

/** Page section: generous space, brand surfaces, faint wave lines. */
interface Props {
  tone?: 'cream' | 'white' | 'sky' | 'navy' | 'blue' | 'lime' | 'coral' | 'ink';
  waves?: boolean;
  /** A hairline across the top of the content, between two cream sections. */
  rule?: boolean;
  id?: string;
  className?: string;
  inner?: string;
  labelledby?: string;
  as?: 'section' | 'div';
  /** Named-slot replacement for Astro's <slot name="backdrop" />. */
  backdrop?: ReactNode;
  children?: ReactNode;
}

const tones = {
  cream: 'bg-cream text-navy',
  white: 'bg-cream text-navy',
  sky: 'bg-sky text-navy',
  navy: 'bg-footer text-white on-dark',
  ink: 'bg-navy-deep text-white on-dark',
  blue: 'bg-blue text-white on-dark',
  lime: 'bg-lime text-ink',
  coral: 'bg-coral text-ink',
};

export function Section({ tone = 'cream', waves = true, rule = false, id, className = '', inner = '', labelledby, as: Tag = 'section', backdrop, children }: Props) {
  const dark = tone === 'navy' || tone === 'blue' || tone === 'ink';
  return (
    <Tag
      id={id}
      aria-labelledby={labelledby}
      className={[
        'relative overflow-hidden',
        rule ? 'pb-20 sm:pb-28 lg:pb-32' : 'py-20 sm:py-28 lg:py-32',
        tones[tone],
        waves && (dark ? 'waves-light' : 'waves'),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {backdrop}
      <div className={['container-kilf relative', inner].filter(Boolean).join(' ')}>
        {rule && <div className="mb-20 border-t border-line sm:mb-28 lg:mb-32" aria-hidden="true"></div>}
        {children}
      </div>
    </Tag>
  );
}
