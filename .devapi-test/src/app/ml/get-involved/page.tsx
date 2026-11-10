import { buildMetadata } from '@/lib/seo';
import { FallbackNotice } from '@/components/FallbackNotice';
import { GetInvolved } from '@/views/GetInvolved';

export const metadata = buildMetadata({
  lang: 'ml',
  path: '/get-involved',
  title: 'Get involved',
  description: 'Register, volunteer, exhibit, partner or attend: five ways to be part of the first Kollam International Literature Festival.',
});

export default function Page() {
  return (
    <>
      <FallbackNotice />
      <div lang="en">
        <GetInvolved lang="ml" />
      </div>
    </>
  );
}
