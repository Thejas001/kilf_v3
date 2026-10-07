import { buildMetadata } from '@/lib/seo';
import { Khasak } from '@/views/Khasak';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/khasak',
  title: 'Khasakkinte Ithihasam',
  description: 'Khasakkinte Ithihasam (proposed) at KILF 2027: O. V. Vijayan’s 1969 novel staged by Deepan Sivaraman. Choose a theatre ticket, or theatre + Festival Pass.',
});

export default function Page() {
  return <Khasak lang="en" />;
}
