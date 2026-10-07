import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Icon } from '@/components/Icon';
import { Placeholder } from '@/components/Placeholder';
import { VisitMap } from './VisitMap';
import { site, isPlaceholder } from '@/lib/site';
import { localizePath, type Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const getting: [string, string, string][] = [
  ['train', 'By train', 'Kollam Junction is one of Kerala’s major railway stations, on the main Thiruvananthapuram–Ernakulam line.'],
  ['plane', 'By air', 'Trivandrum International Airport is the nearest airport, roughly a 1.5-hour drive south of Kollam.'],
  ['bus', 'By road', 'Kollam sits on NH 66. KSRTC and private buses connect it with every major town in Kerala.'],
];
const stay: [string, string, string][] = [
  ['bed', 'Where to stay', 'Kollam has city hotels, family-run homestays and lakeside resorts around Ashtamudi. New Year is a busy week on the Kerala coast, so book early.'],
  ['bus', 'Getting around', 'Autorickshaws and taxis link the three venues. App cabs and KSRTC buses run across the city.'],
  ['bowl', 'Eating well', 'Kollam is known for its seafood and its cashews. In the evenings, the festival’s food strand brings the city’s kitchens to the water.'],
];
const around: [string, string][] = [
  ['Munroe Island', 'Canoe through narrow village canals where the Kallada river meets Ashtamudi.'],
  ['Thangasseri', 'An old lighthouse and the ruins of a fort on the sea, a short ride from the city.'],
  ['Kollam Beach', 'The city’s own beach, for a walk at sunset between sessions.'],
  ['The backwater cruise', 'The long boat journey along the backwaters between Kollam and Alappuzha.'],
  ['Jatayu Earth’s Center', 'A giant sculpture of the mythical bird, on a rock at Chadayamangalam in Kollam district.'],
];
const tips: [string, string, string][] = [
  ['sun', 'Weather', 'Late December in Kollam is warm and mostly dry. Light cotton, a hat and water help.'],
  ['bed', 'Stay', 'New Year is a busy week on the Kerala coast. Book your stay early.'],
  ['accessibility', 'Access', 'Tell us about any access needs and we’ll help plan your visit.'],
  ['leaf', 'Respect the lake', 'Ashtamudi is a protected Ramsar wetland. Carry a bottle; leave no trace.'],
];

export function Visit({ lang }: Props) {
  const venues = site.venues.map((v) => {
    const hasCoords = !isPlaceholder(v.lat) && !isPlaceholder(v.lng);
    const q = hasCoords ? `${v.lat},${v.lng}` : v.mapsQuery;
    return {
      ...v,
      hasCoords,
      embed: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`,
    };
  });

  return (
    <>
      <PageHero chapter={1} label="Plan your visit" text="Three venues." accent="One shore." lead="All three venues are in Kollam city, close to Ashtamudi Lake." />

      <Section tone="cream" className="!pt-0" labelledby="venues-h">
        <h2 id="venues-h" className="sr-only">
          Venues
        </h2>
        <ul className="grid border-l border-t border-line lg:grid-cols-3">
          {venues.map((v, i) => (
            <li key={v.id} className="flex flex-col border-b border-r border-line">
              <VisitMap embed={v.embed} title={`Map showing ${v.name}`} />
              <div className="flex flex-1 flex-col p-7">
                <p className="eyebrow text-navy">Venue {String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.03em]">{v.name}</h3>
                <p className="mt-1 text-muted">{v.area}</p>
                {!v.hasCoords && (
                  <p className="mt-2 text-xs text-muted">
                    Coordinates: <Placeholder value={`${v.lat},${v.lng}`} />
                  </p>
                )}
                <a href={v.directions} target="_blank" rel="noopener" className="text-link group mt-auto inline-flex pt-6 min-h-11 items-end gap-2 self-start font-semibold text-navy hover:text-blue">
                  Get directions <span aria-hidden="true" className="text-[0.85em]">↗</span>
                  <span className="sr-only">to {v.name} (opens Google Maps in a new tab)</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <section className="relative overflow-hidden bg-cream" aria-labelledby="map-h">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-80 bg-sky lg:min-h-[38rem]">
            <iframe
              src="https://maps.google.com/maps?q=Kollam%2C%20Kerala&z=14&output=embed"
              title="Map of Kollam, Kerala"
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="container-kilf py-16 sm:py-24 lg:mr-auto lg:max-w-[38rem] lg:pl-14">
            <ChapterLabel n={2} label="Getting here" />
            <Headline id="map-h" text="Find your way to" accent="Kollam." className="mt-6" />
            <ul className="mt-10 border-t border-line">
              {getting.map(([icon, t, d]) => (
                <li key={t} className="flex gap-5 border-b border-line py-6">
                  <Icon name={icon} size={28} className="mt-1 shrink-0 text-blue-bright" />
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{t}</h3>
                    <p className="mt-1 text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stay, eat, get around */}
      <Section tone="cream" labelledby="stay-h">
        <ChapterLabel n={3} label="While you’re here" />
        <Headline id="stay-h" text="Stay a while." accent="Kollam is worth it." className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-line lg:grid-cols-3" data-reveal-group>
          {stay.map(([icon, title, text]) => (
            <li key={title} className="flex flex-col border-b border-r border-line p-7 sm:p-8">
              <Icon name={icon} size={28} className="text-blue-bright" />
              <h3 className="mt-8 font-display text-[1.4rem] font-semibold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Around Kollam */}
      <section className="on-dark bg-footer text-white" aria-labelledby="around-h">
        <div className="container-kilf grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <ChapterLabel n={4} label="Around Kollam" tone="dark" />
            <Headline id="around-h" text="Between" accent="sessions." tone="dark" accentStyle="gradient" className="mt-6" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/80">Five places worth an afternoon, on the water and around it.</p>
          </div>
          <ol className="border-t border-white/20 lg:col-span-8" data-reveal-group>
            {around.map(([place, line], i) => (
              <li key={place} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-white/20 py-6 sm:grid-cols-[4rem_1fr]">
                <span className="pt-1.5 text-sm font-medium tabular-nums text-white/70">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.03em]">{place}</h3>
                  <p className="mt-1.5 text-white/80">{line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section tone="sky" labelledby="tips-h">
        <ChapterLabel n={5} label="Good to know" />
        <Headline id="tips-h" text="Before you" accent="come." className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-navy/15 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map(([icon, title, text]) => (
            <li key={title} className="flex min-h-[14rem] flex-col border-b border-r border-navy/15 bg-cream p-7">
              <Icon name={icon} size={28} className="text-blue-bright" />
              <h3 className="mt-auto pt-8 font-display text-xl font-semibold tracking-[-0.02em]">{title}</h3>
              <p className="mt-1.5 text-muted">
                {text}
                {title === 'Access' && (
                  <>
                    {' '}
                    <a className="font-semibold text-navy underline decoration-1 underline-offset-4" href={localizePath('/contact', lang)}>
                      Contact us
                    </a>
                    .
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
