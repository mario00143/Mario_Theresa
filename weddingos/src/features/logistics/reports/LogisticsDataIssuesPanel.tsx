import { TriangleAlert } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useUI } from '@/context/UIContext';
import { detectLogisticsIssues } from '@/utils/logisticsDataQuality';

export function LogisticsDataIssuesPanel() {
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
  const { openGuestDetail, openTravelDetail } = useUI();

  const issues = detectLogisticsIssues({
    households, guests, travelSegments, rooms, roomTypes, roomAssignments, vehicles, drivers, routes, transportAssignments,
  });

  const handleClick = (linkType: string, linkId: string) => {
    if (linkType === 'guest' || linkType === 'household') openGuestDetail(linkId);
    else if (linkType === 'travel') openTravelDetail(linkId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logistics data issues</CardTitle>
        <span className="text-xs font-medium text-ink-faint">{issues.length}</span>
      </CardHeader>
      <CardBody className="p-0">
        {issues.length === 0 ? (
          <EmptyState title="No data quality issues" description="Travel, accommodation, and transport records all pass the automated checks." />
        ) : (
          <ul className="divide-y divide-line-soft max-h-[36rem] overflow-y-auto">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => handleClick(issue.linkType, issue.linkId)}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-surface-subtle disabled:cursor-default"
                  disabled={issue.linkType !== 'guest' && issue.linkType !== 'household' && issue.linkType !== 'travel'}
                >
                  <TriangleAlert className="size-4 shrink-0 mt-0.5 text-warning" aria-hidden="true" />
                  <span className="text-sm text-ink">{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
