'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { site } from '@/lib/site';
import { localizePath, parsePath } from '@/i18n/ui';

/** How long the thank-you card shows before heading to the landing page. */
const REDIRECT_MS = 3000;

/** Browser calls go through the /backend rewrite (next.config.mjs), like bookings. */
const ENDPOINT = '/backend/api/early-bird';

const TYPES = [
  { value: 'REGISTER', label: 'Register', hint: 'Be a delegate at the first edition' },
  { value: 'VOLUNTEER', label: 'Volunteer', hint: 'Hospitality, stage and guest care' },
  { value: 'EXHIBIT', label: 'Exhibit', hint: 'Publishers, artists and food stalls' },
  { value: 'PARTNER', label: 'Partner', hint: 'Put your brand on the shore' },
] as const;

const AGE_GROUPS = ['Under 18', '18-24', '25-34', '35-44', '45-59', '60+'];

const INTERESTS = [
  { value: 'AUTHOR_TALKS', label: 'Author talks' },
  { value: 'KHASAKKINTE_ITHIHASAM', label: 'Khasakkinte Ithihasam' },
  { value: 'MUSIC_EVENINGS', label: 'Music evenings' },
  { value: 'BOOK_FAIR', label: 'Book fair' },
  { value: 'OPEN_MIC_POETRY', label: 'Open mic & poetry' },
  { value: 'NEW_YEARS_EVE', label: "New Year's Eve" },
  { value: 'WORKSHOPS', label: 'Workshops' },
];

type TypeValue = (typeof TYPES)[number]['value'];
type Status = 'idle' | 'sending' | 'done';

const control =
  'mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 shadow-sm text-base text-navy placeholder:text-muted/70 transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20';

const CHIP =
  'whitespace-nowrap rounded-xl border border-navy/15 bg-white px-2 text-center text-[0.9rem] font-medium text-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue/50 hover:shadow-md peer-focus-visible:ring-2 peer-focus-visible:ring-blue/40 peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-checked:shadow-lg';

export function InterestForm() {
  const [type, setType] = useState<TypeValue>('REGISTER');
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Links like /get-involved?type=volunteer#register preselect the option.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('type')?.toUpperCase();
    const match = TYPES.find((t) => t.value === want);
    if (match) setType(match.value);

    // Arriving via #register (the Get involved CTAs): start on Name, not whichever
    // field the browser or autofill would otherwise land on (e.g. WhatsApp on mobile).
    if (window.location.hash === '#register') {
      const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 300);
      return () => clearTimeout(t);
    }
  }, []);

  // Success: let the thank-you animation play, then go to the landing page.
  useEffect(() => {
    if (status !== 'done') return undefined;
    const { lang } = parsePath(window.location.pathname);
    const t = setTimeout(() => window.location.assign(localizePath('/', lang)), REDIRECT_MS);
    return () => clearTimeout(t);
  }, [status]);

  const toggle = (v: string) => setInterests((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('_gotcha')) return setStatus('done');
    const text = (k: string) => String(f.get(k) ?? '').trim();
    const payload = {
      interestType: type,
      name: text('name'),
      whatsappNumber: text('whatsappNumber').replace(/[\s-]/g, ''),
      email: text('email'),
      townOrCity: text('townOrCity'),
      ageGroup: text('ageGroup'),
      interests,
    };
    setError('');
    setStatus('sending');
    try {
      const [res] = await Promise.all([fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }), new Promise((r) => setTimeout(r, 1200))]);
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) throw new Error(json?.message || 'Something went wrong. Please try again.');
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="pop-fade fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Registration complete">
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
            <p className="font-display text-[2rem] font-semibold leading-none tracking-[-0.04em]">Thank you!</p>
            <p className="mx-auto mt-3 max-w-xs text-[1.05rem] leading-relaxed text-white/80">We’ve got your details and will be in touch by email or WhatsApp.</p>
            <p className="sr-only" role="status">Taking you back to the home page…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative rounded-[1.75rem] border border-white/70 bg-cream p-6 shadow-[0_30px_80px_-30px_rgba(15,28,116,0.35)] ring-1 ring-ink/5 sm:p-8">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Leave this field empty <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Name <span className="text-coral-ink" aria-hidden="true">*</span>
          <input ref={nameRef} className={control} name="name" autoComplete="name" required minLength={2} />
        </label>
        <label className="block text-sm font-semibold text-navy">
          WhatsApp number <span className="text-coral-ink" aria-hidden="true">*</span>
          <input className={control} name="whatsappNumber" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+ \-]{10,15}" />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email <span className="text-coral-ink" aria-hidden="true">*</span>
          <input className={control} name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Town or city <span className="text-coral-ink" aria-hidden="true">*</span>
          <input className={control} name="townOrCity" autoComplete="address-level2" required />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-navy">
            Age group <span className="text-coral-ink" aria-hidden="true">*</span>
          </legend>
          <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {AGE_GROUPS.map((a, i) => (
              <label key={a} className="cursor-pointer">
                <input type="radio" name="ageGroup" value={a} required={i === 0} className="peer sr-only" />
                <span className={[CHIP, 'flex h-11 items-center justify-center'].join(' ')}>{a}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-navy">
          I’d like to <span className="text-coral-ink" aria-hidden="true">*</span>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input type="radio" name="interestType" value={t.value} checked={type === t.value} onChange={() => setType(t.value)} className="peer sr-only" />
              <span className={[CHIP, 'flex h-11 items-center justify-center'].join(' ')}>{t.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{TYPES.find((t) => t.value === type)?.hint}</p>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-navy">
          What interests you? <span className="font-normal text-muted">(pick any)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {INTERESTS.map((i) => {
            const on = interests.includes(i.value);
            return (
              <label
                key={i.value}
                className={[
                  'cursor-pointer rounded-full border px-3.5 py-2 text-[0.9rem] font-medium shadow-sm transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue/40',
                  on ? 'border-blue bg-blue text-white shadow-lg' : 'border-navy/15 bg-white text-navy hover:-translate-y-0.5 hover:border-blue/50',
                ].join(' ')}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(i.value)} className="sr-only" />
                {i.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-5 border-l-2 border-coral-ink bg-coral-soft px-4 py-3 text-sm font-semibold text-coral-deep">
          {error} You can also write to{' '}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
          .
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={status === 'sending'}
          data-sending={status === 'sending' ? '' : undefined}
          className="send-btn group relative inline-flex min-h-13 items-center justify-center gap-3 overflow-hidden rounded-xl bg-blue px-7 text-[0.95rem] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(20,50,200,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1a3fd6] disabled:cursor-wait"
        >
          <span className="send-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25" aria-hidden="true" />
          <span className="relative">{status === 'sending' ? 'Sending…' : 'Send'}</span>
          <svg className="send-plane relative" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
        </button>
        <p className="text-sm text-muted">
          We only use your details for KILF.{' '}
          <a href="/privacy" className="underline decoration-1 underline-offset-4">
            Privacy
          </a>
        </p>
      </div>
    </form>
  );
}
