import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Contact } from '@/views/Contact';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/contact',
  title: 'Contact',
  description: 'Contact the Kollam International Literature Festival team: kilf2027@gmail.com. Organised by Capital Media.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Contact lang="ml" />
      </div>
    </>
  );
}
