'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { LimeButton } from '@/components/LimeButton';
import {
  ApiError,
  MAX_PER_BOOKING,
  confirmPayment,
  createBooking,
  getQuote,
  getShowSessions,
  loadRazorpay,
  openCheckout,
  type Attendee,
  type ConfirmedBooking,
  type CreatedBooking,
  type Customer,
  type ShowSession,
  type TicketRequirements,
  type Quote,
} from '@/lib/bookings';
import { loadSession, requireLogin, updateProfile, type Guest } from '@/lib/auth';
import { useGuest } from '@/lib/useGuest';
import { rememberBooking } from '@/lib/myBookings';
import { localizePath, parsePath } from '@/i18n/ui';
import { usePathname } from 'next/navigation';

interface Props {
  ticketId: string;
  name: string;
  unitPrice: number;
  currency: string;
  maxQuantity?: number;
  requirements?: TicketRequirements;
}

const NO_REQS: TicketRequirements = { dateOfBirth: false, date: false, showSession: false };
const inputCls = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 font-normal';
/** The booking API rejects customer phones shorter than this. */
const validPhone = (p: string) => /^[0-9+ ]{6,15}$/.test(p.trim());
const LOGIN_REASON = 'Log in to book your tickets. We’ll take you straight to ticket selection.';

type Phase = 'form' | 'working' | 'done';

/**
 * Buy → (log in if needed) → choose quantity → Book now → Razorpay.
 * The modal never opens for a signed-out visitor: Buy asks them to log in first and,
 * on success, opens ticket selection automatically. Buyer details come from the account.
 */
