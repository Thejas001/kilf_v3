import { buildMetadata, buildEventJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Home } from '@/views/Home';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/',
  title: 'KILF 2027 · Kollam International Literature Festival',
  description:
    'The first Kollam International Literature Festival: 31 Dec 2026 – 4 Jan 2027 on the shore of Ashtamudi Lake. 100+ speakers across literature, cinema, music, theatre and ideas.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildEventJsonLd()} />
      <Home lang="en" />
    </>
  );
}
