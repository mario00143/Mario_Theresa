import { Ban, Check, CheckCircle2, Circle, Clock, HelpCircle, Send, Truck, XCircle } from 'lucide-react';
import type { HouseholdRsvpState, InvitationStatus, RsvpStatus } from '@/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const INVITATION_CONFIG: Record<InvitationStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  'Not Prepared': { tone: 'neutral', icon: Circle },
  Ready: { tone: 'info', icon: Clock },
  Sent: { tone: 'info', icon: Send },
  Delivered: { tone: 'success', icon: Truck },
  'Follow-up Required': { tone: 'warning', icon: HelpCircle },
  Complete: { tone: 'success', icon: CheckCircle2 },
};

export function InvitationStatusBadge({ status, className }: { status: InvitationStatus; className?: string }) {
  const { tone, icon: Icon } = INVITATION_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const HOUSEHOLD_RSVP_CONFIG: Record<HouseholdRsvpState, { tone: BadgeTone; icon: typeof Circle }> = {
  Attending: { tone: 'success', icon: CheckCircle2 },
  Declined: { tone: 'danger', icon: XCircle },
  Partial: { tone: 'warning', icon: HelpCircle },
  Pending: { tone: 'neutral', icon: Circle },
};

export function HouseholdRsvpBadge({ state, className }: { state: HouseholdRsvpState; className?: string }) {
  const { tone, icon: Icon } = HOUSEHOLD_RSVP_CONFIG[state];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {state}
    </Badge>
  );
}

const RSVP_CONFIG: Record<RsvpStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Pending: { tone: 'neutral', icon: Circle },
  Attending: { tone: 'success', icon: Check },
  Declined: { tone: 'danger', icon: Ban },
  Maybe: { tone: 'warning', icon: HelpCircle },
  'No Response': { tone: 'neutral', icon: Circle },
};

export function RsvpStatusBadge({ status, className }: { status: RsvpStatus; className?: string }) {
  const { tone, icon: Icon } = RSVP_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}
