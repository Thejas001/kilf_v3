import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';
import { NotifyBanner } from '@/components/blocks/NotifyBanner';
import { getPasses } from '@/lib/content';
import { localizePath, type Lang } from '@/i18n/ui';
import { PassSlider } from '@/components/PassSlider';
import { PassCard } from '@/components/PassCard';
import { fetchTickets, formatPrice, isOnSale } from '@/lib/tickets';

interface Props {
  lang: Lang;
}

const guide: [string, string, string, string][] = [
  ['Coming for one day?', 'Day Pass · ₹299', 'Pick your day: sessions, the book fair and the lakeside evening.', '#notify'],
  ['Staying for the whole story?', 'Festival Pass · ₹499', 'All five days, from the midnight chapter on New Year’s Eve to the final page.', '#notify'],
  ['A student or young reader?', 'Young Reader Pass · ₹199', 'All five days for students. Bring your college ID.', '#notify'],
  ['Here for the play?', 'Theatre ticket · ₹1,500', 'A seat at Khasakkinte Ithihasam on 1, 2 or 3 January, on its own.', '/khasak#tickets'],
  ['The play and all five days?', 'Theatre + Festival Pass · ₹1,600', 'A seat at the play and a Festival Pass, together: the festival for ₹100 more.', '/khasak#tickets'],
];
const questions: [string, string][] = [
  ['When do passes go on sale?', 'Ticketing opens soon. Leave your details below and we’ll tell you the moment passes and theatre tickets go on sale.'],
  ['Is the play included in the Festival Pass?', 'No. Khasakkinte Ithihasam is ticketed separately. Choose a theatre ticket on its own, or the theatre + Festival Pass bundle.'],
  ['Are there passes for students?', 'Yes: the Young Reader Pass is ₹199 for all five days, with your college ID. Colleges can also register on the Youth page to bring a group.'],
  [
    'How much do passes cost?',
    'A Day Pass is ₹299, the Festival Pass ₹499 for all five days, and the Young Reader Pass ₹199 for students. Khasakkinte Ithihasam is ₹1,500, or ₹1,600 with a Festival Pass. Nothing is on sale yet, and no payment is taken until ticketing opens.',
  ],
];

