import { z } from 'zod';

const ticketSchema = z.object({
  id: z.string(),
  festivalId: z.string().optional(),
  name: z.string(),
  description: z.string().nullish(),
  ticketType: z.string().nullish(),
  price: z.union([z.string(), z.number()]),
  currency: z.string().default('INR'),
  availableQuantity: z.number().nullish(),
  salesStart: z.string().nullish(),
  salesEnd: z.string().nullish(),
});
const responseSchema = z.object({ success: z.boolean(), data: z.array(ticketSchema) });

export type Ticket = z.infer<typeof ticketSchema>;

/** Fetches tickets from the backend. Returns null on any failure so callers can fall back to static content. */
export async function fetchTickets(): Promise<Ticket[] | null> {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://api.kilf.in').replace(/\/$/, '');
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/tickets?page=1&limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const parsed = responseSchema.safeParse(await res.json());
    if (!parsed.success || !parsed.data.success || parsed.data.data.length === 0) return null;
    return parsed.data.data;
  } catch {
    return null;
  }
}

export function formatPrice(price: string | number, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(price));
}

export function isOnSale(t: Ticket, now = new Date()) {
  if (t.availableQuantity != null && t.availableQuantity <= 0) return false;
  if (t.salesStart && new Date(t.salesStart) > now) return false;
  if (t.salesEnd && new Date(t.salesEnd) < now) return false;
  return true;
}
