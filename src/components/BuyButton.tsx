'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { LimeButton } from '@/components/LimeButton';
import { confirmPayment, createBooking, loadRazorpay, openCheckout, type ConfirmedBooking } from '@/lib/bookings';

interface Props {
  ticketId: string;
  name: string;
  unitPrice: number;
  currency: string;
  maxQuantity?: number;
}

type Phase = 'form' | 'working' | 'done';

const input = 'mt-1.5 block w-full rounded-none border border-line bg-white px-4 py-3 text-base text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20';

export function BuyButton({ ticketId, name, unitPrice, currency, maxQuantity }: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<ConfirmedBooking | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const max = Math.min(10, maxQuantity ?? 10);
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    // A modal <dialog> sits in the top layer, above Razorpay's iframe, so hide it while checkout is open.
    const show = open && !paying;
    if (show && !d.open) d.showModal();
    if (!show && d.open) d.close();
  }, [open, paying]);

  const close = () => {
    if (phase === 'working') return;
    setOpen(false);
    if (phase === 'done') {
      setPhase('form');
      setResult(null);
      setQty(1);
    }
    setError('');
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const customer = { name: String(f.get('name')).trim(), email: String(f.get('email')).trim(), phone: String(f.get('phone')).trim() };
    setError('');
    setPhase('working');
    try {
      if (!(await loadRazorpay())) throw new Error('Could not load the payment window. Check your connection and try again.');
      const { booking, payment } = await createBooking(ticketId, qty, customer);
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
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('form');
    }
  }

  return (
    <>
      <LimeButton label={`Buy · ${fmt(unitPrice)}`} className="w-full" onClick={() => setOpen(true)} />
      {mounted &&
        createPortal(
          <dialog
            ref={dialog}
            onClose={() => phase !== 'working' && setOpen(false)}
            onCancel={(e) => phase === 'working' && e.preventDefault()}
            className="m-auto max-h-[90vh] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto border border-line bg-cream p-0 text-navy backdrop:bg-ink/60"
          >
            <div className="p-7 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">{phase === 'done' ? 'You’re in!' : name}</h2>
                <button type="button" onClick={close} aria-label="Close" className="-mr-2 -mt-2 size-10 text-2xl leading-none text-muted hover:text-navy">
                  ×
                </button>
              </div>

              {phase === 'done' && result ? (
                <div className="mt-4">
                  <p className="text-muted">{result.status === 'CONFIRMED' ? 'Payment received.' : 'Payment is being verified; your tickets will be emailed.'} Booking number</p>
                  <p className="numeral mt-1 text-3xl text-blue-bright">{result.bookingNumber}</p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {result.ticketInstances?.map((t) => (
                      <li key={t.ticketNumber} className="border border-line bg-white p-4 text-center">
                        {t.qrCode && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.qrCode} alt={`QR code for ticket ${t.ticketNumber}`} className="mx-auto size-36" />
                        )}
                        <p className="mt-2 break-all text-xs text-muted">{t.ticketNumber}</p>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={close} className="mt-8 font-semibold text-blue-bright underline underline-offset-4">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-5 grid gap-4">
                  <label className="block text-sm font-semibold">
                    Quantity
                    <input className={input} type="number" min={1} max={max} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))} required />
                  </label>
                  <label className="block text-sm font-semibold">
                    Full name
                    <input className={input} name="name" autoComplete="name" required minLength={2} />
                  </label>
                  <label className="block text-sm font-semibold">
                    Email
                    <input className={input} name="email" type="email" autoComplete="email" required />
                  </label>
                  <label className="block text-sm font-semibold">
                    Phone
                    <input className={input} name="phone" type="tel" inputMode="numeric" autoComplete="tel" required pattern="[0-9+ ]{10,15}" />
                  </label>
                  {error && (
                    <p role="alert" className="text-sm font-semibold text-coral-ink">
                      {error}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-5">
                    <p>
                      <span className="eyebrow block text-muted">Total</span>
                      <span className="numeral text-3xl text-blue-bright">{fmt(unitPrice * qty)}</span>
                    </p>
                    <LimeButton type="submit" label={phase === 'working' ? 'Processing…' : 'Pay now'} disabled={phase === 'working'} />
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
