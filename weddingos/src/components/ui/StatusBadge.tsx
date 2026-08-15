import { Ban, Check, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import type { TaskStatus } from '@/types';
import { Badge, type BadgeTone } from './Badge';

const CONFIG: Record<TaskStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  'Not Started': { tone: 'neutral', icon: Circle },
  'In Progress': { tone: 'info', icon: Clock },
  Waiting: { tone: 'warning', icon: Clock },
  Blocked: { tone: 'danger', icon: Ban },
  Done: { tone: 'success', icon: CheckCircle2 },
  Cancelled: { tone: 'neutral', icon: XCircle },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const { tone, icon: Icon } = CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const DECISION_CONFIG: Record<string, { tone: BadgeTone; icon: typeof Circle }> = {
  Open: { tone: 'neutral', icon: Circle },
  'Under Discussion': { tone: 'info', icon: Clock },
  Decided: { tone: 'success', icon: Check },
  Deferred: { tone: 'warning', icon: Clock },
};

export function DecisionStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = DECISION_CONFIG[status] ?? { tone: 'neutral' as BadgeTone, icon: Circle };
  const Icon = config.icon;
  return (
    <Badge tone={config.tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}
