import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Visit } from '@/views/Visit';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/visit',
  title: 'Plan your visit',
  description: 'Plan your visit to KILF 2027: three venues in Kollam city close to Ashtamudi Lake, with maps and directions.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Visit lang="ml" />
      </div>
    </>
  );
}
