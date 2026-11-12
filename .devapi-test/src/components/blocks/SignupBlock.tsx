import { ChapterLabel } from '../ChapterLabel';
import { Headline } from '../Headline';
import { Form } from '../Form';
import { Field } from '../Field';
import { LimeButton } from '../LimeButton';
import { env } from '@/lib/site';
import { useTranslations, type Lang } from '@/i18n/ui';

/** Newsletter / WhatsApp signup: copy on the left, a square form on the right. */
interface Props {
  lang?: Lang;
  chapter: number;
  id?: string;
  tone?: 'light' | 'dark';
}

export function SignupBlock({ lang = 'en', chapter, id = 'newsletter', tone = 'light' }: Props) {
  const t = useTranslations(lang);
  const dark = tone === 'dark';

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
      <div>
        <ChapterLabel n={chapter} label={t('home.signup.chapter')} tone={dark ? 'dark' : 'light'} />
        <Headline text={t('home.signup.h')} accent={t('home.signup.accent')} tone={dark ? 'blue' : 'light'} className="mt-6" id={`${id}-h`} />
        <p className={['mt-6 max-w-md text-lg leading-relaxed', dark ? 'text-white/85' : 'text-muted'].join(' ')}>{t('home.signup.lead')}</p>
        {env.whatsappUrl && <LimeButton href={env.whatsappUrl} label={t('home.signup.whatsapp')} variant={dark ? 'white' : 'ghost'} className="mt-7" external />}
      </div>
      <Form id={id} name="newsletter" lang={lang} endpoint={env.formEndpointNewsletter || env.formEndpoint} submitLabel={t('form.subscribe')} className="on-light border border-line bg-cream p-6 text-navy sm:p-9">
        <Field formId={id} name="name" label={t('form.name')} autocomplete="name" required full />
        <Field formId={id} name="contact" label={t('form.phoneOrEmail')} autocomplete="email" required full />
      </Form>
    </div>
  );
}
