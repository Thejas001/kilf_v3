import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { Khasak } from '@/views/Khasak';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/khasak',
  title: 'Khasakkinte Ithihasam',
  description: 'Khasakkinte Ithihasam (proposed) at KILF 2027: O. V. Vijayan’s 1969 novel staged by Deepan Sivaraman. Choose a theatre ticket, or theatre + Festival Pass.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <Khasak lang="ml" />
      </div>
    </>
  );
}
