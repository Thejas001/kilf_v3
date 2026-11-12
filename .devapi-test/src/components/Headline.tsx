import type { CSSProperties } from 'react';

/**
 * Two-line display headline in Plus Jakarta Sans: the first line in the
 * surface's text colour, the second (`accent`) in the accent colour or a
 * gradient: "Some stories you read. / Others, you live."
 *
 * The original Astro component sized Malayalam headlines a step smaller by
 * inspecting `Astro.url.pathname` directly, with no prop needed. Server
 * Components in Next have no implicit access to the current URL, so this is
 * simplified to keying off the `lang` prop instead: pass `lang="ml"` for a
 * translated Malayalam page to get the smaller sizes. No current call site
 * passes `lang`, so this is a no-op today (deliberate simplification).
 */
interface Props {
  text?: string;
  accent?: string;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'xl' | 'lg' | 'md' | 'sm';
  tone?: 'light' | 'dark' | 'blue' | 'coral' | 'lime';
  /** How the accent line is set. */
  accentStyle?: 'color' | 'gradient' | 'soft';
  /** Override the accent colour. */
  accentColor?: 'coral' | 'blue' | 'lime' | 'navy';
  /** Keep the accent on the same line (default: its own line). */
  inline?: boolean;
  /** Back-compat: stack is now the default. */
  stack?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  lang?: string;
  [key: `data-${string}`]: unknown;
}

const sizes = {
  xl: 'text-[2.7rem] sm:text-[4rem] lg:text-[5.2rem]',
  lg: 'text-[2.15rem] sm:text-[2.9rem] lg:text-[3.4rem]',
  md: 'text-[1.75rem] sm:text-[2.2rem] lg:text-[2.5rem]',
  sm: 'text-2xl sm:text-3xl',
};
const mlSizes = {
  xl: 'text-[2.2rem] sm:text-[3.2rem] lg:text-[4rem]',
  lg: 'text-[1.85rem] sm:text-[2.5rem] lg:text-[2.9rem]',
  md: 'text-[1.55rem] sm:text-[1.9rem] lg:text-[2.2rem]',
  sm: 'text-xl sm:text-2xl',
};
const base = { light: 'text-navy', dark: 'text-white', blue: 'text-white', coral: 'text-navy', lime: 'text-navy' };
const defaultAccent = { light: 'text-blue-bright', dark: 'text-lime', blue: 'text-lime', coral: 'text-blue', lime: 'text-blue' };
const gradientFor = { light: 'text-grad', dark: 'text-grad-warm', blue: 'text-grad-warm', coral: 'text-grad-ink', lime: 'text-grad-ink' };

export function Headline({
  text = '',
  accent = '',
  as: Tag = 'h2',
  size = 'lg',
  tone = 'light',
  accentStyle = 'color',
  accentColor,
  inline = false,
  className = '',
  style,
  id,
  lang,
  stack: _stack,
  ...rest
}: Props) {
  // Malayalam words run long: set translated Malayalam headlines a step smaller.
  const mlText = lang === 'ml';
  const onDark = tone === 'dark' || tone === 'blue';
  const colorFor = { coral: onDark ? 'text-coral' : 'text-coral-dark', blue: onDark ? 'text-mist' : tone === 'light' ? 'text-blue-bright' : 'text-blue', lime: 'text-lime', navy: 'text-navy' };
  const accentClass = accentStyle === 'gradient' ? gradientFor[tone] : accentStyle === 'soft' ? 'font-normal opacity-90' : accentColor ? colorFor[accentColor] : defaultAccent[tone];

  return (
    <Tag
      id={id}
      lang={lang}
      style={style}
      className={['display', (mlText ? mlSizes : sizes)[size], base[tone], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {text}
      {text && accent ? inline ? ' ' : <br /> : ''}
      {accent && <span className={accentClass}>{accent}</span>}
    </Tag>
  );
}
