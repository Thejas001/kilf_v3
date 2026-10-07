/**
 * Festival facts used across the site. Edit here, not in the pages.
 * Anything wrapped in [BRACKETS] is a placeholder, see TODO.md.
 */
export const site = {
  name: 'Kollam International Literature Festival',
  shortName: 'KILF',
  edition: 'The first edition',
  year: 2027,
  email: 'kilf2027@gmail.com',
  organiser: 'Capital Media',
  socialHandle: '[@HANDLE]',
  socialUrl: '', // e.g. https://instagram.com/kilf2027, fill in with the handle
  city: 'Kollam, Kerala',
  datesLabel: '31 December 2026 – 4 January 2027',
  datesShort: '31 Dec 2026 – 4 Jan 2027',
  days: 5,
  startISO: '2026-12-31T00:00:00+05:30',
  endISO: '2027-01-04T23:59:59+05:30',
  startDate: '2026-12-31',
  endDate: '2027-01-04',
  taglines: {
    main: 'Where words meet the world.',
    water: 'Eight arms of water. One embrace of words.',
    live: 'Some stories you read. Others, you live.',
  },
  stats: [
    { value: '100+', label: 'Speakers' },
    { value: '10,000+', label: 'Audience' },
    { value: '1', label: 'Shore' },
  ],
  venues: [
    {
      id: 'sngcc',
      name: 'Sreenarayana Guru Cultural Centre',
      area: 'Kollam',
      lat: '8.8975715',
      lng: '76.5883002',
      mapsQuery: 'Sreenarayana Guru Cultural Centre, Kollam, Kerala',
    },
    {
      id: '8point',
      name: '8 Point Art Cafe',
      area: 'Asramam, Kollam',
      lat: '8.8964338',
      lng: '76.5861519',
      mapsQuery: '8 Point Art Cafe, Kollam, Kerala',
    },
    {
      id: 'ashramam',
      name: 'Ashramam Maidan',
      area: 'Asramam, Kollam',
      lat: '8.8950704',
      lng: '76.5964617',
      mapsQuery: 'Ashramam Maidan, Kollam, Kerala',
    },
  ],
} as const;

export const isPlaceholder = (v: string) => /^\[.*\]$/.test(v.trim());

export const env = {
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || '',
  formEndpointPartner: process.env.NEXT_PUBLIC_FORM_ENDPOINT_PARTNER || '',
  formEndpointNewsletter: process.env.NEXT_PUBLIC_FORM_ENDPOINT_NEWSLETTER || '',
  ga4: process.env.NEXT_PUBLIC_GA4_ID || '',
  plausible: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
  partnerCallUrl: process.env.NEXT_PUBLIC_PARTNER_CALL_URL || '',
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL || '',
};
