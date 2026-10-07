import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Badge } from '@/components/Badge';
import { Illustration } from '@/components/Illustration';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';
import { NotifyBanner } from '@/components/blocks/NotifyBanner';
import RippleField from '@/components/motion/RippleField';
import TicketCard from '@/components/motion/TicketCard';
import { site } from '@/lib/site';
import { localizePath, type Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const facts: [string, string][] = [
  ['Based on', 'O. V. Vijayan’s novel Khasakkinte Ithihasam (1969)'],
  ['Directed by', 'Deepan Sivaraman'],
  ['Language', 'Malayalam'],
  ['Staging', 'Immersive: the story happens around you, not only in front of you'],
  ['Status', 'Proposed for KILF 2027 · subject to confirmation'],
];
const plan: [string, string][] = [
  ['Festival window', '31 Dec 2026 — 4 Jan 2027'],
  ['Performances', '1, 2 and 3 January 2027 · evenings'],
  ['Venue', 'Ashramam Maidan, Kollam'],
  ['Tickets', 'Theatre ticket ₹1,500 · Theatre + Festival Pass ₹1,600 · Booking opens soon'],
];
const goodToKnow: [string, string][] = [
  ['Tickets', 'The play is ticketed separately from festival passes: a theatre ticket is ₹1,500, or ₹1,600 with a Festival Pass for all five days.'],
  ['Dates and venue', 'Three evening performances, on 1, 2 and 3 January 2027, at Ashramam Maidan, Kollam. Start times will be confirmed with booking.'],
  ['Seating', 'Seating will be limited. Leave your details and we’ll write the moment booking opens.'],
  ['Language', 'The performance is in Malayalam.'],
  ['Age guidance', 'To be announced with the performance details.'],
  ['Access', 'Tell us about any access needs when you book, and we’ll help plan your evening.'],
];
const options = [
  {
    name: 'Theatre ticket',
    line: '₹1,500 · Khasakkinte Ithihasam only.',
    text: 'A seat at one performance, on 1, 2 or 3 January, for visitors who are coming for the play.',
    surface: 'bg-sky text-navy',
  },
  {
    name: 'Theatre + Festival Pass',
    line: '₹1,600 · The play, plus all five days.',
    text: 'A seat at the performance and a Festival Pass: every session from 31 December to 4 January, New Year’s Eve by the lake, the book fair and exhibitions. All five days for ₹100 more.',
    surface: 'on-dark bg-blue text-white',
  },
];

export function Khasak({ lang }: Props) {
  const lp = (p: string) => localizePath(p, lang);

  return (
    <>
      {/* 01 · Hero */}
      <section className="waves relative overflow-hidden bg-cream pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24" aria-labelledby="khasak-h">
        <RippleField tone="light" x={4} y={98} size={520} follow />
        <div className="container-kilf relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <div className="hero-in flex flex-wrap items-center gap-3">
              <ChapterLabel n={1} label="Signature theatre" />
              <Badge>Proposed</Badge>
            </div>
            <h1 id="khasak-h" className="display hero-in mt-7 text-[3rem] font-bold tracking-[-0.045em] sm:text-[4.4rem] lg:text-[4.3rem] xl:text-[5rem]" style={{ '--d': '0.08s' } as React.CSSProperties}>
              Khasakkinte
              <br />
              <span className="text-grad">Ithihasam.</span>
            </h1>
            <p className="hero-in mt-4 text-2xl text-muted" lang="ml" style={{ '--d': '0.12s' } as React.CSSProperties}>
              ഖസാക്കിന്റെ ഇതിഹാസം
            </p>
            <p className="hero-in mt-7 max-w-lg text-lg leading-relaxed text-muted" style={{ '--d': '0.18s' } as React.CSSProperties}>
              O. V. Vijayan’s legendary 1969 novel, staged by director Deepan Sivaraman. Not a play you watch — a world you walk into.
            </p>
            <div className="hero-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ '--d': '0.26s' } as React.CSSProperties}>
              <LimeButton href="#tickets" label="Choose your ticket" size="lg" className="min-w-[14rem] justify-between !gap-10" />
              <TextLink href="#production" label="About the production" />
            </div>
          </div>
          <figure className="hero-in relative aspect-[4/3] overflow-hidden bg-navy lg:aspect-[4/5]" style={{ '--d': '0.14s' } as React.CSSProperties}>
            <Illustration
              src="illustrations/p4_stage.jpg"
              alt="An open theatre stage under a spotlight: two figures and a great tree against a coral moon."
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 bg-cream px-4 py-3 text-navy sm:inset-x-6 sm:bottom-6 sm:px-5">
              <span className="eyebrow text-[0.68rem]">Proposed for KILF 2027</span>
              <span className="text-sm text-muted">Details to be confirmed</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 02 · The production */}
      <Section tone="cream" id="production" labelledby="production-h" className="border-t border-line">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ChapterLabel n={2} label="The production" />
            <Headline id="production-h" text="Not a play you watch." accent="A world you walk into." className="mt-6" />
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg leading-relaxed text-navy/85" data-reveal>
              O. V. Vijayan’s Khasakkinte Ithihasam, first published in 1969, is one of the landmarks of modern Malayalam literature. Director Deepan Sivaraman brings the village of Khasak, its
              legends and its restless teacher Ravi to life around the audience rather than in front of it.
            </p>
            <dl className="mt-10 border-t border-line" data-reveal-group>
              {facts.map(([label, value]) => (
                <div key={label} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <dt className="eyebrow pt-1 text-navy">{label}</dt>
                  <dd className="text-[1.05rem] text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* The novel and the director */}
      <Section tone="cream" rule labelledby="story-h">
        <h2 id="story-h" className="sr-only">
          The novel and the director
        </h2>
        <div className="grid border-l border-t border-line md:grid-cols-2" data-reveal-group>
          <article className="flex flex-col border-b border-r border-line p-8 sm:p-12">
            <p className="eyebrow text-navy">The novel</p>
            <h3 className="display mt-8 text-[2rem] text-navy sm:text-[2.4rem]">
              A village, a teacher,
              <br />
              <span className="text-blue-bright">a legend.</span>
            </h3>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-muted">
              Ravi, a restless young man, arrives in Khasak, a remote village in Palakkad, to start a single-teacher school. Around him the village’s legends, faiths, quarrels and dreams slowly
              unfold. First published in 1969, O. V. Vijayan’s novel changed Malayalam fiction for good; his own English version, The Legends of Khasak, followed in 1994.
            </p>
          </article>
          <article className="on-dark flex flex-col border-b border-r border-line bg-footer p-8 text-white sm:p-12">
            <p className="eyebrow text-white/80">The director</p>
            <h3 className="display mt-8 text-[2rem] sm:text-[2.4rem]">
              Deepan
              <br />
              <span className="text-lime">Sivaraman.</span>
            </h3>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-white/85">
              A theatre director and scenographer known for large, immersive productions in which the space itself becomes part of the story. His staging of Khasakkinte Ithihasam builds the village
              around its audience.
            </p>
          </article>
        </div>
      </Section>

      {/* Plan your theatre evening */}
      <section className="on-dark waves-light relative overflow-hidden bg-blue text-white" aria-labelledby="plan-h">
        <RippleField tone="dark" x={42} y={55} size={620} squash={1} rings={3} />
        <div className="container-kilf relative grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <p className="eyebrow text-white">Plan your theatre evening</p>
            <Headline id="plan-h" text="The stage is" accent="being set." tone="blue" accentStyle="gradient" inline className="mt-6" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              The KILF presentation remains subject to production confirmation. The performance date, venue, duration, age guidance and ticket arrangements will be published together.
            </p>
          </div>
          <dl className="space-y-7 self-center border-white/30 lg:border-l lg:pl-12">
            {plan.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-medium text-white/80">{label}</dt>
                <dd className="mt-1.5 text-lg font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="relative overflow-hidden bg-coral text-ink" aria-labelledby="tickets-h">
        <div className="container-kilf relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_minmax(0,27rem)] lg:gap-20 lg:py-28">
          <div>
            <p className="eyebrow">Your evening at the theatre</p>
            <Headline id="tickets-h" text="One stage." accent="A world within." tone="coral" accentStyle="gradient" className="mt-6" />
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/85">
              Three evenings at Ashramam Maidan, on 1, 2 and 3 January. The play is ticketed separately from the festival: a theatre ticket on its own is ₹1,500, and for ₹1,600 the theatre +
              Festival Pass adds all five days of the festival. Seating is limited.
            </p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2" data-reveal-group>
              {options.map((o) => (
                <li key={o.name} className={['p-6', o.surface].join(' ')}>
                  <p className="font-display text-xl font-semibold tracking-[-0.02em]">{o.name}</p>
                  <p className="mt-1 text-[0.95rem] font-semibold opacity-90">{o.line}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed opacity-85">{o.text}</p>
                </li>
              ))}
            </ul>
            <TextLink href={lp('/passes')} label="Explore festival passes" tone="navy" className="mt-9" />
          </div>
          <TicketCard notifyHref="#notify" />
        </div>
      </section>

      {/* Good to know */}
      <Section tone="cream" labelledby="know-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ChapterLabel n={3} label="Good to know" />
            <Headline id="know-h" text="Before you" accent="book." className="mt-6" />
          </div>
          <dl className="border-t border-line lg:col-span-8" data-reveal-group>
            {goodToKnow.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-line py-6 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="eyebrow pt-1 text-navy">{label}</dt>
                <dd className="text-[1.05rem] leading-relaxed text-navy/85">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <NotifyBanner
        id="notify"
        formName="khasak-tickets"
        kicker="Booking has not opened"
        text="Be first in line"
        accent="for seats."
        lead={`Seating for the play will be limited. Leave your details and we’ll write the moment booking opens. Questions? ${site.email}`}
        submitLabel="Notify me"
        lang={lang}
        extraFields={[
          { name: 'ticket', label: 'Ticket', options: ['Theatre ticket', 'Theatre + Festival Pass', 'Not sure yet'] },
          { name: 'seats', label: 'Seats', options: ['1', '2', '3', '4', '5', '6'] },
        ]}
      />
    </>
  );
}
