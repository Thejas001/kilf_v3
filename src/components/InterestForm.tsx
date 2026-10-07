'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LimeButton } from '@/components/LimeButton';
import { Icon } from '@/components/Icon';
import { site } from '@/lib/site';

/** Browser calls go through the /backend rewrite (next.config.mjs), like bookings. */
const ENDPOINT = '/backend/api/early-bird';

const TYPES = [
  { value: 'REGISTER', label: 'Register', hint: 'Be a delegate at the first edition' },
  { value: 'VOLUNTEER', label: 'Volunteer', hint: 'Hospitality, stage and guest care' },
  { value: 'EXHIBIT', label: 'Exhibit', hint: 'Publishers, artists and food stalls' },
  { value: 'PARTNER', label: 'Partner', hint: 'Put your brand on the shore' },
] as const;

const AGE_GROUPS = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+'];

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
  'mt-1.5 block w-full rounded-none border border-line bg-white px-4 py-3.5 text-base text-navy placeholder:text-muted/70 transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20';

export function InterestForm() {
  const [type, setType] = useState<TypeValue>('REGISTER');
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  // Links like /get-involved?type=volunteer#register preselect the option.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('type')?.toUpperCase();
    const match = TYPES.find((t) => t.value === want);
    if (match) setType(match.value);
  }, []);

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
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
      <div
        className="pop-fade fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Registration complete"
        onClick={() => setStatus('idle')}
      >
        <div
          className="pop-in card flex w-full max-w-md flex-col items-center gap-4 bg-sky p-8 text-center sm:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="inline-grid size-12 shrink-0 place-items-center bg-lime text-ink">
            <Icon name="check" size={26} />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold tracking-[-0.03em]">Thank you!</p>
            <p className="mt-1 text-muted">We’ve got your details and will be in touch by email or WhatsApp.</p>
          </div>
          <button
            type="button"
            autoFocus
            onClick={() => setStatus('idle')}
            className="mt-2 border border-navy/30 px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card relative p-6 sm:p-9">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Leave this field empty <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Name <span className="text-coral-ink" aria-hidden="true">*</span>
          <input className={control} name="name" autoComplete="name" required minLength={2} />
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
        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Age group <span className="text-coral-ink" aria-hidden="true">*</span>
          <select className={control} name="ageGroup" required defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-navy">
          I’d like to <span className="text-coral-ink" aria-hidden="true">*</span>
          <select className={control} name="interestType" required value={type} onChange={(e) => setType(e.target.value as TypeValue)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-sm text-muted">{TYPES.find((t) => t.value === type)?.hint}</p>
      </div>

      <fieldset className="mt-6">
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
                  'cursor-pointer border px-4 py-2.5 text-[0.95rem] font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue/40',
                  on ? 'border-blue bg-blue text-white' : 'border-line bg-white text-navy hover:border-navy/40',
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

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <LimeButton type="submit" label={status === 'sending' ? 'Sending…' : 'Send'} disabled={status === 'sending'} />
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
