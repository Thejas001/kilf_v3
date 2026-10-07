import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Youth } from '@/views/Youth';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/youth',
  title: 'Youth',
  description: 'Youth. This stage is yours. Poetry slams, open mics, reels, rap nights and campus ambassadors at KILF 2027.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Youth lang="ml" />
      </div>
    </>
  );
}
