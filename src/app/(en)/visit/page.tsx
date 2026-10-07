import { buildMetadata } from '@/lib/seo';
import { Visit } from '@/views/Visit';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/visit',
  title: 'Plan your visit',
  description: 'Plan your visit to KILF 2027: three venues in Kollam city close to Ashtamudi Lake, with maps and directions.',
});

export default function Page() {
  return <Visit lang="en" />;
}