export function BuyButton({ ticketId, name, unitPrice, currency, maxQuantity, requirements = NO_REQS }: Props) {
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<ConfirmedBooking | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState<ShowSession[] | null>(null);
  const guest = useGuest();
  const profileHref = localizePath('/profile', parsePath(usePathname()).lang);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** Synchronous lock: a double click can't start two bookings before React re-renders. */
  const busy = useRef(false);
  /** Unpaid booking from this modal, reused if the guest retries payment with the same selection. */
  const held = useRef<{ key: string; created: CreatedBooking } | null>(null);

  // If the session ends while the modal is open (logout in another tab, refresh failed), close it.
  useEffect(() => {
    if (open && guest === null && phase !== 'working') setOpen(false);
  }, [open, guest, phase]);

  useEffect(() => {
    if (open && requirements.showSession && sessions === null) getShowSessions(ticketId).then(setSessions);
  }, [open, requirements.showSession, sessions, ticketId]);

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

  // Server quote (GST included) whenever the quantity changes, debounced. The backend decides the amount.
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

  /** Buy: check the session (fresh, so an expired token is caught now), log in if needed, then open selection. */
  async function onBuy() {
    if (opening) return;
    setOpening(true);
    try {
      const g = (await loadSession(true)) ?? (await requireLogin(LOGIN_REASON));
      if (!g) return; // closed the login popup: nothing to resume
      setError('');
      setOpen(true);
    } finally {
      setOpening(false);
    }
  }

  const close = () => {
    if (phase === 'working') return;
    setOpen(false);
    if (phase === 'done') {
      setPhase('form');
      setResult(null);
      setQty(1);
      setVisitDate('');
      setSessionId('');
      held.current = null;
    }
    setError('');
  };

  const accountPhone = guest?.phone?.trim() || '';
  const needPhone = !validPhone(accountPhone);

  async function book(g: Guest, customer: Customer, attendees: Attendee[]): Promise<CreatedBooking> {
    const key = JSON.stringify([g.id, qty, attendees]);
    if (held.current?.key === key) return held.current.created;
    const created = await createBooking(ticketId, qty, attendees, customer);
    held.current = { key, created };
    rememberBooking(g.id, created.booking.bookingNumber);
    return created;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current || phase !== 'form') return;
    busy.current = true;
    setError('');
    setPhase('working');
    try {
      let g = guest ?? (await requireLogin(LOGIN_REASON));
      if (!g) throw new Error('Log in to continue.');
      const buyerPhone = needPhone ? phone.trim() : accountPhone;
      if (!validPhone(buyerPhone)) throw new Error('Enter a valid phone number (6–15 digits).');
      const attendeesFor = (who: Guest): Attendee[] =>
        Array.from({ length: qty }, () => {
          const a: Attendee = { name: who.name };
          if (requirements.date) a.validDate = visitDate;
          if (requirements.showSession) a.showSessionId = sessionId.trim();
          return a;
        });

      if (!(await loadRazorpay())) throw new Error('Could not load the payment window. Check your connection and try again.');

      let created: CreatedBooking;
      try {
        created = await book(g, { name: g.name, email: g.email, phone: buyerPhone }, attendeesFor(g));
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) throw err;
        // Session expired and could not be refreshed: log in again and retry once with the same selection.
        g = await requireLogin('Your session expired. Log in again to finish your booking.');
        if (!g) throw new Error('Your session expired. Log in again to finish your booking.');
        created = await book(g, { name: g.name, email: g.email, phone: buyerPhone }, attendeesFor(g));
      }
      // Remember a phone typed here so the guest isn't asked again (best effort).
      if (needPhone) updateProfile({ name: g.name, phone: buyerPhone }).catch(() => {});

      setPaying(true);
      let paid: boolean;
      try {
        paid = await openCheckout(created.payment, { description: `${name} × ${qty}`, customer: { name: g.name, email: g.email, phone: buyerPhone } });
      } finally {
        setPaying(false);
      }
      if (!paid) {
        setError(`Payment wasn’t completed. Booking ${created.booking.bookingNumber} is on hold: press Book now to pay for it.`);
        setPhase('form');
        return;
      }
      held.current = null;
      setResult(await confirmPayment(created.booking.bookingNumber));
      setPhase('done');
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setError(err.errors.map((x) => x.message).join(' · '));
      else setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('form');
    } finally {
      busy.current = false;
    }
  }

  const soldOut = quote ? !quote.isAvailable : false;
  // If the quote endpoint is unavailable, show an estimate from the listed price; the booking API still charges the real amount.
  const fallback = !quote && !!quoteError && !quoting;
  const canBook = phase === 'form' && !quoting && (!!quote || fallback) && !soldOut;
  const gstPct = quote ? `${+(quote.gstRate > 1 ? quote.gstRate : quote.gstRate * 100).toFixed(2)}%` : '';
  const step = (d: number) => {
    setQty((q) => Math.max(1, Math.min(max, q + d)));
    setError('');
  };
  const stepBtn =
    'grid size-10 place-items-center rounded-full border border-line bg-white text-xl font-semibold text-navy transition hover:border-blue-bright hover:text-blue-bright active:scale-90 disabled:pointer-events-none disabled:opacity-35';
  const Skel = ({ w }: { w: string }) => <span className={`bk-shimmer inline-block h-4 align-middle ${w}`} />;
  const unit = quote ? quote.unitPrice : unitPrice;
  const availability = soldOut ? 'Sold out' : available != null ? (available <= 50 ? `Only ${available} left` : `${available} available`) : 'Available';

  return (
    <>
      <LimeButton label={opening ? 'Checking…' : `Buy · ${fmt(unitPrice)}`} className="w-full" onClick={onBuy} disabled={opening} />
      {mounted &&
        createPortal(
          <dialog
            ref={dialog}
            onClose={() => phase !== 'working' && !paying && setOpen(false)}
            onCancel={(e) => phase === 'working' && e.preventDefault()}
            onClick={(e) => e.target === e.currentTarget && close()}
            className="bk-dialog m-auto w-[min(32rem,calc(100vw-1.5rem))] text-navy"
            aria-labelledby={`bk-title-${ticketId}`}
          >
            <div className="bk-card relative max-h-[min(94vh,56rem)] overflow-y-auto overscroll-contain rounded-[28px] bg-cream shadow-[0_40px_120px_-20px_rgba(16,27,70,0.6)] ring-1 ring-white/40">
              <header className="relative overflow-hidden bg-navy-deep px-7 pb-6 pt-6 text-white sm:px-9">
                <span className="bk-orb -left-10 -top-16 size-48 bg-blue-bright" />
                <span className="bk-orb -bottom-20 right-0 size-44 bg-coral [animation-delay:-4s]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-lime">{phase === 'done' ? 'Booking confirmed' : 'Book tickets'}</p>
                    <h2 id={`bk-title-${ticketId}`} className="font-display mt-2 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em]">
                      {phase === 'done' ? 'You’re in!' : 'KILF 2027'}
                    </h2>
                    {phase !== 'done' && guest && <p className="mt-1 text-sm text-white/70">Booking as {guest.name} · {guest.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-white transition hover:rotate-90 hover:bg-white/20"
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
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <LimeButton href={`${profileHref}?booking=${encodeURIComponent(result.bookingNumber)}`} label="View in My bookings" className="w-full" />
                    <LimeButton label="Done" variant="ghost" arrow={false} className="w-full" onClick={close} />
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="px-7 py-6 sm:px-9">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Ticket type</p>
                  {/* Ticket type row: name, price, availability, quantity, line subtotal */}
                  <div className={`mt-2 rounded-2xl border bg-white p-4 ${soldOut ? 'border-line opacity-60' : 'border-blue-bright/40'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted">
                          {money(unit)} per ticket · <span className={soldOut ? 'font-semibold text-coral-ink' : ''}>{availability}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-sky p-1" role="group" aria-label={`Quantity of ${name}`}>
                        <button type="button" className={stepBtn} onClick={() => step(-1)} disabled={qty <= 1 || phase !== 'form'} aria-label="Fewer tickets">
                          −
                        </button>
                        <span key={qty} className="bk-num numeral w-7 text-center text-xl text-navy" aria-live="polite">
                          {qty}
                        </span>
                        <button type="button" className={stepBtn} onClick={() => step(1)} disabled={qty >= max || phase !== 'form' || soldOut} aria-label="More tickets">
                          +
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 flex justify-between border-t border-dashed border-line pt-3 text-sm">
                      <span className="text-muted">
                        {qty} × {money(unit)} · max {max} per booking
                      </span>
                      <span className="font-semibold">{quote && !quoting ? money(quote.subtotalAmount) : fallback ? money(unitPrice * qty) : <Skel w="w-14" />}</span>
                    </p>
                  </div>

                  {/* Only what the ticket itself needs: never name/email again. */}
                  {(requirements.date || requirements.showSession || needPhone) && (
                    <div className="mt-5 grid gap-3">
                      {requirements.date && (
                        <label className="grid gap-1 text-sm font-semibold">
                          Day of visit
                          <input type="date" required className={inputCls} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                        </label>
                      )}
                      {requirements.showSession && (
                        <label className="grid gap-1 text-sm font-semibold">
                          Show session
                          {sessions && sessions.length > 0 ? (
                            <select required className={inputCls} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
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
                              value={sessionId}
                              onChange={(e) => setSessionId(e.target.value)}
                            />
                          )}
                        </label>
                      )}
                      {needPhone && (
                        <label className="grid gap-1 text-sm font-semibold">
                          Phone for your tickets
                          <input type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+ ]{6,15}" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
                          <span className="text-xs font-normal text-muted">Asked once; saved to your account.</span>
                        </label>
                      )}
                    </div>
                  )}

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
                  {fallback && <p className="mt-2 text-xs text-muted">Price unavailable right now. The final amount, including GST, is shown at payment.</p>}

                  {error && (
                    <p role="alert" className="mt-4 rounded-xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral-ink">
                      {error}
                    </p>
                  )}

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
                    <LimeButton type="submit" label={phase === 'working' ? 'Processing…' : soldOut ? 'Sold out' : 'Book now'} disabled={!canBook} />
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
