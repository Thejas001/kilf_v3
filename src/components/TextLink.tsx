/** Text link with an underline rule and a ↗, as in the print style. */
interface Props {
  href: string;
  label: string;
  tone?: 'light' | 'dark' | 'navy';
  className?: string;
  arrow?: '↗' | '→';
}

const tones = {
  light: 'text-navy hover:text-blue',
  dark: 'text-white hover:text-lime',
  navy: 'text-navy hover:text-ink',
};

export function TextLink({ href, label, tone = 'light', className = '', arrow = '↗' }: Props) {
  return (
    <a href={href} className={['text-link group inline-flex min-h-11 items-end gap-2 font-semibold', tones[tone], className].filter(Boolean).join(' ')}>
      <span>{label}</span>
      <span aria-hidden="true" className="text-[0.85em] transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        {arrow}
      </span>
    </a>
  );
}
