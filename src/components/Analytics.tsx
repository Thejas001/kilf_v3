import Script from 'next/script';
import { env } from '@/lib/site';

/**
 * Analytics slot. Set NEXT_PUBLIC_GA4_ID (e.g. G-XXXXXXX) or
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. kilf.in). Nothing loads if both are empty.
 */
export function Analytics() {
  const { ga4, plausible } = env;
  if (plausible) {
    return <Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive" />;
  }
  if (ga4) {
    return (
      <>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', '${ga4}', { anonymize_ip: true });`}
        </Script>
      </>
    );
  }
  return null;
}
