/**
 * The signed-in guest's bookings.
 *
 * Primary source (the contract the profile page is built for):
 *   GET /api/auth/bookings                   -> { success, data: Booking[] }
 *   GET /api/auth/bookings/:bookingNumber    -> { success, data: Booking (with ticketInstances) }
 * Both take only the bearer token; the backend scopes them to the guest in the token.
 *
 * Until the backend ships those routes (it answers 404 "Route not found"), we fall back to the
 * bookings made from this browser while signed in, each looked up with the public
 * GET /api/bookings/:bookingNumber?email= route using the account's own email.
 */
import { BACKEND_PROXY } from './api';
import { authFetch, type Guest } from './auth';

export interface TicketInstance {
  ticketNumber: string;
  qrCode?: string;
  status: string;
  attendeeName?: string;
  validDate?: string;
  showSession?: string;
}

export interface MyBooking {
  bookingNumber: string;
  festival: string;
  ticketName: string;
  ticketType?: string;
  quantity: number;
  totalAmount: number;
  subtotalAmount?: number;
  gstAmount?: number;
  currency: string;
  status: string;
  paymentStatus: string;
  bookedAt?: string;
  validFrom?: string;
  validTo?: string;
  payment?: { method?: string; reference?: string; paidAt?: string };
  customer?: { name?: string; email?: string; phone?: string };
  tickets: TicketInstance[];
}

/* ---------- Remembering bookings made in this browser (fallback only) ---------- */

const key = (guestId: string) => `kilf-bookings:${guestId}`;
const readLocal = (guestId: string): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key(guestId)) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
export function rememberBooking(guestId: string, bookingNumber: string) {
  try {
    const list = readLocal(guestId).filter((n) => n !== bookingNumber);
    localStorage.setItem(key(guestId), JSON.stringify([bookingNumber, ...list].slice(0, 100)));
  } catch {}
}

/* ---------- Normalising whatever shape the API returns ---------- */

type R = Record<string, unknown>;
const str = (v: unknown) => (v == null ? undefined : String(v));
const num = (v: unknown) => (v == null || v === '' ? undefined : Number(v));
const obj = (v: unknown): R => (v && typeof v === 'object' ? (v as R) : {});

function normalise(raw: unknown): MyBooking {
  const b = obj(raw);
  const ticket = obj(b.ticket);
  const festival = obj(b.festival ?? ticket.festival);
  const payment = obj(b.payment ?? (Array.isArray(b.payments) ? b.payments[0] : undefined));
  const customer = obj(b.customer);
  const instances = (b.ticketInstances ?? b.tickets ?? []) as unknown[];
  return {
    bookingNumber: String(b.bookingNumber ?? b.id ?? ''),
    festival: str(festival.name ?? festival.title ?? b.festivalName) ?? 'KILF 2027',
    ticketName: str(ticket.name ?? b.ticketName) ?? 'Festival pass',
    ticketType: str(ticket.ticketType ?? b.ticketType),
    quantity: num(b.quantity) ?? instances.length,
    totalAmount: num(b.totalAmount) ?? 0,
    subtotalAmount: num(b.subtotalAmount),
    gstAmount: num(b.gstAmount),
    currency: str(b.currency) ?? 'INR',
    status: str(b.status) ?? 'PENDING',
    // payment is null for free bookings.
    paymentStatus: str(b.paymentStatus ?? payment.status) ?? (b.status === 'CONFIRMED' ? (num(b.totalAmount) ? 'SUCCESS' : 'FREE') : 'PENDING'),
    bookedAt: str(b.createdAt ?? b.bookedAt),
    validFrom: str(ticket.validFrom ?? festival.startDate ?? b.validFrom),
    validTo: str(ticket.validTo ?? festival.endDate ?? b.validTo),
    payment: {
      method: str(payment.method ?? payment.provider),
      reference: str(payment.razorpayPaymentId ?? payment.providerPaymentId ?? payment.paymentId ?? payment.id),
      paidAt: str(payment.paidAt ?? payment.capturedAt ?? payment.updatedAt),
    },
    customer: { name: str(customer.name ?? b.customerName), email: str(customer.email ?? b.customerEmail), phone: str(customer.phone ?? b.customerPhone) },
    tickets: instances.map((x) => {
      const t = obj(x);
      const att = obj(t.attendee);
      const session = obj(t.showSession);
      return {
        ticketNumber: String(t.ticketNumber ?? t.id ?? ''),
        qrCode: str(t.qrCode ?? t.qrCodeUrl),
        status: str(t.status) ?? 'ACTIVE',
        attendeeName: str(t.attendeeName ?? att.name),
        validDate: str(t.validDate ?? att.validDate),
        showSession: str(session.name ?? session.title ?? session.startTime),
      };
    }),
  };
}

export class BookingsError extends Error {}

const routeMissing = (res: Response, json: R | null) => res.status === 404 && /route not found/i.test(String(json?.message ?? ''));

async function lookupPublic(bookingNumber: string, email: string): Promise<MyBooking | null> {
  const res = await fetch(`${BACKEND_PROXY}/api/bookings/${encodeURIComponent(bookingNumber)}?${new URLSearchParams({ email })}`);
  const json = await res.json().catch(() => null);
  return res.ok && json?.success ? normalise(json.data?.booking ?? json.data) : null;
}

/** All bookings for the signed-in guest, newest first. `fallback` is true when using this browser's history. */
export async function listMyBookings(guest: Guest): Promise<{ bookings: MyBooking[]; fallback: boolean }> {
  let res: Response;
  try {
    res = await authFetch('/api/auth/bookings?page=1&limit=100');
  } catch {
    throw new BookingsError('Could not reach the server. Check your connection and try again.');
  }
  const json = await res.json().catch(() => null);
  if (res.ok && json?.success) {
    const list = (Array.isArray(json.data) ? json.data : (json.data?.bookings ?? json.data?.items ?? [])) as unknown[];
    return { bookings: sortNewest(list.map(normalise)), fallback: false };
  }
  if (!routeMissing(res, json)) throw new BookingsError(json?.message || 'Could not load your bookings.');

  const found = await Promise.all(readLocal(guest.id).map((n) => lookupPublic(n, guest.email).catch(() => null)));
  return { bookings: sortNewest(found.filter((b): b is MyBooking => !!b)), fallback: true };
}

export async function getMyBooking(guest: Guest, bookingNumber: string): Promise<MyBooking | null> {
  const res = await authFetch(`/api/auth/bookings/${encodeURIComponent(bookingNumber)}`);
  const json = await res.json().catch(() => null);
  if (res.ok && json?.success) return normalise(json.data?.booking ?? json.data);
  if (routeMissing(res, json)) return readLocal(guest.id).includes(bookingNumber) ? lookupPublic(bookingNumber, guest.email) : null;
  if (res.status === 404 || res.status === 403) return null;
  throw new BookingsError(json?.message || 'Could not load this booking.');
}

const sortNewest = (l: MyBooking[]) => l.sort((a, b) => (b.bookedAt ?? '').localeCompare(a.bookedAt ?? ''));
