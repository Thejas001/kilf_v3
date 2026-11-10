import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { Profile } from '@/views/Profile';

// TODO(i18n): the profile is English-only for now.
export const metadata = buildMetadata({
  lang: 'ml',
  path: '/profile',
  title: 'Your profile',
  description: 'Your KILF 2027 account, bookings and tickets.',
  noindex: true,
});

export default function Page() {
  return (
    <div lang="en">
      <Suspense>
        <Profile />
      </Suspense>
    </div>
  );
}
