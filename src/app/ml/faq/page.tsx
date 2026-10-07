import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Faq } from '@/views/Faq';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/faq',
  title: 'FAQ',
  description: 'When and where is KILF? Languages, passes, volunteering and more: answers to common questions about KILF 2027.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Faq lang="ml" />
      </div>
    </>
  );
}
