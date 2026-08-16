import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, Radio, Siren } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { DelayPropagationDialog } from './DelayPropagationDialog';
import { FinalReadinessLock } from './FinalReadinessLock';
import { useSettings } from '@/hooks/useSettings';
import { useRunSheet } from '@/hooks/useRunSheet';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useVendors } from '@/hooks/useVendors';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useGuestOperationalStatuses } from '@/hooks/useGuestOperationalStatuses';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import type { RunSheetItem } from '@/types';
import { computeRunSheetTimingStatus, formatRunSheetClockTime, formatRunSheetRelativeLabel, getCurrentRunSheetItem, getNextRunSheetItems, resolveRunSheetPlannedDateTimeISO } from '@/utils/runSheetLogic';
import { computeCommandCenterAlerts, computeEmergencyAlerts, type CommandCenterAlert } from '@/utils/commandCenterLogic';
import type { DelayConflictContext } from '@/utils/delayPropagation';

const STATUS_TONE: Record<RunSheetItem['status'], BadgeTone> = {
  Planned: 'neutral',
  Ready: 'info',
  'In Progress': 'success',
  Delayed: 'critical',
  Complete: 'low',
  Skipped: 'neutral',
  Cancelled: 'neutral',
};

function timingTone(label: string): BadgeTone {
  if (label === 'Ahead') return 'info';
  if (label === 'On Time') return 'success';
  return 'critical';
}

function alertLinkTo(alert: CommandCenterAlert): string {
  switch (alert.linkType) {
    case 'runSheetItem':
      return '/wedding-day/run-sheet';
    case 'liveIssue':
      return '/wedding-day/issues';
    case 'vendor':
      return '/wedding-day/vendors';
    case 'route':
      return '/logistics/transport';
    case 'guest':
      return '/wedding-day/manifests';
    default:
      return '/wedding-day';
  }
}

