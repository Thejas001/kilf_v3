'use client';

import { useEffect } from 'react';

/** Starts the water on every [data-lake] on the page; re-runs each time a new page mounts one. */
export function LakeWaterBoot() {
  useEffect(() => {
    let live = true;
    import('@/scripts/lake-water').then((m) => {
      if (!live) return;
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(m.boot, { timeout: 2000 });
      else setTimeout(m.boot, 300);
    });
    return () => {
      live = false;
    };
  }, []);
  return null;
}
