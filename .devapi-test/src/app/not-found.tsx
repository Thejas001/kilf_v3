import '@/styles/global.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RevealBoot } from '@/components/RevealBoot';
import { Headline } from '@/components/Headline';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';

/**
 * A genuinely unmatched top-level path (no route, no route group applies) is
 * rendered by Next.js inside its own internal bare root layout, NOT ours —
 * this project deliberately has no top-level src/app/layout.tsx (see the
 * "multiple root layouts" note in src/components/SiteShell.tsx), so Next
 * can't nest our SiteShell's own <html>/<body> here without producing an
 * invalid doubly-nested document. So this renders Header/Footer/content
 * directly (no SiteShell, no extra <html>/<body>) — Next still emits our
 * imported global.css into whatever <head> it renders, so styling holds.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="waves bg-cream pb-24 pt-16 sm:pb-32 sm:pt-24">
          <div className="container-kilf text-center">
            <p className="numeral text-grad text-8xl sm:text-9xl">404</p>
            <Headline as="h1" text="This page drifted out onto the" accent="lake." accentStyle="gradient" className="mx-auto mt-6 max-w-3xl" />
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted">Some stories go missing. Let’s get you back to the shore.</p>
            <p className="mt-3 text-lg text-muted" lang="ml">
              ഈ പേജ് കണ്ടെത്താനായില്ല.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <LimeButton href="/" label="Back to the home page" />
              <TextLink href="/programme" label="Explore the programme" />
            </div>
          </div>
        </section>
      </main>
      <Footer lang="en" />
      <RevealBoot />
    </>
  );
}
