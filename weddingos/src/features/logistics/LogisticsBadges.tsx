import { Ban, Check, CheckCircle2, Circle, Clock, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import type { RoomAssignmentStatus, RouteStatus, TransportAssignmentStatus, TravelBookingStatus } from '@/types';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const TRAVEL_BOOKING_CONFIG: Record<TravelBookingStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  'Not Required': { tone: 'neutral', icon: Circle },
  'Not Booked': { tone: 'neutral', icon: Circle },
  Planned: { tone: 'info', icon: Clock },
  Booked: { tone: 'info', icon: Check },
  Confirmed: { tone: 'success', icon: CheckCircle2 },
  Changed: { tone: 'warning', icon: RefreshCw },
  Cancelled: { tone: 'danger', icon: XCircle },
};

export function TravelBookingStatusBadge({ status, className }: { status: TravelBookingStatus; className?: string }) {
  const { tone, icon: Icon } = TRAVEL_BOOKING_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const ROOM_ASSIGNMENT_CONFIG: Record<RoomAssignmentStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Planned: { tone: 'info', icon: Clock },
  Confirmed: { tone: 'success', icon: CheckCircle2 },
  'Checked In': { tone: 'success', icon: Check },
  'Checked Out': { tone: 'neutral', icon: Circle },
  Cancelled: { tone: 'danger', icon: XCircle },
};

export function RoomAssignmentStatusBadge({ status, className }: { status: RoomAssignmentStatus; className?: string }) {
  const { tone, icon: Icon } = ROOM_ASSIGNMENT_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const ROUTE_STATUS_CONFIG: Record<RouteStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Planned: { tone: 'info', icon: Clock },
  Confirmed: { tone: 'success', icon: CheckCircle2 },
  Dispatched: { tone: 'info', icon: Check },
  'In Progress': { tone: 'info', icon: Clock },
  Completed: { tone: 'success', icon: CheckCircle2 },
  Cancelled: { tone: 'danger', icon: XCircle },
};

export function RouteStatusBadge({ status, className }: { status: RouteStatus; className?: string }) {
  const { tone, icon: Icon } = ROUTE_STATUS_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}

const TRANSPORT_ASSIGNMENT_CONFIG: Record<TransportAssignmentStatus, { tone: BadgeTone; icon: typeof Circle }> = {
  Planned: { tone: 'info', icon: Clock },
  Confirmed: { tone: 'success', icon: CheckCircle2 },
  Boarded: { tone: 'success', icon: Check },
  Completed: { tone: 'success', icon: CheckCircle2 },
  'No Show': { tone: 'danger', icon: HelpCircle },
  Cancelled: { tone: 'danger', icon: Ban },
};

export function TransportAssignmentStatusBadge({ status, className }: { status: TransportAssignmentStatus; className?: string }) {
  const { tone, icon: Icon } = TRANSPORT_ASSIGNMENT_CONFIG[status];
  return (
    <Badge tone={tone} icon={<Icon className="size-3" aria-hidden="true" />} className={className}>
      {status}
    </Badge>
  );
}
