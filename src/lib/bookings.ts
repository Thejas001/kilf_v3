/** Browser calls go through the /backend rewrite (next.config.mjs) so the API's CORS allow-list doesn't matter. */
import { BACKEND_PROXY } from './api';
import { authFetch } from './auth';

const base = () => BACKEND_PROXY;

export interface Customer {
  name: string;
  email: string;
  /** Optional: sent only when the account has one. */
  phone?: string;
}

export interface RazorpayPayment {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreatedBooking {
  booking: { id: string; bookingNumber: string; status: string; quantity: number; totalAmount: string; currency: string };
  payment: RazorpayPayment;
}

export interface ConfirmedBooking {
  bookingNumber: string;
  status: string;
  quantity: number;
  totalAmount: string;
  currency: string;
  ticketInstances?: { ticketNumber: string; qrCode?: string; status: string }[];
}

/** One per ticket. The optional fields are sent only when the ticket requires them. */
export interface Attendee {
  name: string;
  phone?: string;
  /** YYYY-MM-DD, age-restricted tickets */
  dateOfBirth?: string;
  /** YYYY-MM-DD within the festival dates, day passes */
  validDate?: string;
  /** uuid, show/session tickets */
  showSessionId?: string;
}

/** Which extra attendee fields a ticket needs, derived from the ticket object the API returns. */
export interface TicketRequirements {
  dateOfBirth: boolean;
  date: boolean;
  showSession: boolean;
}

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly errors: FieldError[] = []) {
    super(message);
  }
}

/** Backend error paths look like `body.attendees.0.name`; drop the `body.` prefix to match form keys. */
export const fieldKey = (path: string) => path.replace(/^body\./, '');

/** Sent with the guest's token when signed in, so the backend can tie the booking to their account. */
async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const errors: FieldError[] = Array.isArray(json?.errors)
      ? json.errors
          .filter((e: { message?: unknown }) => e && typeof e.message === 'string')
          .map((e: { path?: unknown; message: string }) => ({ path: String(e.path ?? ''), message: e.message }))
      : [];
    throw new ApiError(json?.message || 'Something went wrong. Please try again.', res.status, errors);
  }
  return json.data as T;
}

export const createBooking = (ticketId: string, quantity: number, attendees: Attendee[], customer: Customer) =>
  call<CreatedBooking>('/api/bookings', { ticketId, quantity, attendees, customer });

export interface ShowSession {
  id: string;
  label: string;
}

/** Show sessions a ticket can be booked for. Returns [] on any failure (the form then asks for a session id). */
export async function getShowSessions(ticketId: string): Promise<ShowSession[]> {
  try {
    const res = await fetch(`${base()}/api/show-sessions?${new URLSearchParams({ ticketId })}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success || !Array.isArray(json.data)) return [];
    return json.data.map((s: Record<string, unknown>) => {
      const when = s.startTime ?? s.startsAt ?? s.date;
      const title = String(s.name ?? s.title ?? (s.show as { title?: string } | undefined)?.title ?? 'Session');
      const t = when ? new Date(String(when)) : null;
      return { id: String(s.id), label: t && !isNaN(+t) ? `${title} · ${t.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : title };
    });
  } catch {
    return [];
  }
}
export const confirmPayment = (bookingNumber: string) => call<ConfirmedBooking>(`/api/bookings/${encodeURIComponent(bookingNumber)}/confirm-payment`);

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: () => void;
  modal: { ondismiss: () => void };
}
declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => { open: () => void; on: (e: string, cb: (r: { error?: { description?: string } }) => void) => void };
  }
}

export function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Opens Razorpay Checkout. Resolves true on payment success, false if the user closes it; rejects on payment failure. */
export function openCheckout(p: RazorpayPayment, opts: { description: string; customer: Customer }): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: p.keyId,
      order_id: p.orderId,
      amount: p.amount,
      currency: p.currency,
      name: 'KILF 2027',
      description: opts.description,
      prefill: { name: opts.customer.name, email: opts.customer.email, contact: opts.customer.phone ?? "" },
      theme: { color: '#173ccb' },
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed.')));
    rzp.open();
  });
}

/** Max tickets the API accepts in one booking/quote request. */
export const MAX_PER_BOOKING = 20;

export interface Quote {
  unitPrice: number;
  gstRate: number;
  subtotalAmount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  availableQuantity: number | null;
  isAvailable: boolean;
}

type RawQuote = { [K in keyof Quote]: Quote[K] extends number ? number | string : Quote[K] };

/** Server-side price for `quantity` tickets: GST added on top, matching what the booking will charge. */
export async function getQuote(ticketId: string, quantity: number, signal?: AbortSignal): Promise<Quote> {
  const res = await fetch(`${base()}/api/bookings/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId, quantity }),
    signal,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Could not fetch the price.');
  const q = json.data as RawQuote;
  return {
    unitPrice: Number(q.unitPrice),
    gstRate: Number(q.gstRate),
    subtotalAmount: Number(q.subtotalAmount),
    gstAmount: Number(q.gstAmount),
    totalAmount: Number(q.totalAmount),
    currency: q.currency || 'INR',
    availableQuantity: q.availableQuantity == null ? null : Number(q.availableQuantity),
    isAvailable: Boolean(q.isAvailable),
  };
}
