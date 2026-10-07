/** Browser calls go through the /backend rewrite (next.config.mjs) so the API's CORS allow-list doesn't matter. */
const base = () => '/backend';

export interface Customer {
  name: string;
  email: string;
  phone: string;
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

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message || 'Something went wrong. Please try again.');
  return json.data as T;
}

export const createBooking = (ticketId: string, quantity: number, customer: Customer) => call<CreatedBooking>('/api/bookings', { ticketId, quantity, customer });
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
      prefill: { name: opts.customer.name, email: opts.customer.email, contact: opts.customer.phone },
      theme: { color: '#173ccb' },
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed.')));
    rzp.open();
  });
}
