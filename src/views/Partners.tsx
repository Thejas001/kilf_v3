import fs from 'node:fs';
import path from 'node:path';
import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Icon } from '@/components/Icon';
import { LakeArt } from '@/components/LakeArt';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';
import { Logo } from '@/components/Logo';
import { Form } from '@/components/Form';
import { Field } from '@/components/Field';
import { Placeholder } from '@/components/Placeholder';
import data from '@/data/partnership.json';
import { site, env } from '@/lib/site';
import { logoUrl } from '@/lib/images';
import type { Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const steps: [string, string][] = [
  ['Enquire', 'Send the form below, or book a call. Tell us about your brand and what you’d like KILF to do for it.'],
  ['Talk it through', 'We share the full proposal and shape the options around your goals and budget.'],
  ['Agree the chapter', 'Choose your tier and benefits. We confirm everything in writing.'],
  ['On the shore', 'Your brand goes live across the festival, online and by the lake.'],
];

export function Partners({ lang }: Props) {
  const proposalFile = 'downloads/kilf-2027-partnership-proposal.pdf';
  const hasProposal = fs.existsSync(path.join(process.cwd(), 'public', proposalFile));
  const callUrl = env.partnerCallUrl || `mailto:${site.email}?subject=${encodeURIComponent('KILF 2027 partnership call')}`;
  const logoFileWhite = logoUrl('kilf-logo-white');
  const logoFileBlue = logoUrl('kilf-logo');

  return (
    <>
      {/* Hook */}
      <section className="on-dark relative overflow-hidden bg-blue-bright text-white" aria-labelledby="partners-h">
        <div className="waves-light pointer-events-none absolute inset-0" aria-hidden="true"></div>
        <div className="container-kilf relative pb-14 pt-14 sm:pb-16 sm:pt-20 lg:pt-24">
          <ChapterLabel n={1} label="Partner with KILF" tone="dark" className="hero-in" />
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <h1 id="partners-h" className="display hero-in text-[2.7rem] font-bold tracking-[-0.045em] sm:text-[4rem] lg:col-span-8 lg:text-[4.6rem]" style={{ '--d': '0.08s' } as React.CSSProperties}>
              Your brand. Our story. <span className="text-grad-warm">One lake.</span>
            </h1>
            <p className="hero-in max-w-md text-lg leading-relaxed text-white/85 lg:col-span-4 lg:pb-3" style={{ '--d': '0.16s' } as React.CSSProperties}>
              Five days, 100+ speakers and 10,000+ visitors on the shore of Ashtamudi. Become a founding partner of the first Kollam International Literature Festival.
            </p>
          </div>
          <div className="hero-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ '--d': '0.24s' } as React.CSSProperties}>
            <LimeButton href="#enquire" label="Enquire now" variant="lime" size="lg" className="min-w-[12rem] justify-between !gap-10" />
            <TextLink href={callUrl} label="Book a partnership call" tone="dark" />
          </div>
        </div>
        <div className="container-kilf relative pb-14 sm:pb-20">
          <LakeArt art="jetty" sizes="(min-width: 1280px) 1120px, 100vw" focus={[0.6, 0.5]} className="aspect-[16/10] w-full sm:aspect-[2.2/1] lg:aspect-[2.6/1]" />
        </div>
      </section>

      {/* Why partner */}
      <Section tone="cream" labelledby="why-h">
        <ChapterLabel n={2} label="Why partner" />
        <Headline id="why-h" text="Four reasons to be" accent="on the shore." className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {data.why.map((w, i) => (
            <li key={w.title} className="flex min-h-[16rem] flex-col border-b border-r border-line p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="eyebrow text-navy">{String(i + 1).padStart(2, '0')}</span>
                <Icon name={w.icon} size={28} className="text-blue-bright" />
              </div>
              <h3 className="mt-auto pt-10 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em]">{w.title}</h3>
              <p className="mt-2 text-muted">{w.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Audience */}
      <Section tone="sky" labelledby="audience-h">
        <ChapterLabel n={3} label="Audience" />
        <Headline id="audience-h" text="Who you’ll" accent="meet." className="mt-6" />
        <ul className="mt-12 grid grid-cols-2 border-l border-t border-navy/15 md:grid-cols-3">
          {data.audience.map((a) => (
            <li key={a.title} className="flex flex-col gap-5 border-b border-r border-navy/15 bg-cream p-6 sm:flex-row sm:items-center sm:p-7">
              <Icon name={a.icon} size={28} className="shrink-0 text-blue-bright" />
              <span className="font-display text-lg font-semibold leading-tight tracking-[-0.02em]">{a.title}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Picture your brand here */}
      <Section tone="cream" labelledby="picture-h">
        <ChapterLabel n={4} label="Visibility" />
        <Headline id="picture-h" text="Picture your brand" accent="here." className="mt-6" />
        <p className="mt-5 max-w-2xl text-lg text-muted">Illustrative mock-ups. Final placements depend on the partnership tier.</p>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* stage banner */}
          <figure className="border border-line">
            <div className="on-dark relative aspect-[16/9] bg-footer p-5 text-white sm:p-7">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Logo tone="dark" className="h-8 sm:h-10" src={logoFileWhite} />
                  <span className="border border-dashed border-lime/70 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-lime sm:text-sm">Your logo</span>
                </div>
                <p className="display text-2xl sm:text-4xl">
                  Where words meet the <span className="text-grad-warm">world.</span>
                </p>
                <p className="text-xs text-mist sm:text-sm">Main stage · Ashramam Maidan</p>
              </div>
            </div>
            <figcaption className="border-t border-line p-4 text-sm font-semibold">Main stage backdrop</figcaption>
          </figure>
          {/* pass */}
          <figure className="flex flex-col border border-line">
            <div className="grid aspect-[16/9] flex-1 place-items-center bg-sky p-5 lg:aspect-auto">
              <div className="w-40 rotate-[-4deg] bg-cream p-4 shadow-[0_18px_40px_-20px_rgb(15_28_116/0.5)] ring-1 ring-line">
                <Logo className="h-7 text-blue" src={logoFileBlue} />
                <p className="mt-3 font-display text-lg font-semibold leading-none tracking-[-0.02em]">
                  Festival
                  <br />
                  <span className="text-blue-bright">Pass</span>
                </p>
                <p className="mt-2 text-[0.65rem] text-muted">31 Dec – 4 Jan</p>
                <div className="mt-3 border border-dashed border-blue/40 py-2 text-center text-[0.65rem] font-bold uppercase tracking-widest text-blue">Your logo</div>
              </div>
            </div>
            <figcaption className="border-t border-line p-4 text-sm font-semibold">Festival pass</figcaption>
          </figure>
          {/* social post */}
          <figure className="flex flex-col border border-line">
            <div className="grid aspect-[16/9] flex-1 place-items-center bg-lime p-5 lg:aspect-auto">
              <div className="w-44 bg-white p-3 shadow-[0_18px_40px_-20px_rgb(15_28_116/0.5)]">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-navy"></span>
                  <span className="text-[0.7rem] font-bold">kilf2027</span>
                </div>
                <div className="on-dark mt-2 grid aspect-square place-items-center bg-blue-bright p-3 text-center text-white">
                  <p className="display text-base">
                    Turn the <span className="text-lime">page.</span>
                  </p>
                  <span className="mt-1 border border-dashed border-white/70 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-widest">with your logo</span>
                </div>
                <div className="mt-2 flex gap-2 text-navy">
                  <Icon name="heart" size={16} />
                  <Icon name="chat" size={16} />
                </div>
              </div>
            </div>
            <figcaption className="border-t border-line p-4 text-sm font-semibold">Social media post</figcaption>
          </figure>
        </div>
      </Section>

      {/* Tiers */}
      <Section tone="cream" rule labelledby="tiers-h">
        <ChapterLabel n={5} label="Partnership tiers" />
        <Headline id="tiers-h" text="Choose your" accent="chapter." className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {data.tiers.map((tier) => (
            <li key={tier.id} className={['flex flex-col border-b border-r border-line p-7', tier.highlight ? 'on-dark bg-blue text-white' : 'bg-cream'].join(' ')}>
              {tier.count.length <= 2 ? (
                <span className={['numeral text-5xl', tier.highlight ? 'text-lime' : 'text-blue-bright'].join(' ')}>{tier.count.padStart(2, '0')}</span>
              ) : (
                <span className={['eyebrow', tier.highlight ? 'text-lime' : 'text-blue-bright'].join(' ')}>{tier.count}</span>
              )}
              <h3 className="mt-6 font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{tier.name}</h3>
              <p className={['mt-2 flex-1 text-[0.95rem]', tier.highlight ? 'text-white/85' : 'text-muted'].join(' ')}>{tier.text}</p>
              <p className={['eyebrow mt-6 border-t pt-4', tier.highlight ? 'border-white/20 text-white/80' : 'border-line text-navy'].join(' ')}>Pricing on request</p>
            </li>
          ))}
        </ul>

        {/* Benefits matrix */}
        <h3 className="display mt-20 text-3xl text-navy sm:text-4xl">
          Benefits at a <span className="text-blue-bright">glance.</span>
        </h3>
        <div className="mt-8 overflow-x-auto border border-line" tabIndex={0} role="region" aria-label="Benefits by tier (scrolls horizontally)">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm sm:text-base">
            <caption className="sr-only">Partnership benefits by tier</caption>
            <thead className="bg-footer text-white">
              <tr>
                <th scope="col" className="p-4 font-semibold">
                  Benefit
                </th>
                {data.matrixColumns.map((c) => (
                  <th key={c} scope="col" className="p-4 text-center font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.benefit} className="border-t border-line bg-cream">
                  <th scope="row" className="p-4 font-medium">
                    {row.benefit}
                  </th>
                  {row.tiers.map((on, i) => (
                    <td key={i} className="p-4 text-center">
                      {on ? (
                        <span className="inline-grid size-7 place-items-center bg-lime text-ink">
                          <Icon name="check" size={16} label="Included" />
                        </span>
                      ) : (
                        <span className="text-line" aria-label="Not included">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">Benefits are indicative and tailored with each partner.</p>
      </Section>

      {/* How partnering works */}
      <section className="bg-lime text-ink" aria-labelledby="process-h">
        <div className="container-kilf py-20 sm:py-24">
          <ChapterLabel n={6} label="How it works" tone="lime" />
          <Headline id="process-h" text="From first call" accent="to the festival." tone="lime" className="mt-6" />
          <ol className="mt-12 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
            {steps.map(([title, line], i) => (
              <li key={title} className={['border-b border-ink/15 py-7 sm:px-6', i % 2 === 1 && 'sm:border-l', i > 0 && 'lg:border-l', 'lg:first:pl-0'].filter(Boolean).join(' ')}>
                <span className="numeral text-[2.6rem] text-blue">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/80">{line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Enquiry */}
      <Section tone="sky" id="enquire" labelledby="enquire-h">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <ChapterLabel n={7} label="Enquire" />
            <Headline id="enquire-h" text="Let’s write this" accent="together." className="mt-6" />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-navy/80">Tell us a little about your brand and we’ll share the full proposal and tailored options.</p>
            <div className="mt-9 flex flex-col items-start gap-4">
              <LimeButton href={callUrl} label="Book a partnership call" external={!!env.partnerCallUrl} />
              {hasProposal ? (
                <a href={`/${proposalFile}`} download className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline decoration-1 underline-offset-4 hover:text-blue">
                  <Icon name="download" size={20} /> Download the partnership proposal (PDF)
                </a>
              ) : (
                <p className="inline-flex items-center gap-2 text-sm text-muted">
                  <Icon name="download" size={20} /> Proposal PDF: <Placeholder value="[PROPOSAL PDF]" />
                </p>
              )}
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy hover:text-blue">
                <Icon name="mail" size={20} className="text-blue-bright" />
                {site.email}
              </a>
            </div>
          </div>
          <Form
            id="partner-form"
            name="partner"
            lang={lang}
            endpoint={env.formEndpointPartner || env.formEndpoint}
            className="border border-navy/10 bg-cream p-6 sm:p-9"
            successText="Thank you. Our partnerships team will be in touch shortly."
          >
            <Field formId="partner-form" name="name" label="Name" autocomplete="name" required />
            <Field formId="partner-form" name="email" type="email" label="Work email" autocomplete="email" required />
            <Field formId="partner-form" name="phone" type="tel" label="Phone" autocomplete="tel" inputmode="tel" required />
            <Field formId="partner-form" name="organisation" label="Company / brand" autocomplete="organization" required />
            <Field formId="partner-form" name="tier" type="select" label="Interested in" options={[...data.tiers.map((t) => t.name), 'Not sure yet']} full />
            <Field formId="partner-form" name="message" type="textarea" label="Message" full rows={4} />
          </Form>
        </div>
      </Section>
    </>
  );
}
