import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Icon } from '@/components/Icon';
import { LakeArt } from '@/components/LakeArt';
import { LimeButton } from '@/components/LimeButton';
import { StatCard } from '@/components/StatCard';
import { TextLink } from '@/components/TextLink';
import RippleField from '@/components/motion/RippleField';
import { aboutQA } from '@/i18n/about-qa';
import { site } from '@/lib/site';
import { useTranslations, localizePath, type Lang, type UIKey } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const expect = [
  ['chat', 'about.e1'],
  ['books', 'about.e2'],
  ['mic', 'about.e3'],
  ['mask', 'about.e4'],
  ['bowl', 'about.e5'],
  ['moon', 'about.e6'],
] as const;
const values = ['about.v1', 'about.v2', 'about.v3', 'about.v4'] as const;
const matters = [
  ['anchor', 'about.m1'],
  ['calendar', 'about.m2'],
  ['scroll', 'about.m3'],
  ['leaf', 'about.m4'],
] as const;

export function About({ lang }: Props) {
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);

  return (
    <>
      <PageHero chapter={1} label={t('about.chapter')} text={t('about.h')} accent={t('about.accent')}>
        <div className="mt-12 grid gap-6 border-t border-line pt-10 text-lg leading-relaxed md:grid-cols-2 md:gap-12">
          <p className="text-navy/90">{t('about.p1')}</p>
          <p className="text-muted">{t('about.p2')}</p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-3 sm:gap-8">
          <li>
            <StatCard value="100+" label={t('home.stats.speakers')} />
          </li>
          <li>
            <StatCard value="10,000+" label={t('home.stats.audience')} />
          </li>
          <li>
            <StatCard value="1" label={t('home.stats.shore')} note={t('home.stats.shoreNote')} />
          </li>
        </ul>
      </PageHero>

      {/* Why KILF */}
      <section className="on-dark waves-light relative overflow-hidden bg-blue text-white" aria-labelledby="vision-h">
        <RippleField tone="dark" x={88} y={50} size={640} squash={1} rings={3} />
        <div className="container-kilf relative grid gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-5">
            <ChapterLabel n={2} label={t('about.vision.chapter')} tone="dark" />
            <Headline id="vision-h" text={t('about.vision.h')} accent={t('about.vision.accent')} tone="blue" accentStyle="gradient" className="mt-6" />
          </div>
          <p className="font-display text-[1.45rem] font-medium leading-snug tracking-[-0.02em] text-white/90 sm:text-[1.75rem] lg:col-span-7 lg:self-end" data-reveal>
            {t('about.vision.p')}
          </p>
        </div>
      </section>

      <Section tone="cream" labelledby="why-h">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-6">
            <ChapterLabel n={3} label={t('about.why.chapter')} />
            <Headline id="why-h" text={t('about.why.h')} accent={t('about.why.accent')} className="mt-6" />
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted lg:col-span-6 lg:pb-2">{t('about.why.p')}</p>
        </div>
        <figure className="relative mt-12">
          <LakeArt art="jetty" sizes="(min-width: 1280px) 1120px, 100vw" focus={[0.62, 0.5]} className="aspect-[4/3] w-full sm:aspect-[2/1] lg:aspect-[2.4/1]" />
        </figure>
      </Section>

      <Section tone="cream" rule labelledby="matters-h">
        <ChapterLabel n={4} label={lang === 'ml' ? 'കൊല്ലം' : 'Kollam'} />
        <Headline id="matters-h" text={t('about.matters.h')} accent={t('about.matters.accent')} className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {matters.map(([icon, key], i) => (
            <li key={key} className="flex min-h-[15rem] flex-col border-b border-r border-line p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="eyebrow text-navy" lang="en">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icon name={icon} size={28} className="text-blue-bright" />
              </div>
              <h3 className="mt-auto pt-10 font-display text-[1.4rem] font-semibold leading-tight tracking-[-0.03em] text-navy">{t(`${key}.t` as UIKey)}</h3>
              <p className="mt-2 text-muted">{t(`${key}.d` as UIKey)}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* What to expect */}
      <Section tone="cream" rule labelledby="expect-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <ChapterLabel n={5} label={t('about.expect.chapter')} />
            <Headline id="expect-h" text={t('about.expect.h')} accent={t('about.expect.accent')} className="mt-6" />
          </div>
          <TextLink href={lp('/programme')} label={t('home.day.link')} />
        </div>
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {expect.map(([icon, key]) => (
            <li key={key} className="flex gap-5 border-b border-r border-line p-7">
              <Icon name={icon} size={30} className="mt-0.5 shrink-0 text-blue-bright" />
              <div>
                <h3 className="font-display text-[1.35rem] font-semibold tracking-[-0.03em]">{t(`${key}.t` as UIKey)}</h3>
                <p className="mt-1.5 text-muted">{t(`${key}.d` as UIKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* What we believe */}
      <section className="bg-lime text-ink" aria-labelledby="values-h">
        <div className="container-kilf py-20 sm:py-24">
          <ChapterLabel n={6} label={t('about.values.chapter')} tone="lime" />
          <Headline id="values-h" text={t('about.values.h')} accent={t('about.values.accent')} tone="lime" className="mt-6" />
          <ol className="mt-12 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {values.map((key, i) => (
              <li key={key} className={['border-b border-ink/15 py-7 sm:px-6', i % 2 === 1 && 'sm:border-l', i > 0 && 'lg:border-l', 'lg:first:pl-0'].filter(Boolean).join(' ')}>
                <span className="numeral text-[2.6rem] text-blue" lang="en">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em]">{t(`${key}.t` as UIKey)}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/80">{t(`${key}.d` as UIKey)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section tone="sky" labelledby="qa-h">
        <ChapterLabel n={7} label={t('about.qa.chapter')} />
        <h2 id="qa-h" className="display mt-6 text-[2.15rem] text-navy sm:text-[2.9rem] lg:text-[3.4rem]">
          KILF,{' '}
          <span className="text-grad" lang="ml">
            ചുരുക്കത്തിൽ.
          </span>
        </h2>
        <dl className="mt-12 grid border-l border-t border-navy/15 md:grid-cols-2" lang="ml">
          {aboutQA.map((item, i) => (
            <div key={item.q} className={['border-b border-r border-navy/15 bg-cream p-7', i === 0 && 'md:col-span-2'].filter(Boolean).join(' ')}>
              <dt className="text-xl font-bold text-blue">{item.q}</dt>
              <dd className="mt-2 text-lg leading-relaxed text-navy">{item.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-kilf">
          <div className="flex flex-col items-start justify-between gap-6 border-y border-line py-8 sm:flex-row sm:items-center">
            <p className="text-lg">
              <span className="text-muted">{t('about.organised')}</span>
              <strong className="font-display text-2xl font-semibold tracking-[-0.03em]"> {site.organiser}.</strong>
            </p>
            <LimeButton href={lp('/contact')} label={t('nav.contact')} />
          </div>
        </div>
      </section>
    </>
  );
}
