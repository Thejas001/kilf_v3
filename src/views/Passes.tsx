import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { NotifyBanner } from '@/components/blocks/NotifyBanner';
import { getPasses } from '@/lib/content';
import { type Lang } from '@/i18n/ui';
import { PassSlider } from '@/components/PassSlider';
import { PassCard } from '@/components/PassCard';
import { fetchTickets, formatPrice, isOnSale } from '@/lib/tickets';

interface Props {
  lang: Lang;
}

export async function Passes({ lang }: Props) {
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
