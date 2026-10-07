/** Form field with label, hint and an error slot wired for a11y. */
interface Props {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'url' | 'number';
  required?: boolean;
  options?: string[];
  autocomplete?: string;
  hint?: string;
  full?: boolean;
  formId: string;
  rows?: number;
  inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'url';
  pattern?: string;
  lang?: string;
}

const control =
  'mt-1.5 block w-full rounded-none border border-line bg-white px-4 py-3.5 text-base text-navy placeholder:text-muted/70 transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 aria-[invalid=true]:border-coral-ink aria-[invalid=true]:ring-coral-ink/20';

export function Field({
  name,
  label,
  type = 'text',
  required = false,
  options = [],
  autocomplete,
  hint,
  full = false,
  formId,
  rows = 4,
  inputmode,
  pattern,
  lang,
}: Props) {
  const id = `${formId}-${name}`;
  const describedBy = [hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(' ');

  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span className="text-coral-ink" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {type === 'textarea' ? (
        <textarea id={id} name={name} rows={rows} required={required} aria-describedby={describedBy} className={control} lang={lang} />
      ) : type === 'select' ? (
        <select
          id={id}
          name={name}
          required={required}
          aria-describedby={describedBy}
          className={[control, 'appearance-none bg-[length:20px] bg-[right_1rem_center] bg-no-repeat pr-10'].join(' ')}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230F1C74' stroke-width='1.5'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E")`,
          }}
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autocomplete}
          aria-describedby={describedBy}
          className={control}
          inputMode={inputmode}
          pattern={pattern}
          lang={lang}
        />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      <p id={`${id}-error`} className="mt-1.5 hidden text-sm font-semibold text-coral-ink" data-error-for={name}></p>
    </div>
  );
}
