'use client';

import { useCallback, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { LimeButton } from '@/components/LimeButton';
import * as auth from '@/lib/auth';
import { PASSWORD_HINT, validPassword, type Guest } from '@/lib/auth';
import { useGuest } from '@/lib/useGuest';
import { BookingsError, getMyBooking, listMyBookings, type MyBooking, type TicketInstance } from '@/lib/myBookings';
import { downloadTickets, fmtDate, ticketQr, validity } from '@/lib/ticketPdf';
import { localizePath, parsePath } from '@/i18n/ui';

type Tab = 'bookings' | 'account';

const money = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
const pretty = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function Chip({ value }: { value: string }) {
  const v = value.toUpperCase();
  const tone = /CONFIRMED|PAID|CAPTURED|ACTIVE|VALID|SUCCESS|FREE/.test(v)
    ? 'bg-lime/60 text-ink'
    : /USED|CHECKED/.test(v)
      ? 'bg-sky text-navy'
      : /CANCEL|FAIL|REFUND|EXPIRED/.test(v)
        ? 'bg-coral-soft text-coral-deep'
        : 'bg-[#fff1c9] text-[#7a5600]';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${tone}`}>{pretty(value)}</span>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[22px] border border-line bg-white p-5 shadow-[0_18px_40px_-28px_rgb(15_26_71/0.35)] sm:p-7 ${className}`}>{children}</div>;
}

function Alert({ kind = 'error', children }: { kind?: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const cls = { error: 'border-coral-ink bg-coral-soft text-coral-deep', ok: 'border-lime-deep bg-lime/40 text-navy', info: 'border-blue bg-sky text-navy' }[kind];
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`border-l-4 px-4 py-3 text-sm font-semibold ${cls}`}>
      {children}
    </p>
  );
}

const control =
  'block w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-navy transition-colors hover:border-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20 aria-[invalid=true]:border-coral-ink disabled:bg-sky/60 disabled:text-muted';

