import { useSyncExternalStore } from 'react';

function subscribe(listener: () => void): () => void {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

/** Live browser connectivity status (`navigator.onLine`). This reflects local network interface state, not whether Supabase itself is reachable — good enough for the offline UX this app needs (section 8-15), and avoids polling a health-check endpoint on every render. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
