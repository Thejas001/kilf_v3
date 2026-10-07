'use client';

import { useEffect } from 'react';

/** Runs src/scripts/lake-water.ts, which itself finds every [data-lake] on the page (mirrors LakeArt's own <script>). */
export function LakeWaterBoot() {
  useEffect(() => {
    import('@/scripts/lake-water');
  }, []);
  return null;
}
