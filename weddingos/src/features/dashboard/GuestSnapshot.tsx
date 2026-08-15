import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { computeGuestOverview } from '@/utils/guestStats';

export function GuestSnapshot() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const stats = computeGuestOverview(households, guests);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest snapshot</CardTitle>
        <Link to="/guests" className="text-xs font-medium text-brand-700 hover:underline">
          View Guests
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total guests" value={stats.totalGuests} />
        <StatTile label="Wedding invitees" value={stats.weddingInvitees} />
        <StatTile label="Attending" value={stats.rsvpAttending} tone="success" />
        <StatTile label="Declined" value={stats.rsvpDeclined} />
        <StatTile label="Pending RSVP" value={stats.rsvpPendingOrNoResponse} tone={stats.rsvpPendingOrNoResponse > 0 ? 'warning' : 'default'} />
        <StatTile label="Accommodation requests" value={stats.accommodationRequested} />
        <StatTile label="Pickup requests" value={stats.pickupRequested} />
      </CardBody>
    </Card>
  );
}
