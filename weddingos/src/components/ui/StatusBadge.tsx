import { Ban, Check, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import type { ContractStatus, PaymentScheduleStatus, QuoteStatus, RefundStatus, TaskStatus, VendorStatus } from '@/types';
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

const VENDOR_CONFIG: Record<VendorStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Researching: { tone: 'neutral', icon: Circle },
  Shortlisted: { tone: 'neutral', icon: Circle },
  Quoted: { tone: 'info', icon: Clock },
  Negotiating: { tone: 'warning', icon: Clock },
  Selected: { tone: 'info', icon: Check },
  Contracted: { tone: 'info', icon: Check },
  Confirmed: { tone: 'success', icon: CheckCircle2 },
  Completed: { tone: 'success', icon: CheckCircle2 },
  Cancelled: { tone: 'neutral', icon: XCircle },
};

export function VendorStatusBadge({ status, className }: { status: VendorStatus; className?: string }) {
  const { tone, icon: Icon } = VENDOR_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const QUOTE_CONFIG: Record<QuoteStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Received: { tone: 'neutral', icon: Circle },
  'Under Review': { tone: 'info', icon: Clock },
  Negotiating: { tone: 'warning', icon: Clock },
  Accepted: { tone: 'success', icon: CheckCircle2 },
  Rejected: { tone: 'danger', icon: XCircle },
  Expired: { tone: 'danger', icon: Ban },
};

export function QuoteStatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  const { tone, icon: Icon } = QUOTE_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const CONTRACT_CONFIG: Record<ContractStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Draft: { tone: 'neutral', icon: Circle },
  'Under Review': { tone: 'info', icon: Clock },
  Signed: { tone: 'success', icon: Check },
  Active: { tone: 'info', icon: Check },
  Completed: { tone: 'success', icon: CheckCircle2 },
  Cancelled: { tone: 'neutral', icon: XCircle },
};

export function ContractStatusBadge({ status, className }: { status: ContractStatus; className?: string }) {
  const { tone, icon: Icon } = CONTRACT_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const PAYMENT_SCHEDULE_CONFIG: Record<PaymentScheduleStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Upcoming: { tone: 'neutral', icon: Circle },
  Due: { tone: 'warning', icon: Clock },
  Overdue: { tone: 'danger', icon: Ban },
  'Partially Paid': { tone: 'warning', icon: Clock },
  Paid: { tone: 'success', icon: CheckCircle2 },
  Cancelled: { tone: 'neutral', icon: XCircle },
};

export function PaymentScheduleStatusBadge({ status, className }: { status: PaymentScheduleStatus; className?: string }) {
  const { tone, icon: Icon } = PAYMENT_SCHEDULE_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const REFUND_CONFIG: Record<RefundStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Expected: { tone: 'neutral', icon: Circle },
  'Partially Received': { tone: 'warning', icon: Clock },
  Received: { tone: 'success', icon: CheckCircle2 },
  Waived: { tone: 'neutral', icon: Ban },
  Disputed: { tone: 'danger', icon: XCircle },
};

export function RefundStatusBadge({ status, className }: { status: RefundStatus; className?: string }) {
  const { tone, icon: Icon } = REFUND_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}
