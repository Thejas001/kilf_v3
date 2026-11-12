import { buildMetadata } from '@/lib/seo';
import { Privacy } from '@/views/Privacy';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/privacy',
  title: 'Privacy',
  description: 'How the KILF 2027 website handles your personal details.',
});

export default function Page() {
  return <Privacy />;
}
