import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Icon } from '@/components/Icon';
import { InterestForm } from '@/components/InterestForm';
import { LimeButton } from '@/components/LimeButton';
import { localizePath, type Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const next: [string, string][] = [
  ['Send the form', 'It takes about a minute. Tell us what you’d like to do.'],
  ['We write back', 'By email or WhatsApp, with the options that fit you.'],
  ['Before the festival', 'You’ll get a short briefing on your role, your days and who to ask.'],
  ['The five days', 'Be part of the first chapter, from the inside.'],
];

export function GetInvolved({ lang }: Props) {
  const lp = (p: string) => localizePath(p, lang);
  const tabs: [string, string, string, string][] = [
    ['register', 'pen', 'Register', '#register'],
    ['exhibit', 'store', 'Exhibit', '?type=exhibit#register'],
    ['partner', 'handshake', 'Partner', '?type=partner#register'],
    ['volunteer', 'heart', 'Volunteer', '?type=volunteer#register'],
  ];

  return (
    <>
      <PageHero chapter={1} label="Join in" text="Be part of" accent="KILF." lead="Five ways into the first chapter. Pick yours: every form takes about a minute.">
        <nav aria-label="Ways to get involved" className="mt-12">
          <ul className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-4">
            {tabs.map(([key, icon, label, href], i) => (
              <li key={key} className={['border-b border-r border-line', key === 'register' && 'col-span-2 sm:col-span-1'].filter(Boolean).join(' ')}>
                <a
                  href={href}
                  className={[
                    'group flex min-h-32 flex-col justify-between gap-6 p-5 transition-colors duration-300 sm:p-6',
                    'hover:bg-sky',
                  ].join(' ')}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className={"eyebrow text-navy"}>{String(i + 1).padStart(2, '0')}</span>
                    <Icon name={icon} size={24} className={'text-blue-bright'} />
                  </span>
                  <span className="flex items-end justify-between gap-2 font-display text-[1.35rem] font-semibold tracking-[-0.03em]">
                    {label}
                    <span aria-hidden="true" className="text-base transition-transform duration-500 ease-[var(--ease-calm)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      {href.includes('#') ? '↓' : '↗'}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      <Section tone="cream" id="register" labelledby="register-h" className="border-t border-line">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <ChapterLabel n={2} label="Register" />
            <Headline id="register-h" text="Tell us how you’d" accent="like to join." className="mt-6" />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              One form for every way in: register as a delegate, volunteer, exhibit or partner. Pick yours, tell us a little about you, and we’ll write back.
            </p>
          </div>
          <InterestForm />
        </div>
      </Section>

      {/* What happens next */}
      <section className="bg-lime text-ink" aria-labelledby="next-h">
        <div className="container-kilf py-20 sm:py-24">
          <ChapterLabel n={5} label="What happens next" tone="lime" />
          <Headline id="next-h" text="From the form" accent="to the festival." tone="lime" className="mt-6" />
          <ol className="mt-12 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {next.map(([title, line], i) => (
              <li key={title} className={['border-b border-ink/15 py-7 sm:px-6', i % 2 === 1 && 'sm:border-l', i > 0 && 'lg:border-l', 'lg:first:pl-0'].filter(Boolean).join(' ')}>
                <span className="numeral text-[2.6rem] text-blue">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/80">{line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section tone="cream" labelledby="more-h">
        <h2 id="more-h" className="sr-only">
          Partner or attend
        </h2>
        <div className="grid border-l border-t border-line md:grid-cols-2">
          <div id="partner" className="on-dark border-b border-r border-line bg-blue p-8 text-white sm:p-12">
            <ChapterLabel n={6} label="Partner" tone="dark" />
            <Headline text="Your brand. Our story." accent="One lake." tone="blue" size="md" className="mt-6" />
            <p className="mt-5 text-white/85">Founding partnerships for the first edition.</p>
            <LimeButton href={lp('/partners')} label="See partnership options" className="mt-8" />
          </div>
          <div id="attend" className="border-b border-r border-line bg-lime p-8 text-ink sm:p-12">
            <ChapterLabel n={7} label="Attend" tone="lime" />
            <Headline text="Get your" accent="pass." tone="lime" size="md" className="mt-6" />
            <p className="mt-5 text-ink/80">Day Pass ₹299, Festival Pass ₹499 and Young Reader Pass ₹199, plus theatre tickets for Khasakkinte Ithihasam from ₹1,500. Ticketing opens soon.</p>
            <LimeButton href={lp('/passes')} label="See passes" className="mt-8" />
          </div>
        </div>
      </Section>
    </>
  );
}
