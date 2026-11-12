import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Speakers } from '@/views/Speakers';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/speakers',
  title: 'Speakers',
  description: 'Voices without borders: the proposed line-up for KILF 2027, from M. Mukundan and Sara Joseph to Manu S. Pillai, Vairamuthu and Lijo Jose Pellissery.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Speakers lang="ml" />
      </div>
    </>
  );
}
