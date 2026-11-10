import { buildMetadata } from '@/lib/seo';
import { GetInvolved } from '@/views/GetInvolved';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/get-involved',
  title: 'Get involved',
  description: 'Register, volunteer, exhibit, partner or attend: five ways to be part of the first Kollam International Literature Festival.',
});

export default function Page() {
  return <GetInvolved lang="en" />;
}
