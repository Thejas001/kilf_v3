import { Icon } from '../Icon';
import { getStrands } from '@/lib/content';
import type { Lang } from '@/i18n/ui';

/** The nine strands in a clean grid of hairline boxes. */
interface Props {
  lang?: Lang;
}

export function StrandGrid({ lang = 'en' }: Props) {
  const strands = getStrands().sort((a, b) => a.data.order - b.data.order);
  const ml = lang === 'ml';

  return (
    <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
      {strands.map((s, i) => (
        <li key={s.id} className="strand group relative flex min-h-[15rem] flex-col border-b border-r border-line p-7 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="eyebrow text-navy" lang="en">
              {String(i + 1).padStart(2, '0')}
            </span>
            <Icon name={s.data.icon} size={30} className="text-blue-bright transition-transform duration-700 ease-[var(--ease-calm)] group-hover:-translate-y-0.5" />
          </div>
          <h3 className="mt-auto pt-10 font-display text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-navy">{ml ? s.data.name_ml : s.data.name}</h3>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-muted">{ml ? s.data.blurb_ml : s.data.blurb}</p>
        </li>
      ))}
    </ul>
  );
}
