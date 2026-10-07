import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';
import { SpeakerCard } from '@/components/SpeakerCard';
import { Section } from '@/components/Section';
import { Badge } from '@/components/Badge';
import { LakeArt } from '@/components/LakeArt';
import { KhasakBook } from '@/components/art/KhasakBook';
import { PaperBoats } from '@/components/art/PaperBoats';
import { WaysIn } from '@/components/blocks/WaysIn';
import { InvolvedCards } from '@/components/blocks/InvolvedCards';
import RippleField from '@/components/motion/RippleField';
import Marquee from '@/components/motion/Marquee';
import { HomeScroll } from './HomeScroll';
import { getSpeakers, getStrands } from '@/lib/content';
import { site } from '@/lib/site';
import { useTranslations, localizePath, type Lang, type UIKey } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

export function Home({ lang }: Props) {
  const t = useTranslations(lang);
  const lp = (p: string) => localizePath(p, lang);
  const ml = lang === 'ml';

  const speakers = getSpeakers()
    .filter((s) => s.data.featured)
    .sort((a, b) => a.data.order - b.data.order)
    .slice(0, 8);
  const strands = getStrands().sort((a, b) => a.data.order - b.data.order);

  const facts = [
    { value: 100, pad: 0, suffix: '+', label: t('home.stats.speakers') },
    { value: 10000, pad: 0, suffix: '+', label: t('home.stats.audience') },
    { value: strands.length, pad: 2, suffix: '', label: t('home.facts.strands') },
    { value: site.venues.length, pad: 2, suffix: '', label: t('home.facts.venues') },
  ];

  return (
    <div data-home>
      <HomeScroll />

      {/* Hero: the lake illustration covers the whole section, and its water is live */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-cream text-navy lg:min-h-[min(100svh,66rem)]" data-hero aria-labelledby="hero-h">
        <div className="hero-art relative order-2 h-[24rem] sm:h-[32rem] lg:absolute lg:inset-0 lg:-z-10 lg:h-auto" data-hero-art>
          <LakeArt
            art="hero"
            priority
            sizes="(max-width: 639px) 194vw, (max-width: 1023px) 160vw, (max-aspect-ratio: 97/50) 194vh, 100vw"
            imgClassName="object-[74%_100%] sm:object-[82%_100%] lg:object-[100%_100%]"
            className="art-settle size-full"
          />
          <div className="hero-mist pointer-events-none absolute inset-0" aria-hidden="true"></div>
        </div>

        <div className="container-kilf pointer-events-none relative order-1 flex flex-col justify-center pb-6 pt-[calc(var(--hh)+2rem)] lg:flex-1 lg:pb-24 lg:pt-[calc(var(--hh)+2.5rem)]" data-hero-copy>
          <div className="max-w-[52rem] [&_a]:pointer-events-auto">
            <p className="eyebrow hero-in">{t('home.kicker')}</p>
            <h1
              id="hero-h"
              className={[
                'display hero-in mt-5 font-bold tracking-[-0.045em]',
                ml ? 'text-[clamp(2.1rem,10vw,2.6rem)] sm:text-[3.2rem] lg:text-[3.7rem] xl:text-[4.2rem]' : 'text-[clamp(2.3rem,11.4vw,3.2rem)] leading-[1.02] sm:text-[3.6rem] lg:text-[4.2rem] xl:text-[4.9rem]',
              ].join(' ')}
              style={{ '--d': '0.08s' } as React.CSSProperties}
            >
              {t('home.title')}
              <br /> <span className="text-grad">{t('home.titleAccent')}</span>
            </h1>
            <p className="hero-in mt-6 font-display text-[1.4rem] font-semibold leading-snug tracking-[-0.025em] text-navy sm:text-[1.7rem]" style={{ '--d': '0.16s' } as React.CSSProperties}>
              {t('home.tagline')} {t('home.taglineAccent')}
            </p>
            <p className="hero-in mt-2 max-w-md text-lg leading-relaxed text-navy/75" style={{ '--d': '0.22s' } as React.CSSProperties}>
              {t('home.water')}
            </p>
            <div className="hero-in mt-9 flex flex-wrap items-center gap-x-8 gap-y-5" style={{ '--d': '0.28s' } as React.CSSProperties}>
              <LimeButton href={lp('/get-involved#register')} label={t('cta.register')} size="lg" />
            </div>
            <p className="hero-in mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1" style={{ '--d': '0.36s' } as React.CSSProperties}>
              <span className="eyebrow">{t('site.dates')}</span>
              <span className="text-navy/75">{t('site.city')}</span>
            </p>
          </div>
        </div>

        <div className="container-kilf pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 pb-4 sm:pb-7">
          <a href="#festival" className="eyebrow pointer-events-auto inline-flex min-h-11 items-center gap-2 bg-cream/85 px-3 backdrop-blur-sm hover:text-blue-bright sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
            {t('home.hero.turn')} <span aria-hidden="true" className="turn">↓</span>
          </a>
        </div>
      </section>

      {/* The nine strands, drifting across the full width of the coral band */}
      <div className="bg-coral py-4 text-ink sm:py-5">
        <Marquee items={strands.map((s) => (ml ? s.data.name_ml : s.data.name))} listLabel={t('home.marquee.label')} lang={lang} />
      </div>

      {/* 01 · The festival */}
      <Section tone="cream" id="festival" labelledby="intro-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <ChapterLabel n={1} label={t('home.intro.chapter')} />
            <p className="mt-14 flex items-center gap-5 text-blue-bright" data-reveal>
              <span className="numeral text-[6.5rem] sm:text-[8rem]" data-count={site.days} data-pad="2">
                0{site.days}
              </span>
              <span className="eyebrow max-w-[7rem] leading-snug">{t('home.facts.days')}</span>
            </p>
            <div className="mt-10 hidden max-w-[30rem] lg:block" data-reveal>
              <PaperBoats />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Headline id="intro-h" text={t('home.live.h')} accent={t('home.live.accent')} size="xl" accentStyle="gradient" data-reveal />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted" data-reveal>
              {t('about.p1')}
            </p>
            <TextLink href={lp('/about')} label={t('home.intro.link')} className="mt-6" />
          </div>
        </div>
        <dl className="mt-20 grid grid-cols-2 border-t border-line lg:grid-cols-4" data-reveal-group>
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={[
                'flex flex-col-reverse gap-2 pb-2 pt-7',
                i % 2 === 1 && 'border-l border-line pl-5',
                i >= 2 && 'border-t border-line lg:border-t-0',
                i === 2 && 'lg:border-l lg:pl-5',
                i > 0 && 'lg:pl-6',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <dt className="eyebrow text-navy">{f.label}</dt>
              <dd className="numeral text-[2.8rem] text-navy sm:text-[3.4rem] xl:text-[4rem]">
                <span data-count={f.value} data-pad={f.pad || undefined}>
                  {String(f.value.toLocaleString('en-IN')).padStart(f.pad, '0')}
                </span>
                {f.suffix && <span className="text-blue-bright">{f.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 02 · Voices */}
      <Section tone="ink" labelledby="voices-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <ChapterLabel n={2} label={t('home.voices.chapter')} tone="dark" />
            <Headline id="voices-h" text={t('home.voices.h')} accent={t('home.voices.accent')} tone="dark" className="mt-6" />
            <p className="mt-4 text-sm font-medium text-mist">{t('home.voices.note')}</p>
          </div>
          <TextLink href={lp('/speakers')} label={t('cta.seeSpeakers')} tone="dark" />
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12" data-reveal-group>
          {speakers.map((s) => (
            <SpeakerCard key={s.id} name={s.data.name} role={s.data.role} photo={s.data.photo} lang="en" tone="dark" />
          ))}
        </ul>
      </Section>

      {/* 03 · Ways in */}
      <Section tone="cream" labelledby="ways-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <ChapterLabel n={3} label={t('home.ways.chapter')} />
            <Headline id="ways-h" text={t('home.ways.h')} accent={t('home.ways.accent')} className="mt-6" />
          </div>
          <TextLink href={lp('/programme')} label={t('home.ways.link')} />
        </div>
        <div className="mt-12">
          <WaysIn lang={lang} />
        </div>
      </Section>

      {/* Statement */}
      <section className="relative overflow-hidden bg-coral py-24 text-ink sm:py-32" aria-labelledby="statement-h">
        <RippleField tone="coral" x={50} y={56} size={760} squash={0.34} follow />
        <div className="container-kilf relative text-center">
          <p className="eyebrow" data-reveal>
            {t('home.statement.kicker')}
          </p>
          <h2 id="statement-h" className={['display mx-auto mt-7 max-w-5xl', ml ? 'text-[2.2rem] sm:text-[3.2rem] lg:text-[4.2rem]' : 'text-[2.6rem] sm:text-[4.2rem] lg:text-[5.4rem]'].join(' ')} data-reveal>
            {t('home.statement.h')}
            <br />
            <span className="text-grad-ink">{t('home.statement.accent')}</span>
          </h2>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10" data-reveal>
            <p className="max-w-md text-[1.02rem] leading-relaxed sm:text-left">{t('home.statement.lead')}</p>
            <TextLink href={lp('/about')} label={t('home.statement.link')} tone="navy" className="shrink-0" />
          </div>
        </div>
      </section>

      {/* 04 · A day at KILF */}
      <Section tone="cream" labelledby="day-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <ChapterLabel n={4} label={t('home.day.chapter')} />
            <Headline id="day-h" text={t('home.day.h')} accent={t('home.day.accent')} className="mt-6" />
          </div>
          <div className="max-w-sm">
            <p className="text-[0.98rem] leading-relaxed text-muted">{t('home.day.note')}</p>
            <TextLink href={lp('/programme')} label={t('home.day.link')} className="mt-4" />
          </div>
        </div>
        <ol className="mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {([1, 2, 3, 4] as const).map((n, i) => (
            <li key={n} className={['relative border-b border-line py-8 sm:px-6', i % 2 === 1 && 'sm:border-l', i > 0 && 'lg:border-l', 'lg:first:pl-0'].filter(Boolean).join(' ')}>
              <p className="eyebrow text-blue-bright">
                <span lang="en">{String(n).padStart(2, '0')}</span> / {t(`home.day.${n}.t` as UIKey)}
              </p>
              <h3 className="mt-10 font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] text-navy">{t(`home.day.${n}.h` as UIKey)}</h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-muted">{t(`home.day.${n}.d` as UIKey)}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 06 · Khasakkinte Ithihasam: the book opens into a stage as you scroll */}
      <section className="khasak on-dark relative bg-[#130c14] text-white max-lg:overflow-x-hidden" data-khasak aria-labelledby="khasak-h">
        <div className="khasak-curtain khasak-curtain-l" aria-hidden="true"></div>
        <div className="khasak-curtain khasak-curtain-r" aria-hidden="true"></div>
        <div className="khasak-sticky">
          <div className="container-kilf relative grid w-full items-center gap-14 py-20 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:py-10">
            <div className="relative order-2 lg:order-1 lg:col-span-7">
              <div className="khasak-beam" aria-hidden="true"></div>
              <KhasakBook novel={t('home.khasak.novel')} staged={t('home.khasak.staged')} when={`${t('home.khasak.where')} · ${t('home.khasak.when')} 2027`} />
              <p className="khasak-hint eyebrow mt-10 hidden text-center text-white/70" aria-hidden="true">
                {t('home.khasak.hint')} ↓
              </p>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                <ChapterLabel n={5} label={t('home.khasak.chapter')} tone="dark" />
                <Badge tone="dark">{t('home.khasak.proposed')}</Badge>
              </div>
              <Headline id="khasak-h" text={t('home.khasak.h')} accent={t('home.khasak.accent')} tone="dark" accentStyle="gradient" className="mt-6" />
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">{t('home.khasak.lead')}</p>
              <dl className="mt-8 grid grid-cols-3 gap-px bg-white/15 ring-1 ring-white/15">
                {[
                  [t('home.hero.when'), t('home.khasak.when')],
                  [t('home.hero.where'), t('home.khasak.where')],
                  [t('home.khasak.ticketsLabel'), t('home.khasak.price')],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#130c14] p-4 sm:p-5">
                    <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-coral">{label}</dt>
                    <dd className="mt-1.5 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.2rem]">{value}</dd>
                  </div>
                ))}
              </dl>
              <blockquote className="mt-8 max-w-lg border-l-2 border-coral pl-5 font-display text-[1.4rem] font-medium leading-snug tracking-[-0.02em] text-white sm:text-[1.55rem]">
                {t('home.khasak.quote')}
              </blockquote>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <LimeButton href={lp('/khasak#tickets')} label={t('home.khasak.tickets')} size="lg" />
                <TextLink href={lp('/khasak')} label={t('cta.learnMore')} tone="dark" />
              </div>
              <p className="mt-4 max-w-md text-sm text-white/65">{t('home.khasak.bundle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 08 · Join in */}
      <Section tone="cream" rule labelledby="involved-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ChapterLabel n={6} label={t('home.involved.chapter')} />
            <Headline id="involved-h" text={t('home.involved.h')} accent={t('home.involved.accent')} size="xl" className="mt-6" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">{t('home.involved.lead')}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LimeButton href={lp('/get-involved#register')} label={t('cta.register')} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <InvolvedCards lang={lang} />
          </div>
        </div>
      </Section>

      {/* Dates */}
      <section className="bg-lime text-ink" aria-labelledby="dates-h">
        <div className="container-kilf py-16 sm:py-20">
          <h2 id="dates-h" className="sr-only">
            {t('site.dates')}
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="eyebrow">{t('home.dates.kicker')}</p>
            <p className="eyebrow">{t('site.city')}</p>
          </div>
          <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-end gap-4 sm:gap-8" aria-hidden="true">
            <div>
              <p className="numeral text-grad-ink text-[clamp(2.5rem,13vw,3.4rem)] sm:text-[6.5rem] lg:text-[8.4rem]">31.12</p>
              <p className="mt-3 text-sm font-semibold tracking-[0.24em] sm:text-lg">2026</p>
            </div>
            <span className="arrow pb-9 text-3xl sm:pb-14 sm:text-5xl">→</span>
            <div className="text-right">
              <p className="numeral text-grad-ink text-[clamp(2.5rem,13vw,3.4rem)] sm:text-[6.5rem] lg:text-[8.4rem]">04.01</p>
              <p className="mt-3 text-sm font-semibold tracking-[0.24em] sm:text-lg">2027</p>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-6 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <ul className="text-[0.98rem] leading-relaxed" lang="en">
              {site.venues.map((v) => (
                <li key={v.id}>{v.name}</li>
              ))}
            </ul>
            <LimeButton href={lp('/visit')} label={t('cta.visit')} className="self-start sm:self-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}
