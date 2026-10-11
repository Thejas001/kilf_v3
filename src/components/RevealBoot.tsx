'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Runs src/scripts/reveal.ts on first mount and again after every client-side navigation. */
export function RevealBoot() {
  const pathname = usePathname();
  useEffect(() => {
    let live = true;
    import('@/scripts/reveal').then((m) => live && m.initReveal());
    return () => {
      live = false;
    };
  }, [pathname]);
  return null;
}