export async function Passes({ lang }: Props) {
  const lp = (p: string) => localizePath(p, lang);
  const staticPasses = getPasses().sort((a, b) => a.data.order - b.data.order);
  const tickets = await fetchTickets();
  // Live tickets from the API; static content supplies extras (inclusions, highlight) matched by name and is the fallback.
  const passes = tickets
    ? tickets.map((t, i) => {
        const match = staticPasses.find((s) => s.data.name.toLowerCase() === t.name.toLowerCase());
        const onSale = isOnSale(t);
        return {
          id: t.id,
          data: {
            name: t.name,
            audience: t.ticketType?.replace(/_/g, ' ').toLowerCase() ?? match?.data.audience ?? '',
            description: t.description ?? match?.data.description ?? '',
            includes: match?.data.includes ?? [],
            highlighted: match?.data.highlighted ?? false,
            order: i,
            price: formatPrice(t.price, t.currency),
            priceNote: t.availableQuantity != null && onSale ? `${t.availableQuantity} left` : match?.data.priceNote,
            buyUrl: onSale ? match?.data.buyUrl : undefined,
            checkout: onSale ? { ticketId: t.id, unitPrice: Number(t.price), currency: t.currency, maxQuantity: t.availableQuantity ?? undefined } : undefined,
          },
        };
      })
    : staticPasses;

  return (
    <>
      <PageHero
        chapter={1}
        label="Passes"
        text="Your seat by the"
        accent="lake."
        lead="Five days by the lake from ₹199. Ticketing opens soon: register early and we’ll tell you the moment passes go on sale."
      />

      <Section tone="cream" className="!pt-0" labelledby="passes-h">
        <h2 id="passes-h" className="sr-only">
          Pass types
        </h2>
{(() => {          const cards = passes.map((p) => ({ id: p.id, ...p.data }));          return cards.length > 3 ? (            <PassSlider passes={cards} />          ) : (            <ul className="grid border-l border-t border-line lg:grid-cols-3" data-reveal-group>              {cards.map((c, i) => (                <PassCard key={c.id} p={c} index={i} hi={c.highlighted} />              ))}            </ul>          );        })()}
        <p className="mt-8 max-w-2xl text-sm text-muted">Prices in Indian rupees. Inclusions are indicative and will be confirmed when ticketing opens. Some sessions may have limited seating. Khasakkinte Ithihasam is ticketed separately.</p>
      </Section>

      {/* Which pass is for me? */}
      <Section tone="cream" rule labelledby="guide-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ChapterLabel n={2} label="Choosing" />
            <Headline id="guide-h" text="Which pass" accent="is for me?" className="mt-6" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">Five ways to come to KILF 2027. Find the line that sounds like you.</p>
          </div>
          <ol className="border-t border-line lg:col-span-8" data-reveal-group>
            {guide.map(([q, name, line, href]) => (
              <li key={q} className="border-b border-line">
                <a href={href.startsWith('#') ? href : lp(href)} className="group grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[1fr_1.1fr_auto] sm:items-baseline">
                  <span className="text-[1.02rem] text-muted">{q}</span>
                  <span>
                    <span className="block font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] text-navy transition-colors group-hover:text-blue-bright">{name}</span>
                    <span className="mt-1 block text-[0.98rem] leading-relaxed text-muted">{line}</span>
                  </span>
                  <span aria-hidden="true" className="hidden text-xl text-blue-bright transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-1 group-hover:translate-x-1 sm:block">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* The play is ticketed separately */}
      <section className="relative overflow-hidden bg-coral text-ink" aria-labelledby="theatre-h">
        <div className="container-kilf grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <ChapterLabel n={3} label="Signature theatre" tone="coral" />
            <Headline id="theatre-h" text="The play is" accent="ticketed separately." tone="coral" accentStyle="gradient" className="mt-6" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/85">
              Khasakkinte Ithihasam needs its own ticket: three evenings at Ashramam Maidan, on 1, 2 and 3 January. Choose a theatre ticket on its own, or add all five days of the festival for just ₹100
              more.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <LimeButton href={lp('/khasak#tickets')} label="Theatre tickets" size="lg" className="min-w-[13rem] justify-between !gap-10" />
              <TextLink href={lp('/khasak')} label="About the play" tone="navy" />
            </div>
          </div>
          <ul className="grid gap-3" data-reveal-group>
            <li className="flex items-end justify-between gap-6 bg-cream p-6 text-navy">
              <div>
                <p className="eyebrow">Theatre ticket</p>
                <p className="mt-2 font-display text-xl font-semibold tracking-[-0.02em]">Khasakkinte Ithihasam only</p>
              </div>
              <p className="numeral text-[2.4rem] leading-none text-blue-bright">₹1,500</p>
            </li>
            <li className="on-dark flex items-end justify-between gap-6 bg-blue p-6 text-white">
              <div>
                <p className="eyebrow text-white/80">Theatre + Festival Pass</p>
                <p className="mt-2 font-display text-xl font-semibold tracking-[-0.02em]">The play, plus all five days</p>
              </div>
              <p className="numeral text-[2.4rem] leading-none text-lime">₹1,600</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Ticketing questions */}
      <Section tone="cream" labelledby="questions-h">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ChapterLabel n={4} label="Questions" />
            <Headline id="questions-h" text="Ticketing," accent="answered." className="mt-6" />
            <TextLink href={lp('/faq')} label="All questions" className="mt-8" />
          </div>
          <dl className="border-t border-line lg:col-span-8">
            {questions.map(([q, a]) => (
              <div key={q} className="border-b border-line py-7">
                <dt className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-navy">{q}</dt>
                <dd className="mt-2 max-w-2xl text-[1.02rem] leading-relaxed text-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <NotifyBanner
        id="notify"
        formName="passes-notify"
        kicker="Ticketing opens soon"
        text="Be first in line"
        accent="for passes."
        lead="Register early and we’ll tell you the moment passes go on sale."
        lang={lang}
        extraField={{ name: 'pass', label: 'Pass you’re interested in', options: ['Day Pass', 'Festival Pass', 'Young Reader Pass', 'Theatre ticket', 'Theatre + Festival Pass', 'Not sure yet'] }}
      />
    </>
  );
}
