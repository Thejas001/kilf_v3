'use client';

import { useEffect, useState } from 'react';
import { currentGuest, loadSession, subscribe, type Guest } from './auth';

/** The signed-in guest: undefined while the session is being checked, null when signed out. */
export function useGuest(): Guest | null | undefined {
  const [g, setG] = useState<Guest | null | undefined>(undefined);
  useEffect(() => {
    setG(currentGuest());
    const off = subscribe(setG);
    loadSession().then(setG);
    return off;
  }, []);
  return g;
}
