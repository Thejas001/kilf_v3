'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { site, env } from '@/lib/site';
import { useTranslations, localizePath, type Lang } from '@/i18n/ui';

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
  /** Demo mode: skip the network, play a thank-you animation, then go to the landing page. */
  dummy?: boolean;
  /** Post to the backend's public enquiries API (/api/enquiries) instead of the generic form endpoint. */
  enquiryApi?: boolean;
  children?: ReactNode;
}

/** Browser calls go through the /backend rewrite (next.config.mjs), like bookings. */
const ENQUIRY_ENDPOINT = '/backend/api/enquiries';
const MIN_FILL_MS = 2500;
const REDIRECT_MS = 3000;

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
  dummy = false,
  enquiryApi = false,
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
    const errorBox = form.querySelector<HTMLElement>('[data-form-error]');
    const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
    if (!fields || !errorBox || !submit) return undefined;
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
      const showThanks = () => {
        form.querySelector<HTMLElement>('[data-thanks]')?.classList.remove('hidden');
        setTimeout(() => window.location.assign(localizePath('/', lang)), REDIRECT_MS);
      };
      if (dummy) return showThanks();
      const data = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>;
      const done = showThanks;
      // Bots: filled honeypot or inhumanly fast → pretend success, send nothing.
      if (data._gotcha || Date.now() - started < MIN_FILL_MS) return done();
      delete data._gotcha;

      if (enquiryApi) {
        const text = (k: string) => String(data[k] ?? '').trim();
        const payload = {
          name: text('name'),
          email: text('email'),
          phone: text('phone'),
          organisation: text('organisation'),
          topic: text('tier') || undefined,
          notes: text('message') || undefined,
        };
        submit.disabled = true;
        submit.setAttribute('data-sending', '');
        submitText.textContent = form.dataset.sending || 'Sending…';
        try {
          // Keep "Sending…" visible long enough for the animation to read.
          const [res] = await Promise.all([
            fetch(ENQUIRY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
            new Promise((r) => setTimeout(r, 1200)),
          ]);
          const json = await res.json().catch(() => null);
          if (res.status === 400 && Array.isArray(json?.errors) && json.errors.length) {
            let first: HTMLElement | null = null;
            for (const err of json.errors as { path: string; message: string }[]) {
              const field = String(err.path).replace(/^body./, '');
              const key = field === 'organisation' || field === 'name' || field === 'email' || field === 'phone' ? field : field === 'topic' ? 'tier' : field === 'notes' ? 'message' : field;
              const input = form.querySelector<HTMLElement>(`[name="${key}"]`);
              const msg = form.querySelector<HTMLElement>(`[data-error-for="${key}"]`);
              if (msg) {
                msg.textContent = err.message;
                msg.classList.remove('hidden');
              }
              input?.setAttribute('aria-invalid', 'true');
              first ??= input;
            }
            first?.focus();
            return;
          }
          if (!res.ok || json?.success === false) throw new Error(json?.message || String(res.status));
          done();
        } catch {
          errorBox.classList.remove('hidden');
        } finally {
          submit.disabled = false;
          submit.removeAttribute('data-sending');
          submitText.textContent = originalLabel;
        }
        return;
      }

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
      submit.setAttribute('data-sending', '');
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
        submit.removeAttribute('data-sending');
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
  }, [dummy, enquiryApi, lang]);

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
          <button
            type="submit"
            data-submit
            className="send-btn group relative inline-flex min-h-13 items-center justify-center gap-3 overflow-hidden rounded-xl bg-blue px-7 text-[0.95rem] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(20,50,200,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1a3fd6] disabled:cursor-wait"
          >
            <span className="relative">{submitLabel ?? t('form.submit')}</span>
            <svg className="send-plane relative" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
            </svg>
            <span className="send-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25" aria-hidden="true" />
          </button>
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

      <div data-thanks className="pop-fade fixed inset-0 z-50 hidden items-center justify-center bg-ink/70 p-4 backdrop-blur-md [&:not(.hidden)]:flex" role="dialog" aria-modal="true" aria-label={resolvedSuccessTitle}>
        <div className="pop-in on-dark relative flex w-full max-w-md flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#1b2a9a] to-[#0b1250] px-8 pb-12 pt-12 text-center text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-lime/25 blur-3xl" aria-hidden="true" />
          <span className="relative grid size-20 place-items-center" aria-hidden="true">
            <span className="thanks-ring absolute inset-0 rounded-full bg-lime/40" />
            <span className="thanks-check relative grid size-20 place-items-center rounded-full bg-lime text-ink shadow-[0_10px_40px_-8px_rgba(226,240,120,0.8)]">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path className="thanks-tick" d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
          </span>
          <div className="relative">
            <p className="font-display text-[2rem] font-semibold leading-none tracking-[-0.04em]">{resolvedSuccessTitle}</p>
            <p className="mx-auto mt-3 max-w-xs text-[1.05rem] leading-relaxed text-white/80">{successText ?? t('form.success')}</p>
            <p className="sr-only" role="status">
              {lang === 'ml' ? 'ഹോം പേജിലേക്ക് മടങ്ങുന്നു…' : 'Taking you back to the home page…'}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
