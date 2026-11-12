import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Privacy } from '@/views/Privacy';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/privacy',
  title: 'Privacy',
  description: 'How the KILF 2027 website handles your personal details.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Privacy />
      </div>
    </>
  );
}
