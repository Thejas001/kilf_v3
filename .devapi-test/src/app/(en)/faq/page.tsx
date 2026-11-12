import { buildMetadata } from '@/lib/seo';
import { Faq } from '@/views/Faq';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/faq',
  title: 'FAQ',
  description: 'When and where is KILF? Languages, passes, volunteering and more: answers to common questions about KILF 2027.',
});

export default function Page() {
  return <Faq lang="en" />;
}
