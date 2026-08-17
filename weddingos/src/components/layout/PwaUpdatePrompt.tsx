import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';

/**
 * Section 6/48: a calm "WeddingOS update available" prompt with explicit
 * Refresh Now / Later — never an automatic reload. `registerType: 'prompt'`
 * in vite.config.ts means the new service worker sits waiting until
 * `updateServiceWorker()` is called, so leaving this on "Later" is truly
 * inert, not just visually dismissed. While Wedding Day Mode is on, the
 * prompt still appears (so nothing is hidden) but nothing about it is
 * more insistent — no repeat nagging, no auto-dismiss timer, no forced
 * reload — the choice always stays with the operator.
 */
export function PwaUpdatePrompt() {
  const { settings } = useSettings();
  const weddingDayModeEnabled = settings.weddingDay.weddingDayModeEnabled;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () => {
      /* Service worker registration failures are non-fatal — the app still works, just without offline/install support this session. */
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:bottom-4 lg:justify-end lg:pr-6">
      <div className="flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg">
        <RefreshCw className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">WeddingOS update available</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {weddingDayModeEnabled
              ? 'A newer version is ready. Refreshing now will interrupt whatever is on screen — most teams wait until after the event.'
              : 'A newer version of the app is ready to use.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="primary" onClick={() => void updateServiceWorker(true)}>
              Refresh Now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
