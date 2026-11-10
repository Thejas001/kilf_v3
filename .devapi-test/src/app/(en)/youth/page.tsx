import { buildMetadata } from '@/lib/seo';
import { Youth } from '@/views/Youth';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/youth',
  title: 'Youth',
  description: 'Youth. This stage is yours. Poetry slams, open mics, reels, rap nights and campus ambassadors at KILF 2027.',
});

export default function Page() {
  return <Youth lang="en" />;
}
