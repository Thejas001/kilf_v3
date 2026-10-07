import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

/**
 * Square button with a ↗. On hover a ring spreads from it, like a drop on
 * water. `primary` (the default) is blue on light surfaces and lime inside
 * `.on-dark` sections. Renders <a> when href is set.
 */
type Variant = 'primary' | 'lime' | 'navy' | 'ghost' | 'white' | 'outline-light' | 'coral';
type Size = 'md' | 'sm' | 'lg';

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  href?: string;
  label: string;
  type?: 'button' | 'submit';
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  external?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  lime: 'bg-lime text-ink hover:bg-lime-deep [--ring:var(--color-lime)]',
  navy: 'bg-navy text-white hover:bg-ink [--ring:var(--color-navy)]',
  white: 'bg-cream text-navy hover:bg-white [--ring:#fff]',
  coral: 'bg-coral text-ink hover:bg-[#ff7a60] [--ring:var(--color-coral)]',
  ghost: 'bg-transparent text-navy ring-1 ring-inset ring-navy/30 hover:bg-navy/5 [--ring:var(--color-navy)]',
  'outline-light': 'bg-transparent text-white ring-1 ring-inset ring-white/50 hover:bg-white/10 [--ring:#fff]',
};
const sizes: Record<Size, string> = { lg: 'min-h-14 px-7 text-[0.98rem]', md: 'min-h-13 px-6 text-[0.95rem]', sm: 'min-h-11 px-5 text-sm' };

export function LimeButton({ href, label, type = 'button', variant = 'primary', size = 'md', arrow = true, className = '', external = false, ...rest }: Props) {
  const classes = [
    'btn group inline-flex max-w-full items-center justify-center gap-2.5 font-semibold transition-colors duration-300 whitespace-nowrap max-[379px]:whitespace-normal',
    variants[variant],
    sizes[size],
    className,
  ].join(' ');
  const arrowSpan = arrow && (
    <span aria-hidden="true" className="text-[0.85em] transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
      ↗
    </span>
  );

  if (href) {
    const ext = external ? { target: '_blank', rel: 'noopener' } : {};
    return (
      <a href={href} className={classes} {...ext} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <span>{label}</span>
        {arrowSpan}
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span>{label}</span>
      {arrowSpan}
    </button>
  );
}
