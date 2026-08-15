import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { computeLogisticsOverview } from '@/utils/logisticsStats';
import { detectLogisticsIssues } from '@/utils/logisticsDataQuality';

export function LogisticsSnapshot() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();

  const stats = computeLogisticsOverview(households, guests, travelSegments, roomTypes, rooms, roomAssignments, vehicles, routes, transportAssignments);
  const issues = detectLogisticsIssues({
    households, guests, travelSegments, rooms, roomTypes, roomAssignments, vehicles, drivers, routes, transportAssignments,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics snapshot</CardTitle>
        <Link to="/logistics" className="text-xs font-medium text-brand-700 hover:underline">
          View Logistics
        </Link>
      </CardHeader>
      <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Guests missing travel" value={stats.travel.guestsMissingTravel} tone={stats.travel.guestsMissingTravel > 0 ? 'critical' : 'default'} />
        <StatTile label="Rooms assigned" value={`${stats.accommodation.assigned}/${stats.accommodation.guestsRequestingAccommodation}`} />
        <StatTile label="Pickups assigned" value={`${stats.transport.pickupsAssigned}/${stats.transport.pickupsRequested}`} />
        <StatTile label="Drops assigned" value={`${stats.transport.dropsAssigned}/${stats.transport.dropsRequested}`} />
        <StatTile label="Critical logistics issues" value={issues.length} tone={issues.length > 0 ? 'critical' : 'default'} />
      </CardBody>
    </Card>
  );
}
