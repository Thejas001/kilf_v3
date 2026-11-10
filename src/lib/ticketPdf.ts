'use client';

import QRCode from 'qrcode';
import type { MyBooking, TicketInstance } from './myBookings';

/**
 * QR image for a ticket. Uses the backend's own QR (what the Checker Dashboard
 * issued) when it is an inline image; otherwise encodes the ticket number, which
 * the checker's verify endpoint also accepts.
 */
export async function ticketQr(t: TicketInstance): Promise<string> {
  if (t.qrCode?.startsWith('data:image')) return t.qrCode;
  if (t.qrCode && /^https?:\/\//.test(t.qrCode)) {
    try {
      const blob = await (await fetch(t.qrCode)).blob();
      return await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
    } catch {}
  }
  return QRCode.toDataURL(t.qrCode || t.ticketNumber, { margin: 1, width: 320, errorCorrectionLevel: 'M', color: { dark: '#101b46', light: '#ffffff' } });
}

export const fmtDate = (d?: string, withTime = false) => {
  if (!d) return '';
  const t = new Date(d);
  if (isNaN(+t)) return d;
  return t.toLocaleString('en-IN', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};
export const validity = (b: MyBooking, t?: TicketInstance) =>
  t?.validDate ? fmtDate(t.validDate) : b.validFrom ? `${fmtDate(b.validFrom)}${b.validTo ? ` – ${fmtDate(b.validTo)}` : ''}` : '31 Dec 2026 – 4 Jan 2027';

/** One A6-ish page per ticket, saved as KILF-<booking>.pdf. jsPDF is loaded only when asked for. */
export async function downloadTickets(b: MyBooking, only?: TicketInstance) {
  const { jsPDF } = await import('jspdf');
  const tickets = only ? [only] : b.tickets;
  const doc = new jsPDF({ unit: 'mm', format: [105, 170] });
  const navy = '#101b46';
  const blue = '#173ccb';

  for (const [i, t] of tickets.entries()) {
    if (i) doc.addPage();
    doc.setFillColor(navy);
    doc.rect(0, 0, 105, 34, 'F');
    doc.setTextColor('#e7ef92');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('KOLLAM INTERNATIONAL LITERATURE FESTIVAL', 8, 10);
    doc.setTextColor('#ffffff');
    doc.setFontSize(17);
    doc.text(doc.splitTextToSize(b.ticketName, 89), 8, 20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${b.festival}  ·  Ticket ${i + 1} of ${tickets.length}`, 8, 29);

    const qr = await ticketQr(t);
    doc.addImage(qr, 'PNG', 22.5, 40, 60, 60);

    doc.setTextColor(blue);
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text(t.ticketNumber, 52.5, 107, { align: 'center' });

    const rows: [string, string][] = [
      ['Attendee', t.attendeeName || b.customer?.name || '—'],
      ['Valid', validity(b, t)],
      ...(t.showSession ? [['Show', t.showSession] as [string, string]] : []),
      ['Booking', b.bookingNumber],
      ['Status', t.status],
    ];
    let y = 118;
    for (const [k, v] of rows) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor('#6b7192');
      doc.text(k.toUpperCase(), 8, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(navy);
      doc.text(doc.splitTextToSize(v, 62), 35, y);
      y += 8;
    }
    doc.setDrawColor('#d9dcea');
    doc.setLineDashPattern([1, 1], 0);
    doc.line(8, 160, 97, 160);
    doc.setFontSize(7);
    doc.setTextColor('#6b7192');
    doc.text('Show this QR code at the gate. One entry per ticket.', 52.5, 165, { align: 'center' });
  }
  doc.save(`KILF-${b.bookingNumber}${only ? `-${only.ticketNumber}` : ''}.pdf`);
}
