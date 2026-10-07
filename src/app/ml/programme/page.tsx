import { buildMetadata, buildEventJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Programme } from '@/views/Programme';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/programme',
  title: 'Programme',
  description: 'Some stories you read. Others, you live. A first glimpse of the KILF 2027 programme and its nine strands.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildEventJsonLd()} />
      <FallbackNotice />
      <div lang="en">
        <Programme lang="ml" />
      </div>
    </>
  );
}
