'use client';

import { useId, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { MotionRoot, calm } from './shared';

/**
 * The theatre ticket card for Khasakkinte Ithihasam. Visitors choose the
 * theatre ticket on its own or the theatre + Festival Pass bundle, pick a
 * night and how many, see the total and a preview of the ticket. Booking has
 * not opened, so nothing is sold or sent: the preview is clearly marked as
 * not valid for entry.
 */
type Kind = 'theatre' | 'bundle';
interface Props {
  notifyHref: string;
}

const kinds: Record<Kind, { tag: string; name: string; line: string; price: number; save?: string; includes: string[] }> = {
  theatre: {
    tag: 'Theatre',
    name: 'Theatre ticket',
    line: 'Khasakkinte Ithihasam only',
    price: 1500,
    includes: ['A seat at the performance'],
  },
  bundle: {
    tag: 'Theatre + Festival Pass',
    name: 'Theatre + Festival Pass',
    line: 'The play, plus all five days of the festival',
    price: 1600,
    save: 'All five days for ₹100 more',
    includes: ['A seat at the performance', 'Festival Pass: all five days, 31 Dec – 4 Jan', 'New Year’s Eve by the lake'],
  },
};

/** The three performances, all at Ashramam Maidan. */
const nights = [
  { id: '2027-01-01', day: 'Fri', date: '1 Jan', long: 'Friday 1 January 2027' },
  { id: '2027-01-02', day: 'Sat', date: '2 Jan', long: 'Saturday 2 January 2027' },
  { id: '2027-01-03', day: 'Sun', date: '3 Jan', long: 'Sunday 3 January 2027' },
];
const venue = 'Ashramam Maidan, Kollam';
const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function Card({ notifyHref }: Props) {
  const [kind, setKind] = useState<Kind>('theatre');
  const [night, setNight] = useState(nights[0].id);
  const [qty, setQty] = useState(1);
  const [preview, setPreview] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();
  const k = kinds[kind];
  const n = nights.find((x) => x.id === night) ?? nights[0];
  const fade = reduce ? { duration: 0 } : { duration: 0.45, ease: calm };

  return (
    <div className="border border-[#c7cfeb] bg-cream p-7 text-navy shadow-[0_40px_80px_-50px_rgb(16_27_70/0.55)] sm:p-9">
      <div className="flex items-center justify-between gap-4 text-[0.78rem] font-medium uppercase tracking-[0.16em]">
        <span>KILF 2027</span>
        <AnimatePresence mode="wait" initial={false}>
          <m.span key={k.tag} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={fade}>
            {k.tag}
          </m.span>
        </AnimatePresence>
      </div>
      <hr className="my-6 border-0 border-t border-dashed border-[#aab6e3]" />

      <h3 className="display text-[2.2rem] sm:text-[2.6rem]">
        Khasakkinte
        <br />
        Ithihasam
      </h3>
      <p className="mt-4 text-[1rem] text-navy/85">Directed by Deepan Sivaraman</p>

      <fieldset className="mt-7">
        <legend className="text-sm font-medium text-navy/80">Ticket type</legend>
        <div className="mt-3 grid gap-2.5">
          {(Object.keys(kinds) as Kind[]).map((key) => {
            const on = kind === key;
            return (
              <label
                key={key}
                className={`relative flex cursor-pointer items-start gap-3.5 border p-4 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${on ? 'border-blue bg-white' : 'border-line bg-cream hover:border-navy/40'}`}
              >
                <input
                  type="radio"
                  name={`${id}-kind`}
                  value={key}
                  checked={on}
                  onChange={() => {
                    setKind(key);
                    setPreview(false);
                  }}
                  className="sr-only"
                />
                <span aria-hidden="true" className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border transition-colors ${on ? 'border-blue' : 'border-navy/40'}`}>
                  <m.span className="block size-2 rounded-full bg-blue" initial={false} animate={{ scale: on ? 1 : 0 }} transition={fade} />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold leading-snug">{kinds[key].name}</span>
                  <span className="mt-0.5 block text-[0.92rem] leading-snug text-navy/75">{kinds[key].line}</span>
                  {kinds[key].save && <span className="mt-2 inline-block bg-lime px-2 py-0.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-ink">{kinds[key].save}</span>}
                </span>
                <span className="font-display text-[1.15rem] font-bold tracking-[-0.02em]">{inr(kinds[key].price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-sm font-medium text-navy/80">Performance</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {nights.map((x) => {
            const on = night === x.id;
            return (
              <label
                key={x.id}
                className={`flex cursor-pointer flex-col items-center border px-2 py-3 text-center transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${on ? 'border-navy bg-navy text-white' : 'border-line bg-cream hover:border-navy/40'}`}
              >
                <input
                  type="radio"
                  name={`${id}-night`}
                  value={x.id}
                  checked={on}
                  onChange={() => {
                    setNight(x.id);
                    setPreview(false);
                  }}
                  className="sr-only"
                />
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] opacity-80">{x.day}</span>
                <span className="mt-0.5 font-display text-[1.1rem] font-semibold tracking-[-0.02em]">{x.date}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-[0.92rem] text-navy/80">{venue} · evening, time to be confirmed</p>
      </fieldset>
      <hr className="my-7 border-0 border-t border-dashed border-[#aab6e3]" />

      <label htmlFor={`${id}-qty`} className="text-sm text-navy/80">
        Number of tickets
      </label>
      <select
        id={`${id}-qty`}
        value={qty}
        onChange={(e) => {
          setQty(Number(e.target.value));
          setPreview(false);
        }}
        className="mt-2 block w-full appearance-none rounded-none border border-[#c7cfeb] bg-white bg-[length:20px] bg-[right_1rem_center] bg-no-repeat px-4 py-3.5 text-base text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23152F81' stroke-width='1.5'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E\")" }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? 'ticket' : 'tickets'}
          </option>
        ))}
      </select>

      <p className="mt-5 flex items-baseline justify-between gap-4" aria-live="polite">
        <span className="text-sm text-navy/80">
          Total · {qty} × {inr(k.price)}
        </span>
        <span className="font-display text-[1.6rem] font-bold tracking-[-0.03em]">{inr(k.price * qty)}</span>
      </p>

      <button
        type="button"
        onClick={() => setPreview((p) => !p)}
        aria-expanded={preview}
        aria-controls={`${id}-preview`}
        className="btn btn-primary mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2.5 text-[0.98rem] font-semibold transition-colors duration-300"
      >
        <span>{preview ? 'Hide the preview' : 'Preview your ticket'}</span>
        <span aria-hidden="true" className="text-[0.85em]">
          {preview ? '↑' : '↗'}
        </span>
      </button>
      <p className="mt-4 text-[0.92rem] text-navy/80">
        Booking has not opened. Preview only.{' '}
        <a href={notifyHref} className="font-semibold underline decoration-1 underline-offset-4 hover:text-blue">
          Get notified when it opens
        </a>
      </p>

      <div id={`${id}-preview`} aria-live="polite">
        <AnimatePresence initial={false}>
          {preview && (
            <m.div
              key={`${kind}-${qty}-${night}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -1.2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              transition={reduce ? { duration: 0 } : { duration: 0.7, ease: calm }}
              className="on-dark relative mt-7 overflow-hidden bg-blue text-white"
              role="group"
              aria-label="Ticket preview, not valid for entry"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                  <span>Preview · not valid for entry</span>
                  <span>× {qty}</span>
                </div>
                <p className="display mt-4 text-[1.7rem]">Khasakkinte Ithihasam</p>
                <p className="mt-1 text-sm text-white/80">{n.long} · {venue}</p>
                <ul className="mt-4 space-y-1.5 text-[0.95rem]">
                  {k.includes.map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-lime" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Tear line with notches, like a ticket stub */}
              <div className="relative h-5" aria-hidden="true">
                <span className="absolute -left-2.5 top-0 size-5 rounded-full bg-cream" />
                <span className="absolute -right-2.5 top-0 size-5 rounded-full bg-cream" />
                <span className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/40" />
              </div>
              <div className="flex items-end justify-between gap-4 p-6 pt-3">
                <dl className="grid gap-2 text-sm">
                  <div>
                    <dt className="text-white/70">Ticket</dt>
                    <dd className="font-semibold">{k.name}</dd>
                  </div>
                  <div>
                    <dt className="text-white/70">Total</dt>
                    <dd className="font-semibold">{inr(k.price * qty)}</dd>
                  </div>
                </dl>
                <svg viewBox="0 0 64 40" className="h-10 w-16 shrink-0 text-lime" fill="none" stroke="currentColor" aria-hidden="true">
                  <ellipse cx="32" cy="20" rx="8" ry="3" strokeWidth="1.2" />
                  <ellipse cx="32" cy="20" rx="18" ry="7" strokeWidth="1" opacity="0.7" />
                  <ellipse cx="32" cy="20" rx="30" ry="12" strokeWidth="0.8" opacity="0.45" />
                </svg>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TicketCard(props: Props) {
  return (
    <MotionRoot>
      <Card {...props} />
    </MotionRoot>
  );
}
