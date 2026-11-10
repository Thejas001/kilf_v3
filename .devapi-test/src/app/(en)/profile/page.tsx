import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { Profile } from '@/views/Profile';

export const metadata = buildMetadata({
  lang: 'en',
  path: '/profile',
  title: 'Your profile',
  description: 'Your KILF 2027 account, bookings and tickets.',
  noindex: true,
});

export default function Page() {
  // Profile reads ?booking= from the URL, which needs a Suspense boundary in a static route.
  return (
    <Suspense>
      <Profile />
    </Suspense>
  );
}
