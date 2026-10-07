import { buildMetadata } from '@/lib/seo';
import { About } from '@/views/About';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/about',
  title: 'About',
  description: 'About KILF: why Ashtamudi, why Kollam matters, and the first Kollam International Literature Festival in brief, in English and Malayalam.',
});

export default function Page() {
  return <About lang="en" />;
}
