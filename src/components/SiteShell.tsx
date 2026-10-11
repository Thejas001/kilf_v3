import '@/styles/global.css';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { Header } from './Header';
import { Footer } from './Footer';
import { Analytics } from './Analytics';
import { RevealBoot } from './RevealBoot';
import { useTranslations, type Lang } from '@/i18n/ui';

/**
 * The <html>/<body> shell shared by both root layouts (app/(en)/layout.tsx
 * and app/ml/layout.tsx — see the "Multiple root layouts" pattern). lang is
 * hardcoded per tree rather than parsed from the URL, so neither layout needs
 * a dynamic API and every route stays statically generated.
 */
export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = useTranslations(lang);
  return (
    <html lang={lang} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="sitemap" href="/sitemap.xml" />
        <meta name="theme-color" content="#FFFDF4" />
        <Analytics />
      </head>
      <body className="min-h-dvh">
        {/* Runs before hydration: sets has-js/js and restores the paused-motion preference. */}
        <Script id="kilf-boot" strategy="beforeInteractive">
          {`(function () {
  var d = document.documentElement;
  d.classList.add('has-js');
  try { if (localStorage.getItem('kilf-motion') === 'paused') d.dataset.motion = 'paused'; } catch (e) {}
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('js');
  setTimeout(function () { if (!window.__kilfReveal) d.classList.remove('js'); }, 3500);
})();`}
        </Script>
        <a href="#main" className="sr-only z-[100] rounded-full bg-lime px-5 py-3 font-bold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {t('nav.skip')}
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer lang={lang} />
        <RevealBoot />
      </body>
    </html>
  );
}
