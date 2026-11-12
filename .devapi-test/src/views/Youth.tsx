import { Section } from '@/components/Section';
import { ChapterLabel } from '@/components/ChapterLabel';
import { Headline } from '@/components/Headline';
import { Badge } from '@/components/Badge';
import { Icon } from '@/components/Icon';
import { Form } from '@/components/Form';
import { Field } from '@/components/Field';
import { LimeButton } from '@/components/LimeButton';
import { TextLink } from '@/components/TextLink';
import RippleField from '@/components/motion/RippleField';
import type { Lang } from '@/i18n/ui';

interface Props {
  lang: Lang;
}

const activities: [string, string, string][] = [
  ['mic', 'Poetry Slam', 'Three minutes, one mic, no mercy.'],
  ['megaphone', 'Open Mic Nights', 'Stories, songs and stand-up by the lake.'],
  ['camera', 'Reels & Short-Film Challenge', 'Tell a Kollam story in under a minute.'],
  ['music', 'Indie & Rap Night', 'New sounds in Malayalam and beyond.'],
  ['book', 'Meet Your Favourite Authors', 'Up close, questions welcome.'],
  ['graduation', 'Campus Ambassadors', 'Bring KILF to your college.'],
];
const steps: [string, string][] = [
  ['Register your college', 'One form, a minute long. Tell us who you are and what you’re into.'],
  ['Pick your stage', 'Slam, open mic, reels, rap or a meet-the-author session.'],
  ['Watch for the calls', 'Entry details for each activity will be shared with registered colleges first.'],
  ['Take the stage', 'Five days by the lake, with your friends in the audience.'],
];
const ambassador = [
  'Share the programme and the calls on your campus',
  'Gather your friends and your college’s writers, poets and filmmakers',
  'Be the first to hear about youth activities and group passes',
];

export function Youth({ lang }: Props) {
  return (
    <>
      <section className="relative overflow-hidden bg-lime pb-16 pt-14 text-ink sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24" aria-labelledby="youth-h">
        <RippleField tone="coral" x={88} y={40} size={560} follow />
        <div className="container-kilf relative">
          <div className="hero-in flex flex-wrap items-center gap-3">
            <ChapterLabel n={1} label="Youth & new voices" tone="lime" />
            <Badge tone="sky">Proposed</Badge>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <Headline as="h1" size="xl" id="youth-h" text="Youth." accent="This stage is yours." tone="lime" accentStyle="gradient" className="hero-in lg:col-span-8" style={{ '--d': '0.08s' } as React.CSSProperties} />
            <p className="hero-in max-w-md text-lg leading-relaxed text-ink/80 lg:col-span-4 lg:pb-3" style={{ '--d': '0.16s' } as React.CSSProperties}>
              Slams, open mics, reels, rap and your favourite authors up close. Loud, young and entirely yours.
            </p>
          </div>
          <div className="hero-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ '--d': '0.24s' } as React.CSSProperties}>
            <LimeButton href="#college" label="Register your college" size="lg" />
            <TextLink href="#activities" label="See the activities" tone="navy" />
          </div>
        </div>
      </section>

      <Section tone="cream" id="activities" labelledby="activities-h">
        <ChapterLabel n={2} label="Activities" />
        <Headline id="activities-h" text="Six ways to take the" accent="stage." className="mt-6" />
        <ul className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {activities.map(([icon, title, line], i) => (
            <li key={title} className="flex min-h-[15rem] flex-col border-b border-r border-line p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="eyebrow text-navy">{String(i + 1).padStart(2, '0')}</span>
                <Icon name={icon} size={28} className="text-blue-bright" />
              </div>
              <h3 className="mt-auto pt-10 font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h3>
              <p className="mt-1.5 text-muted">{line}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">All youth activities are proposed and subject to confirmation.</p>
      </Section>

      {/* Campus ambassadors */}
      <section className="on-dark relative overflow-hidden bg-blue text-white" aria-labelledby="ambassadors-h">
        <div className="container-kilf grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <ChapterLabel n={3} label="Campus ambassadors" tone="dark" />
            <Headline id="ambassadors-h" text="Bring KILF" accent="to your campus." tone="blue" accentStyle="gradient" className="mt-6" />
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Every college needs someone who hears about things first. Be KILF’s voice on your campus, and bring your friends to the shore.
            </p>
            <LimeButton href="#college" label="Register your college" className="mt-9" />
          </div>
          <ul className="border-t border-white/20" data-reveal-group>
            {ambassador.map((line, i) => (
              <li key={line} className="flex gap-5 border-b border-white/20 py-6">
                <span className="numeral text-3xl text-lime">{String(i + 1).padStart(2, '0')}</span>
                <span className="pt-1 text-lg leading-snug">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to take part */}
      <Section tone="cream" labelledby="steps-h">
        <ChapterLabel n={4} label="How to take part" />
        <Headline id="steps-h" text="Four steps" accent="to the stage." className="mt-6" />
        <ol className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {steps.map(([title, line], i) => (
            <li key={title} className="flex min-h-[14rem] flex-col border-b border-r border-line p-7">
              <span className="numeral text-[2.6rem] text-blue-bright">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-auto pt-8 font-display text-[1.3rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-muted">{line}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="sky" id="college" labelledby="college-h">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <ChapterLabel n={5} label="Colleges" />
            <Headline id="college-h" text="Register your" accent="college." className="mt-6" />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-navy/85">Tell us about your campus. We’ll share ambassador details, group passes for students and early access to the youth stage.</p>
          </div>
          <Form id="college-form" name="college" lang={lang} className="border border-navy/10 bg-cream p-6 sm:p-9" successText="Your college is on our list. We’ll be in touch soon.">
            <Field formId="college-form" name="name" label="Your name" autocomplete="name" required />
            <Field formId="college-form" name="email" type="email" label="Email" autocomplete="email" required />
            <Field formId="college-form" name="phone" type="tel" label="Phone" autocomplete="tel" inputmode="tel" required />
            <Field formId="college-form" name="organisation" label="College / institution" autocomplete="organization" required />
            <Field formId="college-form" name="role" type="select" label="You are" options={['Student', 'Faculty', 'Student body / club', 'Other']} />
            <Field formId="college-form" name="interest" type="select" label="Most interested in" options={activities.map(([, a]) => a)} />
            <Field formId="college-form" name="message" type="textarea" label="Message" full rows={3} />
          </Form>
        </div>
      </Section>
    </>
  );
}
