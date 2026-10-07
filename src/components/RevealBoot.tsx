'use client';

import { useEffect } from 'react';

/** Runs src/scripts/reveal.ts once the page has mounted (mirrors the deferred <script> at the bottom of body). */
export function RevealBoot() {
  useEffect(() => {
    import('@/scripts/reveal');
  }, []);
  return null;
}
