'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { site, env } from '@/lib/site';
import { useTranslations, type Lang } from '@/i18n/ui';
import { LimeButton } from './LimeButton';
import { Icon } from './Icon';

/**
 * Static-hosting form. POSTs JSON to PUBLIC_FORM_ENDPOINT (Formspree,
 * Getform, a Google Apps Script web app…). Includes a honeypot field and a
 * minimum fill time for spam protection, client-side validation and a
 * success state. Put <Field formId={id} …/> components as children.
 */
interface Props {
  id: string;
  name: string; // sent as the "form" field, e.g. "volunteer"
  submitLabel?: string;
  endpoint?: string;
  lang?: Lang;
  className?: string;
  successTitle?: string;
  successText?: string;
  tone?: 'light' | 'dark';
  grid?: boolean;
  children?: ReactNode;
}

const MIN_FILL_MS = 2500;

export function Form({
  id,
  name,
  lang = 'en',
  submitLabel,
  endpoint,
  className = '',
  successTitle,
  successText,
  tone = 'light',
  grid = true,
  children,
}: Props) {
  const t = useTranslations(lang);
  const dark = tone === 'dark';
  const pathname = usePathname();
  const resolvedEndpoint = endpoint ?? env.formEndpoint;
  const resolvedSuccessTitle = successTitle ?? (lang === 'ml' ? 'നന്ദി!' : 'Thank you!');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;

    const started = Date.now();
    const fields = form.querySelector<HTMLElement>('[data-fields]');
    const success = form.querySelector<HTMLElement>('[data-success]');
    const errorBox = form.querySelector<HTMLElement>('[data-form-error]');
    const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
    if (!fields || !success || !errorBox || !submit) return undefined;
    const submitText = submit.querySelector('span');
    if (!submitText) return undefined;
    const originalLabel = submitText.textContent;

    const controls = () =>
      Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input:not([type=hidden]):not([name=_gotcha]), textarea, select'));

    const showError = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
      const msg = form.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`);
      const valid = el.checkValidity();
      el.setAttribute('aria-invalid', String(!valid));
      if (msg) {
        msg.textContent = valid ? '' : el.validity.valueMissing ? form.dataset.required || 'Required' : el.validationMessage;
        msg.classList.toggle('hidden', valid);
      }
      return valid;
    };

    const onBlur = (e: Event) => {
      const el = e.currentTarget as HTMLInputElement;
      if (el.value) showError(el);
    };
    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLInputElement;
      if (el.getAttribute('aria-invalid') === 'true') showError(el);
    };
    controls().forEach((el) => {
      el.addEventListener('blur', onBlur);
      el.addEventListener('input', onInput);
    });

    const onSubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      errorBox.classList.add('hidden');
      const invalid = controls().filter((el) => !showError(el));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>;
      const done = () => {
        fields.classList.add('hidden');
        success.classList.remove('hidden');
        success.focus();
      };
      // Bots: filled honeypot or inhumanly fast → pretend success, send nothing.
      if (data._gotcha || Date.now() - started < MIN_FILL_MS) return done();
      delete data._gotcha;

      const ep = form.dataset.endpoint;
      if (!ep) {
        if (form.dataset.dev) {
          console.warn('[KILF] PUBLIC_FORM_ENDPOINT is not set; simulating success in dev.', data);
          return done();
        }
        errorBox.classList.remove('hidden');
        return;
      }
      submit.disabled = true;
      submitText.textContent = form.dataset.sending || 'Sending…';
      try {
        const body = JSON.stringify({ ...data, submittedAt: new Date().toISOString() });
        if (ep.includes('script.google.com')) {
          // Google Apps Script web apps don't answer CORS preflights: send a
          // "simple" request and trust it (the script parses e.postData.contents).
          await fetch(ep, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
        } else {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body,
          });
          if (!res.ok) throw new Error(String(res.status));
        }
        done();
      } catch {
        errorBox.classList.remove('hidden');
      } finally {
        submit.disabled = false;
        submitText.textContent = originalLabel;
      }
    };
    form.addEventListener('submit', onSubmit as unknown as EventListener);

    return () => {
      controls().forEach((el) => {
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('input', onInput);
      });
      form.removeEventListener('submit', onSubmit as unknown as EventListener);
    };
  }, []);

  return (
    <form
      ref={formRef}
      id={id}
      data-kilf-form
      data-endpoint={resolvedEndpoint}
      data-dev={process.env.NODE_ENV !== 'production' ? 'true' : undefined}
      data-sending={t('form.sending')}
      data-required={t('form.required')}
      noValidate
      className={['relative', className].filter(Boolean).join(' ')}
    >
      <input type="hidden" name="form" value={name} />
      <input type="hidden" name="page" value={pathname} />
      {/* honeypot: humans never see or fill this */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Leave this field empty <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div data-fields>
        <div className={grid ? 'grid gap-5 sm:grid-cols-2' : undefined}>{children}</div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <LimeButton type="submit" label={submitLabel ?? t('form.submit')} data-submit />
          <p className={['text-sm', dark ? 'text-mist' : 'text-muted'].join(' ')}>
            {lang === 'ml' ? 'നിങ്ങളുടെ വിവരങ്ങൾ KILF-നു മാത്രം.' : 'We only use your details for KILF.'}{' '}
            <a href={lang === 'ml' ? '/ml/privacy' : '/privacy'} className="underline decoration-1 underline-offset-4">
              {lang === 'ml' ? 'സ്വകാര്യത' : 'Privacy'}
            </a>
          </p>
        </div>
        <p data-form-error role="alert" className={['mt-4 hidden border-l-2 px-4 py-3 text-sm font-semibold', dark ? 'border-coral bg-white/10 text-cream' : 'border-coral-ink bg-coral-soft text-coral-deep'].join(' ')}>
          {t('form.error')}{' '}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
          .
        </p>
      </div>

      <div data-success className={['hidden p-6 sm:p-8', dark ? 'bg-white/10' : 'bg-sky'].join(' ')} tabIndex={-1} role="status">
        <div className="flex items-start gap-4">
          <span className="inline-grid size-12 shrink-0 place-items-center bg-lime text-ink">
            <Icon name="check" size={26} />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold tracking-[-0.03em]">{resolvedSuccessTitle}</p>
            <p className={['mt-1', dark ? 'text-cream/90' : 'text-muted'].join(' ')}>{successText ?? t('form.success')}</p>
          </div>
        </div>
      </div>
    </form>
  );
}
