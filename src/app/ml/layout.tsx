import type { ReactNode } from 'react';
import { SiteShell } from '@/components/SiteShell';

export default function MalayalamLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="ml">{children}</SiteShell>;
}