function Field({ label, error, hint, ...rest }: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={`${id}-d`} className={`${control} mt-1.5`} {...rest} />
      {(error || hint) && (
        <p id={`${id}-d`} className={`mt-1.5 text-[0.8rem] ${error ? 'font-semibold text-coral-ink' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Profile() {
  const guest = useGuest();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const lang = parsePath(pathname).lang;
  const bookingNo = params.get('booking');
  const tab: Tab = params.get('tab') === 'account' ? 'account' : 'bookings';

  const nav = useCallback((q: Record<string, string>) => router.push(`${pathname}${Object.keys(q).length ? `?${new URLSearchParams(q)}` : ''}`, { scroll: false }), [pathname, router]);

  if (guest === undefined) {
    return (
      <section className="container-kilf py-24" aria-busy="true">
        <span className="bk-shimmer block h-10 w-64" />
        <span className="bk-shimmer mt-4 block h-5 w-80 max-w-full" />
        <span className="bk-shimmer mt-10 block h-40 w-full" />
      </section>
    );
  }

  if (!guest) {
    return (
      <section className="waves relative bg-cream py-20 sm:py-28">
        <div className="container-kilf">
          <Card className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime text-ink">
              <Icon name="user" size={26} />
            </span>
            <h1 className="display mt-5 text-[2rem] text-navy sm:text-[2.4rem]">Your KILF account</h1>
            <p className="mt-2 text-muted">Log in to see your bookings, download tickets and manage your details.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <LimeButton label="Log in" onClick={() => auth.openLogin('login')} />
              <LimeButton label="Create an account" variant="ghost" arrow={false} onClick={() => auth.openLogin('register')} />
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <>
      <ProfileHero guest={guest} tab={bookingNo ? 'bookings' : tab} onTab={(t) => nav(t === 'bookings' ? {} : { tab: t })} />
      <section className="bg-cream pb-24 pt-10 sm:pt-14">
        <div className="container-kilf">
          {bookingNo ? (
            <BookingDetail guest={guest} bookingNumber={bookingNo} onBack={() => nav({})} />
          ) : tab === 'account' ? (
            <AccountPanel guest={guest} onLoggedOut={() => router.push(localizePath('/', lang))} />
          ) : (
            <BookingList guest={guest} onOpen={(n) => nav({ booking: n })} passesHref={localizePath('/passes', lang)} />
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- A. Overview ---------- */

function ProfileHero({ guest, tab, onTab }: { guest: Guest; tab: Tab; onTab: (t: Tab) => void }) {
  const tabs: [Tab, string, string][] = [
    ['bookings', 'My bookings', 'calendar'],
    ['account', 'Account', 'user'],
  ];
  return (
    <section className="on-dark relative overflow-hidden bg-navy-deep text-white">
      <span className="bk-orb -left-16 -top-24 size-72 bg-blue-bright" />
      <span className="bk-orb -bottom-28 right-10 size-64 bg-coral [animation-delay:-4s]" />
      <div className="container-kilf relative pt-12 sm:pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-lime font-display text-2xl font-bold uppercase text-ink sm:size-20 sm:text-3xl">
              {guest.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-lime">Your profile</p>
              <h1 className="display mt-1 truncate text-[2rem] sm:text-[2.6rem]">{guest.name}</h1>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="mail" size={16} /> {guest.email}
                </span>
                {guest.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="chat" size={16} /> {guest.phone}
                  </span>
                )}
                {guest.createdAt && <span>Member since {fmtDate(guest.createdAt)}</span>}
              </p>
            </div>
          </div>
          <LimeButton label="Edit profile" size="sm" variant="outline-light" onClick={() => onTab('account')} className="self-start sm:self-auto" />
        </div>
        <nav aria-label="Profile sections" className="mt-10 flex gap-1 overflow-x-auto">
          {tabs.map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className="inline-flex min-h-12 items-center gap-2 rounded-t-2xl px-5 text-sm font-semibold text-white/75 transition-colors hover:text-white aria-[current=page]:bg-cream aria-[current=page]:text-navy"
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ---------- B. My bookings ---------- */

function BookingList({ guest, onOpen, passesHref }: { guest: Guest; onOpen: (n: string) => void; passesHref: string }) {
  const [state, setState] = useState<{ bookings: MyBooking[]; fallback: boolean } | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    setState(null);
    listMyBookings(guest)
      .then(setState)
      .catch((e) => setError(e instanceof BookingsError ? e.message : 'Could not load your bookings.'));
  }, [guest]);
  useEffect(load, [load]);

  if (error)
    return (
      <Card>
        <Alert>{error}</Alert>
        <LimeButton label="Try again" variant="ghost" arrow={false} className="mt-5" onClick={load} />
      </Card>
    );
  if (!state)
    return (
      <div className="grid gap-4" aria-busy="true">
        {[0, 1].map((i) => (
          <span key={i} className="bk-shimmer block h-36 rounded-[22px]" />
        ))}
      </div>
    );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="display text-[1.7rem] text-navy">My bookings</h2>
        <p className="text-sm text-muted">
          {state.bookings.length} booking{state.bookings.length === 1 ? '' : 's'}
        </p>
      </div>
      {state.fallback && <Alert kind="info">Showing bookings made on this device. Your full booking history will appear here soon.</Alert>}
      {state.bookings.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-sky text-blue">
            <Icon name="calendar" size={26} />
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-navy">No bookings yet</p>
          <p className="mt-1 text-muted">When you book a pass it will show up here, with your QR tickets.</p>
          <LimeButton href={passesHref} label="Browse passes" className="mt-6" />
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {state.bookings.map((b) => (
            <li key={b.bookingNumber}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">{b.festival}</p>
                    <p className="mt-1 font-display text-xl font-semibold text-navy">{b.ticketName}</p>
                    {b.ticketType && <p className="text-sm text-muted">{pretty(b.ticketType)}</p>}
                  </div>
                  <Chip value={b.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Info k="Booking ID" v={<span className="font-mono text-blue">{b.bookingNumber}</span>} />
                  <Info k="Tickets" v={`${b.quantity}`} />
                  <Info k="Booked on" v={fmtDate(b.bookedAt) || '—'} />
                  <Info k="Valid" v={validity(b)} />
                  <Info k="Payment" v={<Chip value={b.paymentStatus} />} />
                  <Info k="Total" v={money(b.totalAmount, b.currency)} />
                </dl>
                <div className="mt-auto pt-6">
                  <LimeButton label="View details" size="sm" className="w-full" onClick={() => onOpen(b.bookingNumber)} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Info({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">{k}</dt>
      <dd className="mt-0.5 break-words font-semibold text-navy">{v}</dd>
    </div>
  );
}

/* ---------- C. Booking details ---------- */

function BookingDetail({ guest, bookingNumber, onBack }: { guest: Guest; bookingNumber: string; onBack: () => void }) {
  const [b, setB] = useState<MyBooking | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [pdf, setPdf] = useState('');

  useEffect(() => {
    setB(undefined);
    setError('');
    getMyBooking(guest, bookingNumber)
      .then(setB)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load this booking.'));
  }, [guest, bookingNumber]);

  async function download(t?: TicketInstance) {
    if (!b) return;
    setPdf(t?.ticketNumber ?? 'all');
    try {
      await downloadTickets(b, t);
    } catch {
      setError('Could not create the PDF. Please try again.');
    } finally {
      setPdf('');
    }
  }

  const back = (
    <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue hover:underline">
      <span aria-hidden="true">←</span> All bookings
    </button>
  );

  if (error && !b) return <div className="grid gap-4">{back}<Alert>{error}</Alert></div>;
  if (b === undefined) return <div className="grid gap-4" aria-busy="true">{back}<span className="bk-shimmer block h-64 rounded-[22px]" /></div>;
  if (b === null)
    return (
      <div className="grid gap-4">
        {back}
        <Card>
          <p className="font-display text-xl font-semibold text-navy">Booking not found</p>
          <p className="mt-1 text-muted">We couldn&rsquo;t find booking {bookingNumber} on your account.</p>
        </Card>
      </div>
    );

  const usable = b.tickets.length > 0 && b.status.toUpperCase() === 'CONFIRMED';

  return (
    <div className="grid gap-6">
      {back}
      <Card className="overflow-hidden !p-0">
        <div className="flex flex-col gap-4 bg-sky/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">{b.festival}</p>
            <h2 className="display mt-1 text-[1.8rem] text-navy">{b.ticketName}</h2>
            <p className="mt-1 font-mono text-sm text-blue">{b.bookingNumber}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip value={b.status} />
            {usable && (
              <LimeButton label={pdf === 'all' ? 'Preparing PDF…' : 'Download tickets (PDF)'} size="sm" disabled={!!pdf} onClick={() => download()} />
            )}
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-2">
          <div>
            <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Booking</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info k="Ticket type" v={b.ticketType ? pretty(b.ticketType) : b.ticketName} />
              <Info k="Tickets" v={b.quantity} />
              <Info k="Booked on" v={fmtDate(b.bookedAt, true) || '—'} />
              <Info k="Valid" v={validity(b)} />
              {b.customer?.name && <Info k="Booked by" v={b.customer.name} />}
              {b.customer?.phone && <Info k="Phone" v={b.customer.phone} />}
            </dl>
          </div>
          <div>
            <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted">Payment</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info k="Status" v={<Chip value={b.paymentStatus} />} />
              {b.payment?.paidAt && <Info k="Paid on" v={fmtDate(b.payment.paidAt, true)} />}
              {b.subtotalAmount != null && <Info k="Subtotal" v={money(b.subtotalAmount, b.currency)} />}
              {b.gstAmount != null && <Info k="GST" v={money(b.gstAmount, b.currency)} />}
              <Info k="Total" v={<span className="text-blue-bright">{money(b.totalAmount, b.currency)}</span>} />
              {b.payment?.method && <Info k="Method" v={pretty(b.payment.method)} />}
              {b.payment?.reference && <Info k="Reference" v={<span className="font-mono text-xs">{b.payment.reference}</span>} />}
            </dl>
          </div>
        </div>
      </Card>

      {error && <Alert>{error}</Alert>}

      <div>
        <h3 className="display text-[1.5rem] text-navy">Your tickets</h3>
        {b.tickets.length === 0 ? (
          <Card className="mt-4">
            <p className="text-muted">
              {usable ? 'Tickets are being issued.' : 'Tickets are issued once payment is confirmed.'} They will appear here with their QR codes.
            </p>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {b.tickets.map((t, i) => (
              <TicketCard key={t.ticketNumber} b={b} t={t} n={i + 1} busy={pdf === t.ticketNumber} onDownload={usable ? () => download(t) : undefined} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TicketCard({ b, t, n, busy, onDownload }: { b: MyBooking; t: TicketInstance; n: number; busy: boolean; onDownload?: () => void }) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    ticketQr(t).then(setQr).catch(() => setQr(''));
  }, [t]);
  return (
    <li className="relative flex flex-col overflow-hidden rounded-[22px] border border-line bg-white text-center shadow-sm">
      <div className="flex items-center justify-between bg-navy-deep px-4 py-2.5 text-left text-white">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-lime">Ticket {n}</span>
        <Chip value={t.status} />
      </div>
      <div className="p-5">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR code for ticket ${t.ticketNumber}`} className="mx-auto size-48 [image-rendering:pixelated]" />
        ) : (
          <span className="bk-shimmer mx-auto block size-48" />
        )}
        <p className="mt-3 break-all font-mono text-sm font-semibold text-blue">{t.ticketNumber}</p>
        <p className="mt-2 font-semibold text-navy">{t.attendeeName || b.customer?.name || 'Attendee'}</p>
        <p className="text-sm text-muted">Valid {validity(b, t)}</p>
        {t.showSession && <p className="text-sm text-muted">{t.showSession}</p>}
      </div>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 border-t border-dashed border-line text-sm font-semibold text-blue transition-colors hover:bg-sky/50 disabled:opacity-60"
        >
          <Icon name="download" size={18} />
          {busy ? 'Preparing…' : 'Download PDF'}
        </button>
      )}
    </li>
  );
}

