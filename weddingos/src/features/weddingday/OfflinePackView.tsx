import { Printer } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useVendors } from '@/hooks/useVendors';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useGuests } from '@/hooks/useGuests';
import { useGuestOperationalStatuses } from '@/hooks/useGuestOperationalStatuses';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useRooms } from '@/hooks/useRooms';
import { useHotels } from '@/hooks/useHotels';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useCloseoutItems } from '@/hooks/useCloseoutItems';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { isCriticalCeremonyItem } from '@/utils/ceremonyLogic';
import { criticalOpenLiveIssues } from '@/utils/liveIssueLogic';
import { primaryEmergencyContacts } from '@/utils/emergencyLogic';
import { formatRunSheetClockTime, formatRunSheetRelativeLabel, resolveRunSheetPlannedDateTimeISO, sortRunSheetItems } from '@/utils/runSheetLogic';
import { buildChurchShuttleManifest, buildReceptionShuttleManifest, buildVendorContactManifest, buildVipElderlyManifest } from '@/utils/manifestLogic';
import { DigitalOfflinePackStatus } from './DigitalOfflinePackStatus';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 break-inside-avoid">
      <h3 className="text-sm font-bold text-ink uppercase tracking-wide border-b border-line-soft pb-1">{title}</h3>
      {children}
    </div>
  );
}

export function OfflinePackView() {
  const { settings } = useSettings();
  const { runSheetItems } = useRunSheet();
  const { vendors } = useVendors();
  const { vendorContacts } = useVendorContacts();
  const { vendorDayStatuses } = useVendorDayStatuses();
  const { dutyAssignments } = useDutyAssignments();
  const { ceremonyItems } = useCeremonyItems();
  const { emergencyContacts } = useEmergencyContacts();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { guests } = useGuests();
  const { guestOperationalStatuses } = useGuestOperationalStatuses();
  const { roomAssignments } = useRoomAssignments();
  const { rooms } = useRooms();
  const { hotels } = useHotels();
  const { liveIssues } = useLiveIssues();
  const { closeoutItems } = useCloseoutItems();
  const { churchProfiles } = useChurchProfiles();

  const church = churchProfiles[0];
  const sortedRunSheet = sortRunSheetItems(runSheetItems, settings);
  const vendorContactRows = buildVendorContactManifest(vendors, vendorContacts, vendorDayStatuses);
  const churchShuttleRows = buildChurchShuttleManifest(routes, transportAssignments, vehicles, drivers, guests);
  const receptionShuttleRows = buildReceptionShuttleManifest(routes, transportAssignments, vehicles, drivers, guests);
  const vipRows = buildVipElderlyManifest(guests, guestOperationalStatuses, transportAssignments, routes, roomAssignments, rooms, hotels, dutyAssignments);
  const criticalItems = ceremonyItems.filter((i) => i.applicability === 'Applicable' && isCriticalCeremonyItem(i));
  const criticalIssues = criticalOpenLiveIssues(liveIssues);
  const topEmergencyContacts = primaryEmergencyContacts(emergencyContacts);

  return (
    <div className="space-y-4">
      <div className="no-print">
        <DigitalOfflinePackStatus />
      </div>
      <div className="no-print flex justify-end">
        <Button variant="primary" icon={<Printer className="size-4" aria-hidden="true" />} onClick={() => window.print()}>
          Print offline pack
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {settings.couple.groomName} &amp; {settings.couple.brideName} — Offline Pack
            </h2>
            <p className="text-sm text-ink-faint">
              {settings.wedding.date} · Ceremony {settings.wedding.ceremonyTime} · Reception {settings.wedding.receptionTime} · Church: {settings.wedding.church}
              {church?.address ? ` (${church.address})` : ''} · Reception venue: {settings.wedding.receptionVenue}
            </p>
          </div>

          <Section title="Top emergency contacts">
            <ul className="text-sm text-ink space-y-0.5">
              {topEmergencyContacts.map((c) => (
                <li key={c.id}>
                  [{c.category}] {c.name} — {c.phone}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Run sheet">
            <ul className="text-sm text-ink space-y-0.5">
              {sortedRunSheet.map((item) => (
                <li key={item.id}>
                  {formatRunSheetClockTime(resolveRunSheetPlannedDateTimeISO(item, settings))} ({formatRunSheetRelativeLabel(item)}) — {item.activity}
                  {item.location ? ` @ ${item.location}` : ''}
                  {item.owner ? ` — owner: ${item.owner}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Vendor contacts">
            <ul className="text-sm text-ink space-y-0.5">
              {vendorContactRows.map((v, i) => (
                <li key={i}>
                  {v.vendorName} ({v.category}) — {v.primaryContact ?? 'no phone'}
                  {v.backupContact ? ` / backup ${v.backupContact}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Duty roster">
            <ul className="text-sm text-ink space-y-0.5">
              {dutyAssignments.map((d) => (
                <li key={d.id}>
                  {d.role} — {d.personName} {d.phone ? `(${d.phone})` : ''}
                  {d.backupPersonName ? ` — backup: ${d.backupPersonName}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Critical ceremony items">
            <ul className="text-sm text-ink space-y-0.5">
              {criticalItems.map((i) => (
                <li key={i.id}>
                  {i.name} — custodian: {i.custodian ?? 'unassigned'} ({i.verificationStatus})
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Pickup / shuttle manifests">
            <p className="text-xs font-semibold text-ink-faint">Church shuttle</p>
            <ul className="text-sm text-ink space-y-0.5">
              {churchShuttleRows.map((r, i) => (
                <li key={i}>
                  {r.routeName} — {r.departureTime ?? '—'} — {r.guestNames.join(', ') || 'no guests assigned'}
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-ink-faint mt-2">Reception shuttle</p>
            <ul className="text-sm text-ink space-y-0.5">
              {receptionShuttleRows.map((r, i) => (
                <li key={i}>
                  {r.routeName} — {r.departureTime ?? '—'} — {r.guestNames.join(', ') || 'no guests assigned'}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="VIP / elderly list">
            <ul className="text-sm text-ink space-y-0.5">
              {vipRows.map((r, i) => (
                <li key={i}>
                  {r.guestName} — {r.requirement}
                  {r.assignedHelper ? ` — helper: ${r.assignedHelper}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Open critical issues">
            {criticalIssues.length === 0 ? (
              <p className="text-sm text-ink-faint">None open.</p>
            ) : (
              <ul className="text-sm text-ink space-y-0.5">
                {criticalIssues.map((i) => (
                  <li key={i.id}>{i.title}</li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Closeout checklist">
            <ul className="text-sm text-ink space-y-0.5">
              {closeoutItems.map((i) => (
                <li key={i.id}>
                  [{i.status}] {i.title} {i.dueTime ? `(due ${i.dueTime})` : ''}
                </li>
              ))}
            </ul>
          </Section>
        </CardBody>
      </Card>
    </div>
  );
}
