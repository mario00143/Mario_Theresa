import { Printer } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useVendors } from '@/hooks/useVendors';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { isCriticalCeremonyItem } from '@/utils/ceremonyLogic';
import { openLiveIssues } from '@/utils/liveIssueLogic';
import { formatRunSheetClockTime, resolveRunSheetPlannedDateTimeISO, sortRunSheetItems } from '@/utils/runSheetLogic';

const COMMAND_SHEET_LEAD_ROLES = ['Day-of Command Lead', 'Church Lead', 'Ceremony Lead', 'Clergy Coordinator', 'Emergency / Medical Contact', 'Venue Closeout Lead'] as const;

export function CommandSheetView() {
  const { settings } = useSettings();
  const { dutyAssignments } = useDutyAssignments();
  const { vendors } = useVendors();
  const { ceremonyItems } = useCeremonyItems();
  const { routes } = useTransportRoutes();
  const { liveIssues } = useLiveIssues();
  const { runSheetItems } = useRunSheet();
  const { churchProfiles } = useChurchProfiles();

  const church = churchProfiles[0];
  const leads = COMMAND_SHEET_LEAD_ROLES.map((role) => ({ role, duty: dutyAssignments.find((d) => d.role === role) }));
  const criticalVendors = vendors.filter((v) => settings.finance.criticalVendorCategories.includes(v.category));
  const criticalItems = ceremonyItems.filter((i) => i.applicability === 'Applicable' && isCriticalCeremonyItem(i));
  const openIssues = openLiveIssues(liveIssues).slice(0, 5);
  const keyTimings = sortRunSheetItems(
    runSheetItems.filter((i) => i.category === 'Church' || i.category === 'Ceremony' || i.category === 'Reception'),
    settings,
  ).slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end">
        <Button variant="primary" icon={<Printer className="size-4" aria-hidden="true" />} onClick={() => window.print()}>
          Print command sheet
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {settings.couple.groomName} &amp; {settings.couple.brideName} — Wedding Day Command Sheet
            </h2>
            <p className="text-sm text-ink-faint">
              {settings.wedding.date} · Ceremony {settings.wedding.ceremonyTime} · Reception {settings.wedding.receptionTime}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-ink-faint uppercase">Church</p>
              <p className="text-sm text-ink">{settings.wedding.church}</p>
              {church?.address && <p className="text-sm text-ink-faint">{church.address}</p>}
              {church?.churchOfficePhone && <p className="text-sm text-ink-faint">{church.churchOfficePhone}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-faint uppercase">Reception venue</p>
              <p className="text-sm text-ink">{settings.wedding.receptionVenue}</p>
              <p className="text-sm text-ink-faint">{settings.wedding.location}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Key leads</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {leads.map(({ role, duty }) => (
                <div key={role} className="rounded-lg border border-line-soft p-2">
                  <p className="text-xs text-ink-faint">{role}</p>
                  <p className="text-sm font-medium text-ink">{duty?.personName ?? 'Unassigned'}</p>
                  {duty?.phone && <p className="text-xs text-ink-faint">{duty.phone}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Critical vendors</p>
            <ul className="text-sm text-ink space-y-0.5">
              {criticalVendors.map((v) => (
                <li key={v.id}>
                  {v.name} ({v.category}) — {v.phone ?? 'no phone on file'}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Critical ceremony items</p>
            <ul className="text-sm text-ink space-y-0.5">
              {criticalItems.map((i) => (
                <li key={i.id}>
                  {i.name} — custodian: {i.custodian ?? 'unassigned'} ({i.verificationStatus})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Top transport routes</p>
            <ul className="text-sm text-ink space-y-0.5">
              {routes.slice(0, 6).map((r) => (
                <li key={r.id}>
                  {r.name} — {r.plannedDepartureTime ?? '—'} ({r.origin} → {r.destination})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Open issues</p>
            {openIssues.length === 0 ? (
              <p className="text-sm text-ink-faint">None open.</p>
            ) : (
              <ul className="text-sm text-ink space-y-0.5">
                {openIssues.map((i) => (
                  <li key={i.id}>
                    [{i.severity}] {i.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-faint uppercase mb-1">Key timings</p>
            <ul className="text-sm text-ink space-y-0.5">
              {keyTimings.map((item) => (
                <li key={item.id}>
                  {formatRunSheetClockTime(resolveRunSheetPlannedDateTimeISO(item, settings))} — {item.activity}
                </li>
              ))}
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