/* ---------- D. Account management ---------- */

function AccountPanel({ guest, onLoggedOut }: { guest: Guest; onLoggedOut: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <EditProfile guest={guest} />
      <div className="grid content-start gap-6">
        <ChangePassword />
        <Card>
          <h2 className="font-display text-xl font-semibold text-navy">Log out</h2>
          <p className="mt-1 text-sm text-muted">Sign out of KILF on this device.</p>
          <LimeButton
            label="Log out"
            variant="ghost"
            arrow={false}
            className="mt-5"
            onClick={async () => {
              await auth.logout();
              onLoggedOut();
            }}
          />
        </Card>
      </div>
    </div>
  );
}

function EditProfile({ guest }: { guest: Guest }) {
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 2 || name.trim().length > 100) er.name = 'Enter your name (2–100 characters).';
    if (phone.trim() && !/^[0-9+ ]{10,15}$/.test(phone.trim())) er.phone = 'Enter a valid mobile number.';
    setErrors(er);
    setMsg(null);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      // An empty phone clears it on the server.
      const g = await auth.updateProfile({ name: name.trim(), phone: phone.trim() || null });
      setName(g.name);
      setPhone(g.phone ?? '');
      setMsg({ kind: 'ok', text: 'Profile saved.' });
    } catch (err) {
      if (err instanceof auth.AuthError && err.fieldErrors.length) {
        const fe: Record<string, string> = {};
        for (const x of err.fieldErrors) fe[x.path.replace(/^body./, '')] = x.message;
        setErrors(fe);
      }
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Could not save your profile.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold text-navy">Profile information</h2>
      <p className="mt-1 text-sm text-muted">Used to fill in your bookings. Your email is your login and can&rsquo;t be changed here.</p>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
        <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={errors.name} />
        <Field label="Email" value={guest.email} disabled />
        <Field label="Mobile number" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+91 98765 43210" error={errors.phone} />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Info k="Member since" v={fmtDate(guest.createdAt) || '—'} />
          <Info k="Last login" v={fmtDate(guest.lastLoginAt ?? undefined, true) || '—'} />
        </dl>
        {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
        <LimeButton type="submit" label={busy ? 'Saving…' : 'Save changes'} disabled={busy} className="justify-self-start" />
      </form>
    </Card>
  );
}

function ChangePassword() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.current) er.current = 'Enter your current password.';
    if (!validPassword(f.next)) er.next = PASSWORD_HINT;
    if (f.confirm !== f.next) er.confirm = 'Passwords do not match.';
    setErrors(er);
    setError('');
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await auth.changePassword(f.current, f.next, f.confirm);
      // Every session is revoked server-side, so sign straight back in.
      auth.requireLogin('Password changed. Log in with your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password.');
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold text-navy">Change password</h2>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
        <Field label="Current password" type="password" autoComplete="current-password" value={f.current} onChange={set('current')} error={errors.current} />
        <Field label="New password" type="password" autoComplete="new-password" value={f.next} onChange={set('next')} error={errors.next} hint={PASSWORD_HINT} />
        <Field label="Confirm new password" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={errors.confirm} />
        {error && <Alert>{error}</Alert>}
        <LimeButton type="submit" label={busy ? 'Updating…' : 'Update password'} disabled={busy} className="justify-self-start" />
      </form>
    </Card>
  );
}
