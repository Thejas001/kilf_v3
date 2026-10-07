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
}

export function NotifyBanner({ id, formName, text, accent, lead, kicker, submitLabel = 'Notify me', lang = 'en', extraField, extraFields = [], tone = 'lime' }: Props) {
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
        <Form id={`${id}-form`} name={formName} lang={lang} submitLabel={submitLabel} className="on-light border border-ink/10 bg-cream p-6 text-navy sm:p-9" successText="We’ll let you know the moment it opens.">
          <Field formId={`${id}-form`} name="name" label="Name" autocomplete="name" required />
          <Field formId={`${id}-form`} name="contact" label="Email or WhatsApp number" autocomplete="email" required />
          {selects.map((f) => (
            <Field key={f.name} formId={`${id}-form`} type="select" name={f.name} label={f.label} options={f.options} full={selects.length === 1} />
          ))}
        </Form>
      </div>
    </section>
  );
}
