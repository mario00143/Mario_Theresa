import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
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

export function LogisticsOverviewView() {
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

  const stats = computeLogisticsOverview(
    households, guests, travelSegments, roomTypes, rooms, roomAssignments, vehicles, routes, transportAssignments,
  );
  const issues = detectLogisticsIssues({
    households, guests, travelSegments, rooms, roomTypes, roomAssignments, vehicles, drivers, routes, transportAssignments,
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Travel</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Arrival segments" value={stats.travel.arrivalSegments} />
          <StatTile label="Departure segments" value={stats.travel.departureSegments} />
          <StatTile label="Confirmed bookings" value={stats.travel.confirmedBookings} tone="success" />
          <StatTile label="Unconfirmed bookings" value={stats.travel.unconfirmedBookings} tone={stats.travel.unconfirmedBookings > 0 ? 'warning' : 'default'} />
          <StatTile label="Guests missing travel" value={stats.travel.guestsMissingTravel} tone={stats.travel.guestsMissingTravel > 0 ? 'critical' : 'default'} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accommodation</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Guests requesting accommodation" value={stats.accommodation.guestsRequestingAccommodation} />
          <StatTile label="Rooms assigned" value={stats.accommodation.assigned} tone="success" />
          <StatTile label="Rooms unassigned" value={stats.accommodation.unassigned} tone={stats.accommodation.unassigned > 0 ? 'critical' : 'default'} />
          <StatTile label="Available beds" value={stats.rooms.availableBeds} />
          <StatTile label="Accessibility conflicts" value={stats.rooms.accessibilityConflicts} tone={stats.rooms.accessibilityConflicts > 0 ? 'warning' : 'default'} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transport</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Pickups requested" value={stats.transport.pickupsRequested} />
          <StatTile label="Pickups assigned" value={stats.transport.pickupsAssigned} tone="success" />
          <StatTile label="Drops requested" value={stats.transport.dropsRequested} />
          <StatTile label="Drops assigned" value={stats.transport.dropsAssigned} tone="success" />
          <StatTile label="Vehicles" value={stats.vehicles.totalVehicles} />
          <StatTile label="Routes" value={stats.vehicles.totalRoutes} />
          <StatTile label="Capacity conflicts" value={stats.vehicles.capacityConflicts} tone={stats.vehicles.capacityConflicts > 0 ? 'critical' : 'default'} />
        </CardBody>
      </Card>

      <Link to="/logistics/reports" className="block">
        <Card className={issues.length > 0 ? 'border-warning/40' : undefined}>
          <CardBody className="flex items-center gap-3">
            <TriangleAlert className={`size-5 shrink-0 ${issues.length > 0 ? 'text-warning' : 'text-ink-faint'}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">Logistics data issues</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {issues.length === 0 ? 'No data quality issues found.' : `${issues.length} issue${issues.length === 1 ? '' : 's'} to review — see Reports.`}
              </p>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
