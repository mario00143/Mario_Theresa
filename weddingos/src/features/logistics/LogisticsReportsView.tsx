import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ArrivalReportPanel } from './reports/ArrivalReportPanel';
import { DepartureReportPanel } from './reports/DepartureReportPanel';
import { AccommodationReportPanel } from './reports/AccommodationReportPanel';
import { UnassignedAccommodationReportPanel } from './reports/UnassignedAccommodationReportPanel';
import { PickupExceptionReportPanel } from './reports/PickupExceptionReportPanel';
import { RoomOccupancyReportPanel } from './reports/RoomOccupancyReportPanel';
import { VehicleUtilizationReportPanel } from './reports/VehicleUtilizationReportPanel';
import { DriverDirectoryReportPanel } from './reports/DriverDirectoryReportPanel';
import { ManifestsPanel } from './reports/ManifestsPanel';
import { LogisticsDataIssuesPanel } from './reports/LogisticsDataIssuesPanel';

const TABS = [
  { key: 'arrivals', label: 'Arrivals', Component: ArrivalReportPanel },
  { key: 'departures', label: 'Departures', Component: DepartureReportPanel },
  { key: 'accommodation', label: 'Accommodation', Component: AccommodationReportPanel },
  { key: 'unassigned', label: 'Unassigned Accommodation', Component: UnassignedAccommodationReportPanel },
  { key: 'pickup-exceptions', label: 'Pickup Exceptions', Component: PickupExceptionReportPanel },
  { key: 'room-occupancy', label: 'Room Occupancy', Component: RoomOccupancyReportPanel },
  { key: 'vehicle-utilization', label: 'Vehicle Utilization', Component: VehicleUtilizationReportPanel },
  { key: 'drivers', label: 'Driver Directory', Component: DriverDirectoryReportPanel },
  { key: 'manifests', label: 'Manifests', Component: ManifestsPanel },
  { key: 'data-issues', label: 'Data Issues', Component: LogisticsDataIssuesPanel },
] as const;

export function LogisticsReportsView() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('arrivals');
  const ActivePanel = TABS.find((t) => t.key === active)?.Component ?? ArrivalReportPanel;

  return (
    <div className="space-y-4">
      <nav aria-label="Logistics report sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
              active === tab.key ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-faint hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <ActivePanel />
    </div>
  );
}
