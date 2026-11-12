import type { ReactNode } from 'react';
import { SiteShell } from '@/components/SiteShell';

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
