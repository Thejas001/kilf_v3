import type { Metadata } from 'next';
import { localizePath, isTranslated, type Lang } from '@/i18n/ui';
import { site } from '@/lib/site';

export const siteUrl = process.env.SITE_URL || 'https://kilf.vercel.app';

interface PageMeta {
  lang: Lang;
  /** The language-neutral path, e.g. "/about" (no /ml prefix, no trailing slash except "/"). */
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}

/** Malayalam URLs whose content hasn't been translated yet fall back to English. */
export const isFallback = (lang: Lang, path: string) => lang === 'ml' && !isTranslated(path);

/** Per-page <head> metadata: title, canonical, hreflang alternates, OG/Twitter. */
export function buildMetadata({ lang, path, title, description, image = '/og-image.jpg', noindex = false }: PageMeta): Metadata {
  const translated = isTranslated(path);
  const fallback = isFallback(lang, path);
  const canonicalPath = fallback ? localizePath(path, 'en') : localizePath(path, lang);
  const canonical = new URL(canonicalPath, siteUrl).href;
  const fullTitle = path === '/' ? title : `${title} · KILF 2027`;
  const ogImage = new URL(image, siteUrl).href;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical,
      languages: translated
        ? {
            en: new URL(localizePath(path, 'en'), siteUrl).href,
            ml: new URL(localizePath(path, 'ml'), siteUrl).href,
            'x-default': new URL(localizePath(path, 'en'), siteUrl).href,
          }
        : undefined,
    },
    robots: noindex || fallback ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: 'KILF 2027',
      title: fullTitle,
      description,
      url: canonical,
      locale: lang === 'ml' ? 'ml_IN' : 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Kollam International Literature Festival 2027 — a lake-and-book illustration' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

/** The festival Event JSON-LD, for pages that render <JsonLd data={buildEventJsonLd()} />. */
export function buildEventJsonLd() {
  const ogImage = new URL('/og-image.jpg', siteUrl).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'Festival',
    name: `${site.name} (KILF) 2027`,
    alternateName: 'KILF 2027',
    description: `The first edition of the ${site.name}: 100+ speakers across literature, cinema, music, theatre, art and ideas on the shore of Ashtamudi Lake, Kollam, Kerala.`,
    startDate: site.startISO,
    endDate: site.endISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: ['ml', 'en'],
    url: new URL('/', siteUrl).href,
    image: [ogImage],
    location: site.venues.map((v) => ({
      '@type': 'Place',
      name: v.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kollam',
        addressRegion: 'Kerala',
        addressCountry: 'IN',
      },
    })),
    organizer: {
      '@type': 'Organization',
      name: site.organiser,
      email: site.email,
      url: new URL('/', siteUrl).href,
    },
  };
}
