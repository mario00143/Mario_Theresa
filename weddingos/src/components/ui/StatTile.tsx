import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatTileProps {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'critical' | 'warning' | 'success';
  hint?: string;
}

const TONE_CLASSES: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-ink',
  critical: 'text-critical',
  warning: 'text-warning',
  success: 'text-success',
};

export function StatTile({ label, value, tone = 'default', hint }: StatTileProps) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium text-ink-faint">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', TONE_CLASSES[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
