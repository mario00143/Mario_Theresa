import { Heart, Plus, Radio, Search } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { getCountdown } from '@/utils/countdown';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { SyncStatusIndicator } from './SyncStatusIndicator';

export function Header() {
  const { settings, updateSettings } = useSettings();
  const { openSearch, openQuickAdd } = useUI();
  const { supabaseEnabled } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const weddingDayModeEnabled = settings.weddingDay.weddingDayModeEnabled;
  const engagementCountdown = getCountdown(settings.engagement.date);
  const weddingCountdown = getCountdown(settings.wedding.date);

  return (
    <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/95 backdrop-blur px-4 py-3 lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-700 text-white">
          <Heart className="size-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-ink">{APP_NAME}</span>
        {!supabaseEnabled && (
          <span className="rounded-md border border-line-soft bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Demo
          </span>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-4 text-sm">
        <CountdownChip label="Engagement · Goa" countdown={engagementCountdown} />
        <CountdownChip label="Wedding · Hyderabad" countdown={weddingCountdown} />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {supabaseEnabled && currentWorkspace && <SyncStatusIndicator />}
        <button
          type="button"
          onClick={() => updateSettings({ weddingDay: { ...settings.weddingDay, weddingDayModeEnabled: !weddingDayModeEnabled } })}
          aria-pressed={weddingDayModeEnabled}
          className={cn(
            'hidden sm:flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium',
            weddingDayModeEnabled ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-line text-ink-faint hover:bg-surface-subtle',
          )}
        >
          <Radio className="size-4" aria-hidden="true" />
          Wedding Day Mode {weddingDayModeEnabled ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={openSearch}
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-ink-faint hover:bg-surface-subtle sm:w-56"
          aria-label="Search WeddingOS"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Search tasks, decisions…</span>
        </button>
        <Button variant="primary" size="md" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('task')}>
          <span className="hidden sm:inline">Quick Add</span>
        </Button>
      </div>
    </header>
  );
}

function CountdownChip({ label, countdown }: { label: string; countdown: ReturnType<typeof getCountdown> }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-surface-subtle px-3 py-1.5">
      <span className="text-ink-faint">{label}</span>
      <span className="font-semibold text-ink">{countdown.label}</span>
    </div>
  );
}
