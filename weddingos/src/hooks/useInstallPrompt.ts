import { useEffect, useState } from 'react';
import { readRaw, writeRaw } from '@/lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'install-prompt-dismissed-at';
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days — "no aggressive repeat prompting" (section 6)

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function recentlyDismissed(): boolean {
  const raw = readRaw(DISMISS_KEY);
  if (!raw) return false;
  return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS;
}

/** Section 6: only offers the install prompt when the browser makes one available, the app isn't already installed, and the user hasn't dismissed it recently. iOS Safari never fires `beforeinstallprompt` at all, so it gets its own manual-instructions path instead. */
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(recentlyDismissed());

  useEffect(() => {
    if (isStandalone()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const canInstall = !isStandalone() && !dismissed && Boolean(deferredEvent);
  const showIosInstructions = !isStandalone() && !dismissed && isIos() && !deferredEvent;

  async function promptInstall(): Promise<void> {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  }

  function dismiss(): void {
    writeRaw(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  return { canInstall, showIosInstructions, promptInstall, dismiss };
}
