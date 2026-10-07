import { useTranslations, localizePath, type Lang, type UIKey } from '@/i18n/ui';

/** Five ways in, as a numbered list between hairlines. */
interface Props {
  lang?: Lang;
  tone?: 'light' | 'dark';
}

const rows = [
  { key: 'register', href: '/get-involved#register' },
  { key: 'exhibit', href: '/get-involved#exhibit' },
  { key: 'partner', href: '/partners' },
  { key: 'attend', href: '/passes' },
] as const;

export function InvolvedCards({ lang = 'en', tone = 'light' }: Props) {
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);
  const dark = tone === 'dark';

  return (
    <ol className={['border-t', dark ? 'border-white/20' : 'border-line'].join(' ')} data-reveal-group>
      {rows.map((r, i) => (
        <li key={r.key} className={['border-b', dark ? 'border-white/20' : 'border-line'].join(' ')}>
          <a href={lp(r.href)} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-4 py-7 sm:grid-cols-[4.5rem_1fr_auto] sm:py-9">
            <span className={['text-sm font-medium tabular-nums', dark ? 'text-white/70' : 'text-navy'].join(' ')} lang="en">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>
              <span
                className={[
                  'block font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.03em] transition-colors duration-300 sm:text-[2rem]',
                  dark ? 'text-white group-hover:text-lime' : 'text-navy group-hover:text-blue-bright',
                ].join(' ')}
              >
                {t(`home.involved.${r.key}` as UIKey)}
              </span>
              <span className={['mt-2 block text-[1rem] leading-relaxed sm:text-[1.05rem]', dark ? 'text-white/75' : 'text-muted'].join(' ')}>
                {t(`home.involved.${r.key}.d` as UIKey)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={[
                'self-center text-xl transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-1 group-hover:translate-x-1',
                dark ? 'text-lime' : 'text-blue-bright',
              ].join(' ')}
            >
              ↗
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
