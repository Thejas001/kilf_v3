import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getSpeakers } from '@/lib/content';
import { hasBio } from '@/lib/speakers';

const englishPaths = [
  '/',
  '/about',
  '/contact',
  '/faq',
  '/get-involved',
  '/khasak',
  '/partners',
  '/passes',
  '/privacy',
  '/programme',
  '/speakers',
  '/visit',
  '/youth',
];

// Malayalam pages that still fall back to English are noindexed, so keep
// them out of the sitemap too (see translatedPaths in src/i18n/ui.ts).
const malayalamPaths = ['/ml', '/ml/about'];

export default function sitemap(): MetadataRoute.Sitemap {
  const speakerSlugs = getSpeakers()
    .filter((s) => hasBio(s.body))
    .map((s) => s.id);

  const url = (path: string) => new URL(path, siteUrl).href;

  return [
    ...englishPaths.map((path) => ({ url: url(path) })),
    ...speakerSlugs.map((slug) => ({ url: url(`/speakers/${slug}`) })),
    ...malayalamPaths.map((path) => ({ url: url(path) })),
  ];
}
