import { buildMetadata } from '@/lib/seo';
import { Contact } from '@/views/Contact';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/contact',
  title: 'Contact',
  description: 'Contact the Kollam International Literature Festival team: kilf2027@gmail.com. Organised by Capital Media.',
});

export default function Page() {
  return <Contact lang="en" />;
}
