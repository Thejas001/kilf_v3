import type { ReactNode } from 'react';

/** Small square label, e.g. "Proposed" or "Subject to confirmation". */
interface Props {
  tone?: 'coral' | 'lime' | 'sky' | 'outline' | 'dark';
  className?: string;
  children?: ReactNode;
}

const tones = {
  coral: 'bg-coral-soft text-coral-deep',
  lime: 'bg-lime text-ink',
  sky: 'bg-sky text-navy',
  outline: 'ring-1 ring-inset ring-current text-muted',
  dark: 'bg-white/10 text-lime ring-1 ring-inset ring-white/25',
};

export function Badge({ tone = 'coral', className = '', children }: Props) {
  return (
    <span className={['inline-flex items-center gap-1 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em]', tones[tone], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
