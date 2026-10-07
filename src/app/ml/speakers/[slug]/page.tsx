import { notFound } from 'next/navigation';
import { getSpeakers } from '@/lib/content';
import { hasBio } from '@/lib/speakers';
import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { SpeakerDetail } from '@/views/SpeakerDetail';

export function generateStaticParams() {
  return getSpeakers()
    .filter((s) => hasBio(s.body))
    .map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getSpeakers().find((s) => s.id === slug);
  if (!entry) return {};
  return buildMetadata({
    lang: 'ml',
    path: `/speakers/${slug}`,
    title: entry.data.name,
    description: `${entry.data.name}, ${entry.data.role}. Proposed speaker at KILF 2027, Kollam.`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getSpeakers().find((s) => s.id === slug && hasBio(s.body));
  if (!entry) notFound();
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <SpeakerDetail lang="ml" entry={entry} />
      </div>
    </>
  );
}
