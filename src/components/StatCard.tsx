/** A big number over a hairline, counting up when it scrolls in. */
interface Props {
  value: string;
  label: string;
  note?: string;
  lang?: string;
}

export function StatCard({ value, label, note, lang }: Props) {
  const m = value.match(/^([\d,]+)(.*)$/);
  const count = m ? Number(m[1].replace(/,/g, '')) : undefined;
  return (
    <div className="flex h-full flex-col-reverse justify-end gap-3 border-t border-line pt-6">
      <span className="flex items-baseline justify-between gap-2">
        <span className="eyebrow text-navy" lang={lang}>
          {label}
        </span>
        {note && (
          <span className="text-sm font-medium text-muted" lang={lang}>
            {note}
          </span>
        )}
      </span>
      <span className="numeral text-[clamp(2.4rem,11vw,3.4rem)] text-blue-bright sm:text-[4.2rem]">
        <span data-count={count}>{m ? m[1] : value}</span>
        {m?.[2] && <span>{m[2]}</span>}
      </span>
    </div>
  );
}
