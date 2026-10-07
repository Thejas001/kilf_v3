import QRCode from 'qrcode';
import { Logo } from './Logo';
import { Placeholder } from './Placeholder';
import { LimeButton } from './LimeButton';
import { MotionToggle } from './MotionToggle';
import RippleField from './motion/RippleField';
import { site, isPlaceholder } from '@/lib/site';
import { siteUrl } from '@/lib/seo';
import { logoUrl } from '@/lib/images';
import { useTranslations, localizePath, type Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

export async function Footer({ lang }: Props) {
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);
  const logoFile = logoUrl('kilf-logo-white');
  const url = new URL(lp('/'), siteUrl).href;
  const qr = await QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    color: { dark: '#13308C', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });

  const cols = [
    {
      title: t('footer.festival'),
      links: [
        ['/about', t('nav.about')],
        ['/programme', t('nav.programme')],
        ['/speakers', t('nav.speakers')],
        ['/khasak', t('nav.khasak')],
        ['/youth', t('nav.youth')],
      ],
    },
    {
      title: t('footer.quick'),
      links: [
        ['/passes', t('nav.passes')],
        ['/get-involved', t('nav.involved')],
        ['/visit', t('nav.visit')],
        ['/partners', t('nav.partners')],
        ['/faq', t('nav.faq')],
      ],
    },
  ];

  return (
    <footer className="on-dark waves-light relative overflow-hidden bg-footer text-white">
      <RippleField tone="dark" x={92} y={18} size={620} squash={0.4} />
      <div className="container-kilf relative">
        {/* Closing call */}
        <section className="flex flex-col gap-10 pb-16 pt-20 sm:pb-20 sm:pt-24 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pt-28" aria-labelledby="closing-h">
          <div>
            <p className="eyebrow text-white/75" data-reveal>
              {t('footer.closing.kicker')}
            </p>
            <h2 id="closing-h" className={`display mt-6 ${lang === 'ml' ? 'text-[2.2rem] sm:text-[3rem] lg:text-[3.6rem]' : 'text-[2.6rem] sm:text-[3.7rem] lg:text-[4.4rem]'}`} data-reveal>
              {t('footer.closing.h')}
              <br />
              <span className="text-grad-warm">{t('footer.closing.accent')}</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:pb-3" data-reveal>
            <LimeButton href={lp('/get-involved#register')} label={t('cta.register')} variant="white" size="lg" className="min-w-[12rem] justify-between !gap-10" />
          </div>
        </section>

        <div className="grid gap-12 border-t border-white/15 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.25fr] lg:gap-10">
          <div>
            <a href={lp('/')} className="inline-flex min-h-11 items-center text-white">
              <Logo tone="dark" className="h-12" decorative src={logoFile} />
              <span className="sr-only">KILF 2027 — {t('nav.home')}</span>
            </a>
            <ul className="mt-6 space-y-1.5 text-[0.95rem] text-white/85">
              <li>{t('site.dates')}</li>
              <li>
                {t('site.city')} · {t('site.organisedBy')} {site.organiser}
              </li>
            </ul>
          </div>

          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow text-white/60">{col.title}</h2>
              <ul className="mt-4">
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <a href={lp(href)} className="inline-flex min-h-10 items-center text-[0.97rem] text-white/90 transition-colors hover:text-lime">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="eyebrow text-white/60">{t('footer.contact')}</h2>
            <ul className="mt-4 text-[0.97rem]">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center break-all text-white hover:text-lime">
                  {site.email}
                </a>
              </li>
              <li>
                {site.socialUrl && !isPlaceholder(site.socialHandle) ? (
                  <a href={site.socialUrl} className="inline-flex min-h-10 items-center text-white hover:text-lime" rel="noopener" target="_blank">
                    {site.socialHandle}
                  </a>
                ) : (
                  <span className="inline-flex min-h-10 items-center text-white">
                    <Placeholder value={site.socialHandle} />
                  </span>
                )}
              </li>
              <li>
                <a href={lp('/contact')} className="inline-flex min-h-10 items-center text-white/90 hover:text-lime">
                  {t('nav.contact')}
                </a>
              </li>
            </ul>
            <figure className="mt-5 flex items-center gap-4">
              <div className="size-20 shrink-0 bg-white p-1.5 [&_svg]:size-full" role="img" aria-label={`QR code linking to ${url}`} dangerouslySetInnerHTML={{ __html: qr }} />
              <figcaption className="max-w-[9rem] text-sm leading-snug text-white/70">{t('footer.scan')}</figcaption>
            </figure>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 text-sm text-white/75 md:flex-row md:items-center md:justify-between">
          <p>KILF 2027 · {lang === 'ml' ? 'വാക്കുകൾ ലോകത്തെ കണ്ടുമുട്ടുന്നിടം' : 'Where words meet the world'}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>
              © 2027 {site.shortName}. {t('footer.rights')}
            </p>
            <a href={lp('/privacy')} className="inline-flex min-h-11 items-center hover:text-lime">
              {t('nav.privacy')}
            </a>
            <MotionToggle lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}
