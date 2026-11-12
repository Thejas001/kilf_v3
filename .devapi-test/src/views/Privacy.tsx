import { PageHero } from '@/components/PageHero';
import { Section } from '@/components/Section';
import { site, env } from '@/lib/site';

export function Privacy() {
  const analytics = env.plausible
    ? 'Plausible Analytics (cookie-free, aggregate statistics)'
    : env.ga4
      ? 'Google Analytics 4 (aggregate statistics; IP anonymised)'
      : null;

  return (
    <>
      <PageHero chapter={1} label="Privacy" text="Your details," accent="looked after." lead="Plain-language privacy for the KILF 2027 website." />
      <Section tone="cream" className="!pt-0">
        <div className="max-w-3xl space-y-8 text-lg leading-relaxed text-navy/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-navy [&_a]:text-blue [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-4">
          <div>
            <h2>Who we are</h2>
            <p className="mt-2">
              The Kollam International Literature Festival (KILF) 2027 is organised by {site.organiser}. You can reach us at{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
          <div>
            <h2>What we collect</h2>
            <p className="mt-2">Only what you type into our forms: typically your name, email, phone number, organisation and message, plus the form you used and when. We don’t ask for anything we don’t need.</p>
          </div>
          <div>
            <h2>Why we use it</h2>
            <p className="mt-2">To reply to you, to send the updates you asked for (passes, programme, seats), and to organise volunteers, exhibitors and partners. We never sell your details or share them for marketing by others.</p>
          </div>
          <div>
            <h2>Where it goes</h2>
            <p className="mt-2">Form submissions are delivered through a third-party form service to the festival team’s inbox or spreadsheet. Maps load from Google only when you choose “Show map”.</p>
          </div>
          <div>
            <h2>Analytics</h2>
            <p className="mt-2">{analytics ? `We use ${analytics} to understand which pages are useful.` : 'This site does not currently use analytics or tracking cookies.'}</p>
          </div>
          <div>
            <h2>How long we keep it</h2>
            <p className="mt-2">Until the end of the 2027 festival cycle, unless you ask us to keep you updated about future editions.</p>
          </div>
          <div>
            <h2>Your choices</h2>
            <p className="mt-2">
              Ask us at any time to see, correct or delete your details, or to stop sending updates: just email <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
          <p className="text-sm text-muted">Last updated: September 2026.</p>
        </div>
      </Section>
    </>
  );
}
