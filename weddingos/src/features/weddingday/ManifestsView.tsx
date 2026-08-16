import { useMemo, useState } from 'react';
import { Download, Lock, Printer, Unlock } from 'lucide-react';
import type { ManifestType } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGuests } from '@/hooks/useGuests';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useRooms } from '@/hooks/useRooms';
import { useHotels } from '@/hooks/useHotels';
import { useTravel } from '@/hooks/useTravel';
import { useGuestOperationalStatuses } from '@/hooks/useGuestOperationalStatuses';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useVendors } from '@/hooks/useVendors';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { useManifestFreezeState, useManifestFreezeStates } from '@/hooks/useManifestFreezeStates';
import { GuestTrackingPanel } from './GuestTrackingPanel';
import {
  buildChurchShuttleManifest,
  buildDepartureManifest,
  buildFamilyDutyManifest,
  buildGuestArrivalManifest,
  buildHotelRoomingManifest,
  buildReceptionShuttleManifest,
  buildVendorContactManifest,
  buildVipElderlyManifest,
} from '@/utils/manifestLogic';
import {
  churchShuttleManifestCsvFilename,
  churchShuttleManifestToCSV,
  departureManifestCsvFilename,
  departureManifestToCSV,
  guestArrivalManifestCsvFilename,
  guestArrivalManifestToCSV,
  receptionShuttleManifestCsvFilename,
  receptionShuttleManifestToCSV,
  roomingManifestCsvFilename,
  roomingManifestToCSV,
  vipElderlyManifestCsvFilename,
  vipElderlyManifestToCSV,
} from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';

type TabKey = 'guest-arrival' | 'rooming' | 'church-shuttle' | 'reception-shuttle' | 'departure' | 'vip-elderly' | 'vendor-contact' | 'family-duty';

const TABS: { key: TabKey; label: string; freezeType?: ManifestType }[] = [
  { key: 'guest-arrival', label: 'Guest Arrival', freezeType: 'Pickup Manifest' },
  { key: 'rooming', label: 'Hotel Rooming', freezeType: 'Rooming List' },
  { key: 'church-shuttle', label: 'Church Shuttle', freezeType: 'Shuttle Manifest' },
  { key: 'reception-shuttle', label: 'Reception Shuttle', freezeType: 'Shuttle Manifest' },
  { key: 'departure', label: 'Departure', freezeType: 'Drop Manifest' },
  { key: 'vip-elderly', label: 'VIP / Elderly' },
  { key: 'vendor-contact', label: 'Vendor Contact' },
  { key: 'family-duty', label: 'Family Duty', freezeType: 'Duty Roster' },
];

function FreezeControl({ manifestType }: { manifestType: ManifestType }) {
  const state = useManifestFreezeState(manifestType);
  const { freezeManifest, unfreezeManifest } = useManifestFreezeStates();
  const [frozenBy, setFrozenBy] = useState('');

  if (state?.frozen) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="info" icon={<Lock className="size-3" aria-hidden="true" />}>
          Frozen by {state.frozenBy ?? 'unknown'} at {state.frozenAt ? new Date(state.frozenAt).toLocaleString('en-IN') : ''}
        </Badge>
        <Button variant="ghost" size="sm" icon={<Unlock className="size-3.5" aria-hidden="true" />} onClick={() => unfreezeManifest(manifestType)}>
          Unfreeze (override)
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input value={frozenBy} onChange={(e) => setFrozenBy(e.target.value)} placeholder="Your name…" className="max-w-[10rem]" aria-label="Frozen by" />
      <Button
        variant="secondary"
        size="sm"
        icon={<Lock className="size-3.5" aria-hidden="true" />}
        disabled={!frozenBy.trim()}
        onClick={() => freezeManifest(manifestType, frozenBy.trim())}
      >
        Freeze
      </Button>
    </div>
  );
}

function ManifestTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) {
    return <EmptyState title="No rows yet" description="This manifest is derived from existing guest, logistics, and vendor records." />;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-line-soft">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-subtle">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-ink-faint whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ManifestsView() {
  const [tab, setTab] = useState<TabKey>('guest-arrival');
  const { guests } = useGuests();
  const { households } = useHouseholds();
  const { transportAssignments } = useTransportAssignments();
  const { routes } = useTransportRoutes();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { roomAssignments } = useRoomAssignments();
  const { rooms } = useRooms();
  const { hotels } = useHotels();
  const { travelSegments } = useTravel();
  const { guestOperationalStatuses } = useGuestOperationalStatuses();
  const { dutyAssignments } = useDutyAssignments();
  const { vendors } = useVendors();
  const { vendorContacts } = useVendorContacts();
  const { vendorDayStatuses } = useVendorDayStatuses();

  const guestArrivalRows = useMemo(
    () => buildGuestArrivalManifest(guests, households, transportAssignments, routes, vehicles, drivers, roomAssignments, rooms, hotels),
    [guests, households, transportAssignments, routes, vehicles, drivers, roomAssignments, rooms, hotels],
  );
  const roomingRows = useMemo(() => buildHotelRoomingManifest(roomAssignments, rooms, hotels, guests), [roomAssignments, rooms, hotels, guests]);
  const churchShuttleRows = useMemo(() => buildChurchShuttleManifest(routes, transportAssignments, vehicles, drivers, guests), [routes, transportAssignments, vehicles, drivers, guests]);
  const receptionShuttleRows = useMemo(() => buildReceptionShuttleManifest(routes, transportAssignments, vehicles, drivers, guests), [routes, transportAssignments, vehicles, drivers, guests]);
  const departureRows = useMemo(() => buildDepartureManifest(guests, travelSegments, transportAssignments, routes, vehicles, drivers), [guests, travelSegments, transportAssignments, routes, vehicles, drivers]);
  const vipRows = useMemo(
    () => buildVipElderlyManifest(guests, guestOperationalStatuses, transportAssignments, routes, roomAssignments, rooms, hotels, dutyAssignments),
    [guests, guestOperationalStatuses, transportAssignments, routes, roomAssignments, rooms, hotels, dutyAssignments],
  );
  const vendorContactRows = useMemo(() => buildVendorContactManifest(vendors, vendorContacts, vendorDayStatuses), [vendors, vendorContacts, vendorDayStatuses]);
  const familyDutyRows = useMemo(() => buildFamilyDutyManifest(dutyAssignments), [dutyAssignments]);

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manifests</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="no-print flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                tab === t.key ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-line text-ink-soft hover:bg-surface-subtle'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="no-print flex flex-wrap items-center justify-between gap-2">
          <div>{activeTab.freezeType ? <FreezeControl manifestType={activeTab.freezeType} /> : null}</div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Printer className="size-3.5" aria-hidden="true" />} onClick={() => window.print()}>
              Print
            </Button>
            {tab === 'guest-arrival' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(guestArrivalManifestCsvFilename(), guestArrivalManifestToCSV(guestArrivalRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
            {tab === 'rooming' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(roomingManifestCsvFilename(), roomingManifestToCSV(roomingRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
            {tab === 'church-shuttle' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(churchShuttleManifestCsvFilename(), churchShuttleManifestToCSV(churchShuttleRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
            {tab === 'reception-shuttle' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(receptionShuttleManifestCsvFilename(), receptionShuttleManifestToCSV(receptionShuttleRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
            {tab === 'departure' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(departureManifestCsvFilename(), departureManifestToCSV(departureRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
            {tab === 'vip-elderly' && (
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(vipElderlyManifestCsvFilename(), vipElderlyManifestToCSV(vipRows), 'text/csv')}>
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {tab === 'guest-arrival' && (
          <ManifestTable
            headers={['Guest', 'Household', 'Arrival Time', 'Arrival Point', 'Pickup Route', 'Vehicle', 'Driver', 'Hotel', 'Room']}
            rows={guestArrivalRows.map((r) => [r.guestName, r.householdName, r.arrivalTime ?? '—', r.arrivalPoint ?? '—', r.pickupRoute ?? '—', r.vehicle ?? '—', r.driver ?? '—', r.hotel ?? '—', r.room ?? '—'])}
          />
        )}
        {tab === 'rooming' && (
          <ManifestTable
            headers={['Hotel', 'Room', 'Guests', 'Check-In', 'Check-Out', 'Special Needs']}
            rows={roomingRows.map((r) => [r.hotelName, r.roomNumber, r.guestNames.join(', '), r.checkInDate, r.checkOutDate, r.specialNeeds ?? '—'])}
          />
        )}
        {tab === 'church-shuttle' && (
          <ManifestTable
            headers={['Hotel', 'Route', 'Departure', 'Vehicle', 'Driver', 'Guests']}
            rows={churchShuttleRows.map((r) => [r.hotelName ?? '—', r.routeName, r.departureTime ?? '—', r.vehicle ?? '—', r.driver ?? '—', r.guestNames.join(', ')])}
          />
        )}
        {tab === 'reception-shuttle' && (
          <ManifestTable
            headers={['Hotel', 'Route', 'Departure', 'Vehicle', 'Driver', 'Guests']}
            rows={receptionShuttleRows.map((r) => [r.hotelName ?? '—', r.routeName, r.departureTime ?? '—', r.vehicle ?? '—', r.driver ?? '—', r.guestNames.join(', ')])}
          />
        )}
        {tab === 'departure' && (
          <ManifestTable
            headers={['Guest', 'Departure Service', 'Required Departure From Hotel', 'Vehicle', 'Driver']}
            rows={departureRows.map((r) => [r.guestName, r.departureService ?? '—', r.requiredDepartureFromHotel ?? '—', r.vehicle ?? '—', r.driver ?? '—'])}
          />
        )}
        {tab === 'vip-elderly' && (
          <div className="space-y-4">
            <ManifestTable
              headers={['Guest', 'Requirement', 'Assigned Helper', 'Transport', 'Hotel Details']}
              rows={vipRows.map((r) => [r.guestName, r.requirement, r.assignedHelper ?? '—', r.transport ?? '—', r.hotelDetails ?? '—'])}
            />
            <GuestTrackingPanel />
          </div>
        )}
        {tab === 'vendor-contact' && (
          <ManifestTable
            headers={['Vendor', 'Category', 'Primary Contact', 'Backup Contact', 'Arrival Time', 'Location', 'Status']}
            rows={vendorContactRows.map((r) => [r.vendorName, r.category, r.primaryContact ?? '—', r.backupContact ?? '—', r.arrivalTime ?? '—', r.location ?? '—', r.status ?? '—'])}
          />
        )}
        {tab === 'family-duty' && (
          <ManifestTable
            headers={['Role', 'Person', 'Phone', 'Shift', 'Location']}
            rows={familyDutyRows.map((r) => [r.role, r.personName, r.phone ?? '—', r.shift ?? '—', r.location ?? '—'])}
          />
        )}
      </CardBody>
    </Card>
  );
}
