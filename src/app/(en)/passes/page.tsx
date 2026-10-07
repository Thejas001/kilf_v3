import { buildMetadata, buildEventJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Passes } from '@/views/Passes';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/passes',
  title: 'Passes',
  description: 'Day, Festival and Young Reader passes for KILF 2027, and separate theatre tickets for Khasakkinte Ithihasam. Ticketing opens soon — register early.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildEventJsonLd()} />
      <Passes lang="en" />
    </>
  );
}
