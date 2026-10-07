import { buildMetadata, buildEventJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Home } from '@/views/Home';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/',
  title: 'KILF 2027 · കൊല്ലം അന്താരാഷ്ട്ര സാഹിത്യോത്സവം',
  description: 'കൊല്ലം അന്താരാഷ്ട്ര സാഹിത്യോത്സവത്തിന്റെ ആദ്യ പതിപ്പ്: 2026 ഡിസംബർ 31 – 2027 ജനുവരി 4, അഷ്ടമുടിക്കായലിന്റെ തീരത്ത്. നൂറിലധികം പ്രഭാഷകർ.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={buildEventJsonLd()} />
      <Home lang="ml" />
    </>
  );
}
