import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  critical: 'bg-critical-bg text-critical border-critical/20',
  high: 'bg-high-bg text-high border-high/20',
  medium: 'bg-medium-bg text-medium border-medium/20',
  low: 'bg-low-bg text-low border-low/20',
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
  danger: 'bg-danger-bg text-danger border-danger/20',
  info: 'bg-info-bg text-info border-info/20',
  neutral: 'bg-surface-muted text-ink-soft border-line',
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
