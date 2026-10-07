import { buildMetadata } from '@/lib/seo';
import { About } from '@/views/About';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/about',
  title: 'KILF-നെക്കുറിച്ച്',
  description: 'എന്തുകൊണ്ട് അഷ്ടമുടി, കൊല്ലം എന്തുകൊണ്ട് പ്രധാനം — കൊല്ലം അന്താരാഷ്ട്ര സാഹിത്യോത്സവത്തെക്കുറിച്ച് ചുരുക്കത്തിൽ.',
});

export default function Page() {
  return <About lang="ml" />;
}
