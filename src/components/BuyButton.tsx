'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { LimeButton } from '@/components/LimeButton';
import {
  ApiError,
  MAX_PER_BOOKING,
  confirmPayment,
  createBooking,
  fieldKey,
  getQuote,
  getShowSessions,
  loadRazorpay,
  openCheckout,
  type Attendee,
  type ConfirmedBooking,
  type ShowSession,
  type TicketRequirements,
  type Quote,
} from '@/lib/bookings';

interface Props {
  ticketId: string;
  name: string;
  unitPrice: number;
  currency: string;
  maxQuantity?: number;
  requirements?: TicketRequirements;
}

/** Error paths that have an input in the form; anything else is shown in the summary alert. */
const PLACED = /^(customer\.(name|email|phone)|attendees\.\d+\.(name|phone|dateOfBirth|validDate|showSessionId))$/;

const NO_REQS: TicketRequirements = { dateOfBirth: false, date: false, showSession: false };
const blankAttendee = (): Attendee => ({ name: '', phone: '' });
const inputCls = 'rounded-xl border border-line bg-white px-3 py-2 font-normal';

type Phase = 'form' | 'working' | 'done';

export function BuyButton({ ticketId, name, unitPrice, currency, maxQuantity, requirements = NO_REQS }: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<ConfirmedBooking | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([blankAttendee()]);
  // The first attendee's name follows the customer name until the user edits it.
  const [firstNameEdited, setFirstNameEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<ShowSession[] | null>(null);

  // Keep exactly one attendee block per ticket.
  useEffect(() => {
    setAttendees((a) => (a.length === qty ? a : a.length > qty ? a.slice(0, qty) : [...a, ...Array.from({ length: qty - a.length }, blankAttendee)]));
  }, [qty]);

  useEffect(() => {
    if (open && requirements.showSession && sessions === null) getShowSessions(ticketId).then(setSessions);
  }, [open, requirements.showSession, sessions, ticketId]);

  const setAttendee = (i: number, patch: Partial<Attendee>) => {
    setAttendees((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    setFieldErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[`attendees.${i}.${k}`];
      return next;
    });
  };
  const shownAttendees = attendees.map((a, i) => (i === 0 && !firstNameEdited ? { ...a, name: customerName } : a));
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const available = quote?.availableQuantity ?? maxQuantity;
  const max = Math.max(1, Math.min(MAX_PER_BOOKING, available ?? MAX_PER_BOOKING));
  const cur = quote?.currency ?? currency;
  const fmt = (n: number, digits = 0) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const money = (n: number) => fmt(n, Number.isInteger(n) ? 0 : 2);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    // A modal <dialog> sits in the top layer, above Razorpay's iframe, so hide it while checkout is open.
    const show = open && !paying;
    if (show && !d.open) d.showModal();
    if (!show && d.open) d.close();
  }, [open, paying]);

  // Fetch the server quote (GST included) whenever the quantity changes, debounced.
  useEffect(() => {
    if (!open || phase === 'done') return;
    const ctrl = new AbortController();
    setQuoting(true);
    setQuoteError('');
    const t = setTimeout(() => {
      getQuote(ticketId, qty, ctrl.signal)
        .then((q) => {
          setQuote(q);
          if (q.availableQuantity != null && qty > q.availableQuantity && q.availableQuantity > 0) setQty(Math.min(MAX_PER_BOOKING, q.availableQuantity));
        })
        .catch((e) => {
          if (ctrl.signal.aborted) return;
          setQuote(null);
          setQuoteError(e instanceof Error ? e.message : 'Could not fetch the price.');
        })
        .finally(() => !ctrl.signal.aborted && setQuoting(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [open, phase, qty, ticketId]);

  const close = () => {
    if (phase === 'working') return;
    setOpen(false);
    if (phase === 'done') {
      setPhase('form');
      setResult(null);
      setQty(1);
      setAttendees([blankAttendee()]);
      setFirstNameEdited(false);
      setCustomerName('');
    }
    setFieldErrors({});
    setError('');
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const customer = { name: String(f.get('name')).trim(), email: String(f.get('email')).trim(), phone: String(f.get('phone')).trim() };
    const list: Attendee[] = shownAttendees.slice(0, qty).map((a) => {
      const out: Attendee = { name: a.name.trim() };
      if (a.phone?.trim()) out.phone = a.phone.trim();
      if (requirements.dateOfBirth && a.dateOfBirth) out.dateOfBirth = a.dateOfBirth;
      if (requirements.date && a.validDate) out.validDate = a.validDate;
      if (requirements.showSession && a.showSessionId?.trim()) out.showSessionId = a.showSessionId.trim();
      return out;
    });
    setError('');
    setFieldErrors({});
    setPhase('working');
    try {
      if (!(await loadRazorpay())) throw new Error('Could not load the payment window. Check your connection and try again.');
      const { booking, payment } = await createBooking(ticketId, qty, list, customer);
      setPaying(true);
      let paid: boolean;
      try {
        paid = await openCheckout(payment, { description: `${name} × ${qty}`, customer });
      } finally {
        setPaying(false);
      }
      if (!paid) {
        setError(`Payment wasn’t completed. Your booking ${booking.bookingNumber} is on hold: try again in a few minutes.`);
        setPhase('form');
        return;
      }
      setResult(await confirmPayment(booking.bookingNumber));
      setPhase('done');
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) {
        const map: Record<string, string> = {};
        const unplaced: string[] = [];
        for (const e of err.errors) {
          const k = fieldKey(e.path);
          map[k] = e.message;
          if (!PLACED.test(k)) unplaced.push(e.path ? `${k}: ${e.message}` : e.message);
        }
        setFieldErrors(map);
        setError(unplaced.length ? unplaced.join(' · ') : 'Please fix the highlighted fields.');
      } else setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('form');
    }
  }

  const soldOut = quote ? !quote.isAvailable : false;
  // If the quote endpoint is unavailable, show an estimate from the listed price; the booking API still charges the real amount.
  const fallback = !quote && !!quoteError && !quoting;
  const canPay = phase === 'form' && !quoting && (!!quote || fallback) && !soldOut;
  const gstPct = quote ? `${+(quote.gstRate > 1 ? quote.gstRate : quote.gstRate * 100).toFixed(2)}%` : '';
  const step = (d: number) => setQty((q) => Math.max(1, Math.min(max, q + d)));
  const stepBtn =
    'grid size-11 place-items-center rounded-full border border-line bg-white text-xl font-semibold text-navy transition hover:-translate-y-0.5 hover:border-blue-bright hover:text-blue-bright hover:shadow-md active:scale-90 disabled:pointer-events-none disabled:opacity-35';
  const Skel = ({ w }: { w: string }) => <span className={`bk-shimmer inline-block h-4 align-middle ${w}`} />;

  return (
    <>
      <LimeButton label={`Buy · ${fmt(unitPrice)}`} className="w-full" onClick={() => setOpen(true)} />
      {mounted &&
        createPortal(
          <dialog
            ref={dialog}
            onClose={() => phase !== 'working' && setOpen(false)}
            onCancel={(e) => phase === 'working' && e.preventDefault()}
            onClick={(e) => e.target === e.currentTarget && close()}
            className="bk-dialog m-auto w-[min(34rem,calc(100vw-1.5rem))] text-navy"
            aria-labelledby={`bk-title-${ticketId}`}
          >
            <div className="bk-card relative max-h-[min(94vh,56rem)] overflow-y-auto overscroll-contain rounded-[28px] bg-cream shadow-[0_40px_120px_-20px_rgba(16,27,70,0.6)] ring-1 ring-white/40">
              {/* Header */}
              <header className="relative shrink-0 overflow-hidden bg-navy-deep px-7 pb-7 pt-6 text-white sm:px-9">
                <span className="bk-orb -left-10 -top-16 size-48 bg-blue-bright" />
                <span className="bk-orb -bottom-20 right-0 size-44 bg-coral [animation-delay:-4s]" />
                <span className="bk-orb right-24 top-0 size-24 bg-lime opacity-30 [animation-delay:-2s]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime">{phase === 'done' ? 'Booking confirmed' : 'KILF 2027 · Pass'}</p>
                    <h2 id={`bk-title-${ticketId}`} className="font-display mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
                      {phase === 'done' ? 'You’re in!' : name}
                    </h2>
                    {phase !== 'done' && (
                      <p className="mt-1.5 text-sm text-white/70">
                        {quote ? money(quote.unitPrice) : fmt(unitPrice)} per ticket · GST extra
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-white backdrop-blur transition hover:rotate-90 hover:bg-white/20"
                  >
                    ×
                  </button>
                </div>
              </header>

              {phase === 'done' && result ? (
                <div className="bk-stagger px-7 py-7 sm:px-9">
                  <p className="text-muted">{result.status === 'CONFIRMED' ? 'Payment received.' : 'Payment is being verified; your tickets will be emailed.'} Booking number</p>
                  <p className="numeral mt-1 text-3xl text-blue-bright">{result.bookingNumber}</p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {result.ticketInstances?.map((t) => (
                      <li key={t.ticketNumber} className="rounded-2xl border border-line bg-white p-4 text-center shadow-sm">
                        {t.qrCode && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.qrCode} alt={`QR code for ticket ${t.ticketNumber}`} className="mx-auto size-36" />
                        )}
                        <p className="mt-2 break-all text-xs text-muted">{t.ticketNumber}</p>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <LimeButton label="Done" className="mt-8 w-full" onClick={close} />
                  </div>
                </div>
              ) : (
                <form onSubmit={submit}>
                  {/* Details */}
                  <div className="bk-stagger grid gap-3.5 px-7 pb-6 pt-7 sm:px-9">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Your details</p>
                    <div className="bk-field">
                      <input id={`bk-name-${ticketId}`} name="name" autoComplete="name" required minLength={2} placeholder=" " value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      <label htmlFor={`bk-name-${ticketId}`}>Full name</label>
                    </div>
                    <FieldErr msg={fieldErrors['customer.name']} />
                    <div className="bk-field">
                      <input id={`bk-email-${ticketId}`} name="email" type="email" autoComplete="email" required placeholder=" " />
                      <label htmlFor={`bk-email-${ticketId}`}>Email</label>
                    </div>
                    <FieldErr msg={fieldErrors['customer.email']} />
                    <div className="bk-field">
                      <input id={`bk-phone-${ticketId}`} name="phone" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[0-9+ ]{10,15}" placeholder=" " />
                      <label htmlFor={`bk-phone-${ticketId}`}>Phone</label>
                    </div>
                    <FieldErr msg={fieldErrors['customer.phone']} />

                    {shownAttendees.map((a, i) => {
                      const id = (f: string) => `bk-a${i}-${f}-${ticketId}`;
                      const err = (f: string) => fieldErrors[`attendees.${i}.${f}`];
                      return (
                        <fieldset key={i} className="mt-3 grid gap-3 rounded-2xl border border-line bg-white/60 p-4">
                          <legend className="px-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Attendee {i + 1}</legend>
                          <div className="bk-field">
                            <input
                              id={id('name')}
                              required
                              minLength={2}
                              placeholder=" "
                              value={a.name}
                              aria-invalid={!!err('name')}
                              onChange={(e) => {
                                if (i === 0) setFirstNameEdited(true);
                                setAttendee(i, { name: e.target.value });
                              }}
                            />
                            <label htmlFor={id('name')}>Name</label>
                          </div>
                          <FieldErr msg={err('name')} />
                          <div className="bk-field">
                            <input id={id('phone')} type="tel" inputMode="tel" pattern="[0-9+ ]{10,15}" placeholder=" " value={a.phone ?? ''} aria-invalid={!!err('phone')} onChange={(e) => setAttendee(i, { phone: e.target.value })} />
                            <label htmlFor={id('phone')}>Phone (optional)</label>
                          </div>
                          <FieldErr msg={err('phone')} />
                          {requirements.dateOfBirth && (
                            <>
                              <label className="grid gap-1 text-sm font-semibold">
                                Date of birth
                                <input type="date" required className={inputCls} value={a.dateOfBirth ?? ''} aria-invalid={!!err('dateOfBirth')} onChange={(e) => setAttendee(i, { dateOfBirth: e.target.value })} />
                              </label>
                              <FieldErr msg={err('dateOfBirth')} />
                            </>
                          )}
                          {requirements.date && (
                            <>
                              <label className="grid gap-1 text-sm font-semibold">
                                Day of visit
                                <input type="date" required className={inputCls} value={a.validDate ?? ''} aria-invalid={!!err('validDate')} onChange={(e) => setAttendee(i, { validDate: e.target.value })} />
                              </label>
                              <FieldErr msg={err('validDate')} />
                            </>
                          )}
                          {requirements.showSession && (
                            <>
                              <label className="grid gap-1 text-sm font-semibold">
                                Show session
                                {sessions && sessions.length > 0 ? (
                                  <select required className={inputCls} value={a.showSessionId ?? ''} aria-invalid={!!err('showSessionId')} onChange={(e) => setAttendee(i, { showSessionId: e.target.value })}>
                                    <option value="" disabled>
                                      Choose a session
                                    </option>
                                    {sessions.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    required
                                    pattern="[0-9a-fA-F\-]{36}"
                                    placeholder={sessions === null ? 'Loading sessions…' : 'Session ID'}
                                    className={inputCls}
                                    value={a.showSessionId ?? ''}
                                    aria-invalid={!!err('showSessionId')}
                                    onChange={(e) => setAttendee(i, { showSessionId: e.target.value })}
                                  />
                                )}
                              </label>
                              <FieldErr msg={err('showSessionId')} />
                            </>
                          )}
                        </fieldset>
                      );
                    })}
                    {error && (
                      <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral-ink">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Bottom: quantity + price + pay */}
                  <div className="border-t border-line bg-white px-7 pb-6 pt-5 sm:px-9">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Tickets</p>
                        <p className="text-xs text-muted">
                          {soldOut ? 'Sold out' : available != null && available <= 50 ? `Only ${available} left · ` : ''}
                          {!soldOut && `max ${max} per booking`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 rounded-full bg-sky p-1.5" role="group" aria-label="Quantity">
                        <button type="button" className={stepBtn} onClick={() => step(-1)} disabled={qty <= 1 || phase !== 'form'} aria-label="Fewer tickets">
                          −
                        </button>
                        <span key={qty} className="bk-num numeral w-8 text-center text-2xl text-navy" aria-live="polite">
                          {qty}
                        </span>
                        <button type="button" className={stepBtn} onClick={() => step(1)} disabled={qty >= max || phase !== 'form' || soldOut} aria-label="More tickets">
                          +
                        </button>
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-1.5 text-sm">
                      <div className="flex justify-between text-muted">
                        <dt>Subtotal</dt>
                        <dd>{quote && !quoting ? money(quote.subtotalAmount) : fallback ? money(unitPrice * qty) : <Skel w="w-16" />}</dd>
                      </div>
                      <div className="flex justify-between text-muted">
                        <dt>GST{gstPct && ` (${gstPct})`}</dt>
                        <dd>{quote && !quoting ? money(quote.gstAmount) : fallback ? 'Added at checkout' : <Skel w="w-12" />}</dd>
                      </div>
                    </dl>

                    {fallback && <p className="mt-3 text-xs text-muted">Price unavailable right now. The final amount, including GST, is shown at payment.</p>}

                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-dashed border-line pt-4">
                      <p>
                        <span className="eyebrow block text-muted">Total</span>
                        {quote && !quoting ? (
                          <span key={quote.totalAmount} className="bk-num numeral text-3xl text-blue-bright">
                            {money(quote.totalAmount)}
                          </span>
                        ) : fallback ? (
                          <span className="numeral text-3xl text-blue-bright">
                            {fmt(unitPrice * qty)}
                            <span className="ml-1.5 align-middle text-sm font-semibold text-muted">+ GST</span>
                          </span>
                        ) : (
                          <span className="bk-shimmer mt-1 block h-8 w-28" />
                        )}
                      </p>
                      <LimeButton
                        type="submit"
                        label={phase === 'working' ? 'Processing…' : soldOut ? 'Sold out' : 'Pay now'}
                        disabled={!canPay}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="-mt-1.5 text-xs font-semibold text-coral-ink">
      {msg}
    </p>
  ) : null;
}
