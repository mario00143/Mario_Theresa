import { ArrowDown, ArrowUp, Minus, TriangleAlert } from 'lucide-react';
import type { Priority } from '@/types';
import { Badge, type BadgeTone } from './Badge';

const CONFIG: Record<Priority, { tone: BadgeTone; icon: typeof TriangleAlert }> = {
  Critical: { tone: 'critical', icon: TriangleAlert },
  High: { tone: 'high', icon: ArrowUp },
  Medium: { tone: 'medium', icon: Minus },
  Low: { tone: 'low', icon: ArrowDown },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const { tone, icon: Icon } = CONFIG[priority];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {priority}
    </Badge>
  );
}
