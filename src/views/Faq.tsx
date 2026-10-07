import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { LimeButton } from '@/components/LimeButton';
import { JsonLd } from '@/components/JsonLd';
import { getFaqs } from '@/lib/content';
import { site } from '@/lib/site';
import { localizePath, type Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const groups = [
  ['festival', 'The festival'],
  ['tickets', 'Tickets & passes'],
  ['visiting', 'Visiting'],
  ['taking-part', 'Taking part'],
] as const;

export function Faq({ lang }: Props) {
  const faqs = getFaqs().sort((a, b) => a.data.order - b.data.order);

  return (
    <>
      <PageHero chapter={1} label="FAQ" text="Questions," accent="answered." lead="Everything you need to know before the first chapter. Can’t find it? Write to us." />

      <Section tone="cream" className="!overflow-visible !pt-0" labelledby="faq-list-h">
        <h2 id="faq-list-h" className="sr-only">
          Frequently asked questions
        </h2>
        <nav aria-label="Question topics" className="mb-14 flex flex-wrap gap-2">
          {groups.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center px-5 text-sm font-semibold text-navy ring-1 ring-inset ring-navy/20 transition-colors hover:bg-navy hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="space-y-16">
          {groups.map(([id, label], gi) => (
            <section key={id} id={id} aria-labelledby={`${id}-h`} className="grid gap-6 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h3 id={`${id}-h`} className="eyebrow text-navy lg:sticky lg:top-[calc(var(--hh)+2rem)]">
                  <span>{String(gi + 1).padStart(2, '0')}</span> / {label}
                </h3>
              </div>
              <div className="border-t border-line lg:col-span-8">
                {faqs
                  .filter((f) => f.data.group === id)
                  .map((f, i) => (
                    <details key={f.id} className="group border-b border-line" open={gi === 0 && i === 0} name="faq">
                      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-navy transition-colors hover:text-blue-bright sm:text-[1.35rem] [&::-webkit-details-marker]:hidden">
                        {f.data.question}
                        <span className="relative size-5 shrink-0" aria-hidden="true">
                          <span className="absolute left-0 top-1/2 h-px w-5 bg-current"></span>
                          <span className="absolute left-1/2 top-0 h-5 w-px bg-current transition-transform duration-300 group-open:rotate-90"></span>
                        </span>
                      </summary>
                      <div className="max-w-3xl pb-7 text-lg leading-relaxed text-muted">{f.data.answer}</div>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-20 flex flex-col items-start gap-5 bg-sky p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <p className="text-lg font-medium">
            Still wondering?{' '}
            <a href={`mailto:${site.email}`} className="text-blue underline decoration-1 underline-offset-4">
              {site.email}
            </a>
          </p>
          <LimeButton href={localizePath('/contact', lang)} label="Contact us" />
        </div>
      </Section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.data.question, acceptedAnswer: { '@type': 'Answer', text: f.data.answer } })),
        }}
      />
    </>
  );
}
