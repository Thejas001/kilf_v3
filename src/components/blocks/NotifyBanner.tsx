import { Headline } from '../Headline';
import { Form } from '../Form';
import { Field } from '../Field';
import RippleField from '../motion/RippleField';
import type { Lang } from '@/i18n/ui';

/** A lime band (or sky, or blue) with a compact "Notify me" form in a cream box. */
interface Props {
  id: string;
  formName: string;
  text: string;
  accent: string;
  lead?: string;
  kicker?: string;
  submitLabel?: string;
  lang?: Lang;
  extraField?: { name: string; label: string; options: string[] };
  extraFields?: { name: string; label: string; options: string[] }[];
  tone?: 'lime' | 'blue' | 'sky';
  /** Demo mode: no submission, thank-you animation then redirect home. */
  dummy?: boolean;
}

export function NotifyBanner({ id, formName, text, accent, lead, kicker, submitLabel = 'Notify me', lang = 'en', extraField, extraFields = [], tone = 'lime', dummy = false }: Props) {
  const blue = tone === 'blue';
  const selects = [...(extraField ? [extraField] : []), ...extraFields];

  return (
    <section
      id={id}
      className={['relative overflow-hidden py-20 sm:py-24 lg:py-28', blue ? 'on-dark waves-light bg-blue text-white' : tone === 'sky' ? 'waves bg-sky text-navy' : 'bg-lime text-ink'].join(' ')}
      aria-labelledby={`${id}-h`}
    >
      <RippleField tone={blue ? 'dark' : tone === 'sky' ? 'light' : 'coral'} x={8} y={88} size={520} />
      <div className="container-kilf relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          {kicker && <p className={['eyebrow', blue && 'text-white/80'].filter(Boolean).join(' ')}>{kicker}</p>}
          <Headline id={`${id}-h`} text={text} accent={accent} tone={blue ? 'blue' : tone === 'sky' ? 'light' : 'lime'} size="lg" className={kicker ? 'mt-5' : undefined} />
          {lead && <p className={['mt-6 max-w-md text-lg leading-relaxed', blue ? 'text-white/85' : tone === 'sky' ? 'text-navy/80' : 'text-ink/80'].join(' ')}>{lead}</p>}
        </div>
        <Form
          id={`${id}-form`}
          dummy={dummy}
          name={formName}
          lang={lang}
          submitLabel={submitLabel}
          className="on-light rounded-[1.75rem] border border-white/70 bg-cream/95 p-6 text-navy shadow-[0_30px_80px_-30px_rgba(15,28,116,0.45)] ring-1 ring-ink/5 sm:p-10 [&_input:not([type=radio])]:rounded-xl [&_input:not([type=radio])]:bg-white [&_input:not([type=radio])]:shadow-sm [&_[data-submit]]:rounded-xl"
          successText="We’ll let you know the moment it opens."
        >
          <Field formId={`${id}-form`} name="name" label="Name" autocomplete="name" required />
          <Field formId={`${id}-form`} name="contact" label="Email or WhatsApp number" autocomplete="email" required />
          {selects.map((f) => {
            const pills = f.options.length > 4;
            return (
              <fieldset key={f.name} className="sm:col-span-2">
                <legend className="text-sm font-semibold text-navy">
                  {f.label}
                  <span className="font-normal text-muted"> (optional)</span>
                </legend>
                <div className={['mt-2.5 grid gap-2.5', pills ? 'grid-cols-6' : 'sm:grid-cols-3'].join(' ')}>
                  {f.options.map((o) => (
                    <label key={o} className="group cursor-pointer">
                      <input type="radio" name={f.name} value={o} className="peer sr-only" />
                      <span
                        className={[
                          'flex items-center justify-center rounded-xl border border-navy/15 bg-white text-center text-[0.95rem] font-medium text-navy shadow-sm transition-all duration-200',
                          'hover:-translate-y-0.5 hover:border-blue/50 hover:shadow-md',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-blue/40',
                          'peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-checked:shadow-lg',
                          pills ? 'h-12' : 'min-h-[3.5rem] px-3 py-3 leading-snug',
                        ].join(' ')}
                      >
                        {o}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </Form>
      </div>
    </section>
  );
}
