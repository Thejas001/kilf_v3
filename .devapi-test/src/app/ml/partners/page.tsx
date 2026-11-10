import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Partners } from '@/views/Partners';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/partners',
  title: 'Partner with us',
  description: 'Your brand. Our story. One lake. Partnership tiers, benefits and enquiries for KILF 2027.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Partners lang="ml" />
      </div>
    </>
  );
}
