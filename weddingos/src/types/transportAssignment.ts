export const TRANSPORT_ASSIGNMENT_STATUSES = ['Planned', 'Confirmed', 'Boarded', 'Completed', 'No Show', 'Cancelled'] as const;
export type TransportAssignmentStatus = (typeof TRANSPORT_ASSIGNMENT_STATUSES)[number];

export interface TransportAssignment {
  id: string;
  routeId: string;
  guestId: string;
  travelSegmentId?: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropLocation?: string;
  seatCount: number;
  luggageCount?: number;
  assistanceRequired: boolean;
  assignmentStatus: TransportAssignmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
