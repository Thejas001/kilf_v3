import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { StrandGrid } from '@/components/blocks/StrandGrid';
import { NotifyBanner } from '@/components/blocks/NotifyBanner';
import { Schedule } from '@/components/blocks/Schedule';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/Badge';
import { getTeasers, getSchedule } from '@/lib/content';
import type { Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const day: [string, string, string][] = [
  ['Morning', 'Conversations and readings', 'Writers and thinkers on the main stages, with time for your questions.'],
  ['Afternoon', 'Book fair and workshops', 'New releases, signed copies, and hands-on sessions for young and old.'],
  ['Evening', 'Stage and screen', 'Theatre, films that began as books, and the youth stage at full volume.'],
  ['Night', 'Music and food by the lake', 'Kollam’s kitchens and live music by the water. On 31 December, the countdown to 2027.'],
];
const formats: [string, string, string][] = [
  ['chat', 'Conversations', 'Two or three voices, one stage, and room for the audience to join in.'],
  ['book', 'Readings', 'Authors read from new and loved work, in Malayalam and English.'],
  ['users', 'Panels', 'Questions Kerala keeps asking: history, faith, media and society.'],
  ['pen', 'Workshops', 'Small, hands-on sessions on writing, illustration and storytelling.'],
  ['mask', 'Performances', 'Theatre, music and spoken word, on stage and by the lake.'],
  ['film', 'Screenings', 'Films that began as books, followed by talks with their makers.'],
];

export function Programme({ lang }: Props) {
  const teasers = getTeasers().sort((a, b) => a.data.order - b.data.order);
  const days = getSchedule();
  const hasSchedule = days.length > 0;
  const total = days.reduce((n, d) => n + d.data.sessions.length, 0);

  return (
    <>
      <PageHero
        chapter={1}
        label="Programme"
        text="Follow a thought."
        accent="Find a festival."
        lead={
          hasSchedule
            ? 'Five days on the shore of Ashtamudi, from New Year’s Eve to 4 January: conversations, readings, films, music, theatre and a youth stage at full volume.'
            : 'We won’t tell you everything yet. Here is a glimpse of what the five days hold.'
        }
      >
        {hasSchedule && (
          <p className="mt-8 flex flex-wrap items-center gap-3 text-base text-muted">
            <Badge>Proposed programme</Badge> Sessions, times and speakers are subject to confirmation.
          </p>
        )}
      </PageHero>

      {hasSchedule ? (
        <Section tone="cream" className="!overflow-visible !pt-0" labelledby="schedule-h">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <ChapterLabel n={2} label="The programme" />
              <Headline id="schedule-h" text="Five days." accent={`${total} sessions.`} accentStyle="gradient" className="mt-6" />
            </div>
            <p className="max-w-md text-lg leading-relaxed text-muted">Pick a day, or follow a strand across all five. The ★ marks the sessions not to miss.</p>
          </div>
          <div className="mt-10">
            <Schedule days={days} lang={lang} />
          </div>
        </Section>
      ) : (
        <Section tone="cream" className="!pt-0" labelledby="teasers-h">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <ChapterLabel n={2} label="A glimpse" />
              <h2 id="teasers-h" className="display mt-6 text-[2.15rem] text-navy sm:text-[2.9rem]">
                Six moments <span className="text-blue-bright">to look for.</span>
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">The full programme, with dates, times and venues, will be unveiled soon.</p>
            </div>
            <ol className="border-t border-line lg:col-span-8" data-reveal-group>
              {teasers.map((item, i) => (
                <li key={item.id} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-7 sm:grid-cols-[4.5rem_1fr] sm:py-9">
                  <span className="pt-2 text-sm font-medium tabular-nums text-navy">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.03em] text-navy sm:text-[2rem]">{item.data.title}</h3>
                    <p className="mt-2 text-[1.05rem] leading-relaxed text-muted">{item.data.line}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      )}

      {/* A day at the festival */}
      <section className="bg-lime text-ink" aria-labelledby="day-h">
        <div className="container-kilf py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <ChapterLabel n={3} label="A day at the festival" tone="lime" />
              <Headline id="day-h" text="From first light" accent="to the last song." tone="lime" className="mt-6" />
            </div>
            <p className="max-w-sm text-[0.98rem] leading-relaxed text-ink/80">
              {hasSchedule ? 'How a festival day flows. The programme above has the time of every session.' : 'An indicative day. The full programme will set the times for every session.'}
            </p>
          </div>
          <ol className="mt-12 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {day.map(([when, what, line], i) => (
              <li key={when} className={['border-b border-ink/15 py-7 sm:px-6', i % 2 === 1 && 'sm:border-l', i > 0 && 'lg:border-l', 'lg:first:pl-0'].filter(Boolean).join(' ')}>
                <p className="eyebrow">
                  {String(i + 1).padStart(2, '0')} / {when}
                </p>
                <h3 className="mt-8 font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.03em]">{what}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/80">{line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section tone="cream" id="strands" labelledby="strands-h">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <ChapterLabel n={4} label="Strands" />
            <Headline id="strands-h" text="Nine strands." accent="One shore." className="mt-6" />
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted">Follow the one you love, or wander into one you never expected.</p>
        </div>
        <div className="mt-12">
          <StrandGrid lang={lang} />
        </div>
      </Section>

      {/* Formats */}
      <Section tone="cream" rule labelledby="formats-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ChapterLabel n={5} label="Formats" />
            <Headline id="formats-h" text="Six ways" accent="to spend an hour." className="mt-6" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
              Most sessions are in Malayalam, with several in English and some bilingual.{' '}
              {hasSchedule ? 'Every session in the programme lists its language.' : 'The full programme will list the language of every session.'}
            </p>
          </div>
          <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:col-span-8" data-reveal-group>
            {formats.map(([icon, title, line]) => (
              <li key={title} className="flex gap-5 border-b border-r border-line p-6 sm:p-7">
                <Icon name={icon} size={28} className="mt-1 shrink-0 text-blue-bright" />
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1.5 text-muted">{line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {!hasSchedule && (
        <NotifyBanner id="notify" tone="sky" formName="programme-notify" kicker="Coming soon" text="The full programme," accent="first to you." lead="Dates, times and venues for every session. Leave your details and we’ll send it to you first." />
      )}
    </>
  );
}
