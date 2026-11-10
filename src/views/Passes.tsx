import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
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
            audience: match?.data.audience || (t.ticketType ? t.ticketType.replace(/_/g, ' ').toLowerCase() : ''),
            description: t.description?.trim() || match?.data.description || '',
            includes: match?.data.includes?.length ? match.data.includes : (t.perks ?? []).filter((x) => x.trim().length > 3),
            highlighted: match?.data.highlighted ?? false,
            order: i,
            price: formatPrice(t.price, t.currency),
            priceNote: t.availableQuantity != null && onSale ? `${t.availableQuantity} left` : match?.data.priceNote,
            buyUrl: onSale ? match?.data.buyUrl : undefined,
            checkout: onSale ? { ticketId: t.id, unitPrice: Number(t.price), currency: t.currency, maxQuantity: t.availableQuantity ?? undefined, requirements: { date: !!t.requiresDate, showSession: !!t.requiresShowSession, dateOfBirth: t.minAge != null || t.maxAge != null } } : undefined,
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