export function CommandCenterView() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { runSheetItems, startRunSheetItem, completeRunSheetItem, delayRunSheetItem, applyDelayShift } = useRunSheet();
  const { liveIssues } = useLiveIssues();
  const { vendors } = useVendors();
  const { vendorDayStatuses } = useVendorDayStatuses();
  const { ceremonyItems } = useCeremonyItems();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const { guestOperationalStatuses } = useGuestOperationalStatuses();
  const { dutyAssignments } = useDutyAssignments();
  const { churchProfiles } = useChurchProfiles();
  const { photographyPlans } = usePhotographyPlans();

  const [delayDialogItem, setDelayDialogItem] = useState<RunSheetItem | null>(null);
  const [, forceTick] = useState(0);

  const simulating = Boolean(settings.weddingDay.simulationDateTimeISO);
  const quickActionSize = settings.weddingDay.weddingDayModeEnabled ? 'lg' : 'sm';

  useEffect(() => {
    if (simulating) return;
    const id = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [simulating]);

  const referenceISO = settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString();

  const current = getCurrentRunSheetItem(runSheetItems, settings, referenceISO);
  const next = getNextRunSheetItems(runSheetItems, settings, referenceISO, 3);

  const alerts = useMemo(
    () =>
      computeCommandCenterAlerts({
        runSheetItems,
        ceremonyItems,
        liveIssues,
        transportRoutes: routes,
        transportAssignments,
        vendors,
        vendorDayStatuses,
        guestOperationalStatuses,
        settings,
        referenceDateTimeISO: referenceISO,
      }),
    [runSheetItems, ceremonyItems, liveIssues, routes, transportAssignments, vendors, vendorDayStatuses, guestOperationalStatuses, settings, referenceISO],
  );
  const emergencyAlerts = useMemo(() => computeEmergencyAlerts(liveIssues), [liveIssues]);

  const church = churchProfiles[0];
  const delayContext: DelayConflictContext = {
    churchAccessStartDateTimeISO: church?.accessStartTime ? `${settings.wedding.date}T${church.accessStartTime}:00` : undefined,
    photographyPlans,
    transportRoutes: routes,
  };

  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const ceremonyItemById = new Map(ceremonyItems.map((i) => [i.id, i]));
  const routeById = new Map(routes.map((r) => [r.id, r]));

  function ownerPhone(owner?: string): string | undefined {
    if (!owner) return undefined;
    return dutyAssignments.find((d) => d.personName.toLowerCase() === owner.toLowerCase())?.phone;
  }

  function handleDelayConfirm(delayMinutes: number, reason: string, applyItemIds: string[]) {
    if (!delayDialogItem) return;
    delayRunSheetItem(delayDialogItem.id, delayMinutes, reason || undefined);
    if (applyItemIds.length > 0) {
      applyDelayShift(applyItemIds, delayMinutes, `Carried forward a ${delayMinutes}m delay from "${delayDialogItem.activity}"${reason ? ` (${reason})` : ''}.`);
    }
    setDelayDialogItem(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-ink-faint">Reference time</p>
            <p className="text-lg font-semibold text-ink">{formatRunSheetClockTime(referenceISO)}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Field className="w-56">
              <Label htmlFor="simulation-time">Simulate a different time</Label>
              <Input
                id="simulation-time"
                type="datetime-local"
                value={settings.weddingDay.simulationDateTimeISO ? settings.weddingDay.simulationDateTimeISO.slice(0, 16) : ''}
                onChange={(e) => updateSettings({ weddingDay: { ...settings.weddingDay, simulationDateTimeISO: e.target.value ? new Date(e.target.value).toISOString() : undefined } })}
              />
            </Field>
            {simulating && (
              <Button variant="secondary" onClick={() => updateSettings({ weddingDay: { ...settings.weddingDay, simulationDateTimeISO: undefined } })}>
                Use real time
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {emergencyAlerts.length > 0 && (
        <Card className="border-critical/40 bg-critical-bg">
          <CardBody className="flex items-start gap-3">
            <Siren className="size-5 shrink-0 text-critical" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-critical">Emergency alert{emergencyAlerts.length > 1 ? 's' : ''}</p>
              {emergencyAlerts.map((issue) => (
                <p key={issue.id} className="text-sm text-ink">
                  {issue.title} — {issue.category}
                </p>
              ))}
              <Button variant="danger" size="sm" onClick={() => navigate('/wedding-day/emergency')}>
                Emergency contacts
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Now</CardTitle>
          {current && <Badge tone={timingTone(computeRunSheetTimingStatus(current, settings, referenceISO))}>{computeRunSheetTimingStatus(current, settings, referenceISO)}</Badge>}
        </CardHeader>
        <CardBody>
          {!current ? (
            <EmptyState icon={<Radio className="size-8" aria-hidden="true" />} title="Nothing scheduled right now" description="No run-sheet item matches the current time." />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-ink">{current.activity}</p>
                  <p className="text-sm text-ink-faint">
                    {current.category} · {formatRunSheetRelativeLabel(current)} · {formatRunSheetClockTime(resolveRunSheetPlannedDateTimeISO(current, settings))}
                    {current.location ? ` · ${current.location}` : ''}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[current.status]}>{current.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                <p>
                  <span className="text-ink-faint">Owner: </span>
                  <span className="text-ink">{current.owner ?? '—'}</span>
                </p>
                <p>
                  <span className="text-ink-faint">Backup owner: </span>
                  <span className="text-ink">{current.backupOwner ?? '—'}</span>
                </p>
                {(current.delayMinutes ?? 0) > 0 && (
                  <p>
                    <span className="text-ink-faint">Delay: </span>
                    <span className="text-critical font-medium">{current.delayMinutes} min</span>
                  </p>
                )}
              </div>

              {current.requiredItemIds.length > 0 && (
                <div className="text-sm">
                  <p className="text-ink-faint">Required items:</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {current.requiredItemIds.map((id) => {
                      const ceremonyItem = ceremonyItemById.get(id);
                      const verified = ceremonyItem?.verificationStatus === 'Verified';
                      return (
                        <Badge key={id} tone={verified ? 'success' : 'warning'}>
                          {ceremonyItem?.name ?? 'Unknown'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {current.vendorIds.length > 0 && (
                <div className="text-sm">
                  <p className="text-ink-faint">Vendor:</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {current.vendorIds.map((id) => (
                      <Badge key={id} tone="neutral">
                        {vendorById.get(id)?.name ?? 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {current.relatedTransportRouteIds.length > 0 && (
                <div className="text-sm">
                  <p className="text-ink-faint">Transport:</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {current.relatedTransportRouteIds.map((id) => (
                      <Badge key={id} tone="neutral">
                        {routeById.get(id)?.name ?? 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {current.cue && <p className="text-sm text-ink-faint">Cue: {current.cue}</p>}

              <div className="flex flex-wrap gap-2 pt-1">
                {(current.status === 'Planned' || current.status === 'Ready') && (
                  <Button variant="primary" size={quickActionSize} onClick={() => startRunSheetItem(current.id, referenceISO)}>
                    Start
                  </Button>
                )}
                {(current.status === 'In Progress' || current.status === 'Delayed') && (
                  <Button variant="primary" size={quickActionSize} onClick={() => completeRunSheetItem(current.id, referenceISO)}>
                    Complete
                  </Button>
                )}
                <Button variant="secondary" size={quickActionSize} onClick={() => setDelayDialogItem(current)}>
                  Mark delayed
                </Button>
                <Button variant="secondary" size={quickActionSize} onClick={() => navigate('/wedding-day/issues')}>
                  Add issue
                </Button>
                {current.owner && (
                  <Button variant="secondary" size={quickActionSize} icon={<Phone className="size-3.5" aria-hidden="true" />} disabled={!ownerPhone(current.owner)} onClick={() => (window.location.href = `tel:${ownerPhone(current.owner)}`)}>
                    Call {current.owner}
                  </Button>
                )}
                {current.vendorIds.map((id) => {
                  const vendor = vendorById.get(id);
                  if (!vendor?.phone) return null;
                  return (
                    <Button key={id} variant="secondary" size={quickActionSize} icon={<Phone className="size-3.5" aria-hidden="true" />} onClick={() => (window.location.href = `tel:${vendor.phone}`)}>
                      Call {vendor.name}
                    </Button>
                  );
                })}
                {current.requiredItemIds.length > 0 && (
                  <Button variant="ghost" size={quickActionSize} onClick={() => navigate('/wedding-day/ceremony-items')}>
                    View required items
                  </Button>
                )}
                {current.relatedTransportRouteIds.length > 0 && (
                  <Button variant="ghost" size={quickActionSize} onClick={() => navigate('/logistics/transport')}>
                    View transport
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => navigate('/wedding-day/emergency')}>
                  Emergency contacts
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next up</CardTitle>
        </CardHeader>
        <CardBody>
          {next.length === 0 ? (
            <p className="text-sm text-ink-faint">Nothing else planned right now.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {next.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.activity}</p>
                    <p className="text-xs text-ink-faint">
                      {formatRunSheetClockTime(resolveRunSheetPlannedDateTimeISO(item, settings))} · {item.category}
                      {item.location ? ` · ${item.location}` : ''}
                      {item.owner ? ` · ${item.owner}` : ''}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Critical alerts</CardTitle>
          {alerts.length > 0 && <Badge tone="critical">{alerts.length}</Badge>}
        </CardHeader>
        <CardBody>
          {alerts.length === 0 ? (
            <p className="text-sm text-ink-faint">Nothing needs attention right now.</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-start justify-between gap-3 rounded-lg border border-line-soft px-3 py-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`size-4 shrink-0 mt-0.5 ${alert.severity === 'critical' ? 'text-critical' : 'text-warning'}`} aria-hidden="true" />
                    <p className="text-sm text-ink">{alert.message}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(alertLinkTo(alert))}>
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <FinalReadinessLock />

      {delayDialogItem && (
        <DelayPropagationDialog
          open
          onClose={() => setDelayDialogItem(null)}
          item={delayDialogItem}
          allItems={runSheetItems}
          settings={settings}
          vendors={vendors}
          context={delayContext}
          onConfirm={handleDelayConfirm}
        />
      )}
    </div>
  );
}
