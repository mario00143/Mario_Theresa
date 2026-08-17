import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/Button';

export function InstallPrompt() {
  const { canInstall, showIosInstructions, promptInstall, dismiss } = useInstallPrompt();

  if (!canInstall && !showIosInstructions) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:bottom-4 lg:left-4 lg:justify-start lg:pr-0">
      <div className="flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg">
        {canInstall ? <Download className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" /> : <Share className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />}
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Install WeddingOS</p>
          {canInstall ? (
            <>
              <p className="mt-0.5 text-xs text-ink-faint">Add it to your home screen for one-tap access, even with a spotty connection on the day.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="primary" onClick={() => void promptInstall()}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Not now
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-0.5 text-xs text-ink-faint">
                Tap the <Share className="inline size-3" aria-hidden="true" /> Share button, then "Add to Home Screen" to install WeddingOS on this iPhone/iPad.
              </p>
              <div className="mt-3">
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Got it
                </Button>
              </div>
            </>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="text-ink-faint hover:text-ink">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
