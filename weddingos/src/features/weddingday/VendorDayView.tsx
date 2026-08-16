import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Phone, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSettings } from '@/hooks/useSettings';
import { useVendors } from '@/hooks/useVendors';
import { useVendorDayStatuses } from '@/hooks/useVendorDayStatuses';
import { isVendorLate, isVendorNoShow, isVendorSetupIncompleteNearServiceStart, isVendorTeamShort } from '@/utils/vendorDayLogic';
import { weddingDateTimeISO } from '@/utils/date';
import { vendorDayStatusCsvFilename, vendorDayStatusToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';
import type { VendorDayStatusValue } from '@/types';

const STATUS_TONE: Record<VendorDayStatusValue, BadgeTone> = {
  Expected: 'neutral',
  'En Route': 'info',
  Arrived: 'success',
  'Setting Up': 'info',
  Ready: 'success',
  'In Service': 'success',
  Completed: 'low',
  Delayed: 'critical',
  'No Show': 'critical',
};

export function VendorDayView() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { vendors } = useVendors();
  const { vendorDayStatuses, addVendorDayStatus, updateVendorDayStatus, markVendorEnRoute, checkInVendor, markVendorReady, markVendorDelayed, markVendorCompleted, markVendorNoShow } = useVendorDayStatuses();
  const [newVendorId, setNewVendorId] = useState('');

  const referenceISO = settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString();
  const serviceStartISO = weddingDateTimeISO(settings);
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const trackedVendorIds = new Set(vendorDayStatuses.map((s) => s.vendorId));
  const untracked = vendors.filter((v) => !trackedVendorIds.has(v.id));

  function handleAdd() {
    if (!newVendorId) return;
    addVendorDayStatus({ vendorId: newVendorId, primaryContactConfirmed: false, setupComplete: false, serviceReady: false, finalSettlementChecked: false, status: 'Expected' });
    setNewVendorId('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor day-of status ({vendorDayStatuses.length})</CardTitle>
        <Button variant="secondary" size="sm" icon={<Download className="size-3.5" aria-hidden="true" />} onClick={() => downloadTextFile(vendorDayStatusCsvFilename(), vendorDayStatusToCSV(vendorDayStatuses, vendors), 'text/csv')}>
          Export CSV
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        {vendorDayStatuses.length === 0 ? (
          <EmptyState title="No vendors tracked yet" description="Add a vendor below to start tracking its day-of status." />
        ) : (
          <div className="space-y-3">
            {vendorDayStatuses.map((status) => {
              const vendor = vendorById.get(status.vendorId);
              const late = isVendorLate(status, settings.weddingDay.vendorArrivalGraceMinutes, referenceISO);
              const teamShort = isVendorTeamShort(status);
              const noShow = isVendorNoShow(status);
              const setupIncomplete = isVendorSetupIncompleteNearServiceStart(status, serviceStartISO, 60, referenceISO);

              return (
                <div key={status.id} className="rounded-lg border border-line-soft p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink">{vendor?.name ?? 'Unknown vendor'}</span>
                      <Badge tone="neutral">{vendor?.category}</Badge>
                      <Badge tone={STATUS_TONE[status.status]}>{status.status}</Badge>
                      {late && <Badge tone="critical">Late past grace period</Badge>}
                      {teamShort && <Badge tone="warning">Team short</Badge>}
                      {setupIncomplete && <Badge tone="warning">Setup incomplete near service start</Badge>}
                      {noShow && <Badge tone="critical">No show</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <Field>
                      <Label htmlFor={`vds-expected-arrival-${status.id}`}>Expected arrival</Label>
                      <Input
                        id={`vds-expected-arrival-${status.id}`}
                        type="datetime-local"
                        defaultValue={status.expectedArrivalTime ? status.expectedArrivalTime.slice(0, 16) : ''}
                        key={`vds-expected-arrival-${status.id}`}
                        onBlur={(e) => updateVendorDayStatus(status.id, { expectedArrivalTime: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </Field>
                    <Field>
                      <Label htmlFor={`vds-team-expected-${status.id}`}>Team expected</Label>
                      <Input
                        id={`vds-team-expected-${status.id}`}
                        type="number"
                        min={0}
                        defaultValue={status.teamSizeExpected ?? ''}
                        key={`vds-team-expected-${status.id}`}
                        onBlur={(e) => updateVendorDayStatus(status.id, { teamSizeExpected: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </Field>
                    <Field>
                      <Label htmlFor={`vds-team-actual-${status.id}`}>Team actual</Label>
                      <Input
                        id={`vds-team-actual-${status.id}`}
                        type="number"
                        min={0}
                        defaultValue={status.teamSizeActual ?? ''}
                        key={`vds-team-actual-${status.id}`}
                        onBlur={(e) => updateVendorDayStatus(status.id, { teamSizeActual: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </Field>
                    <Field>
                      <Label htmlFor={`vds-status-${status.id}`}>Status</Label>
                      <Select id={`vds-status-${status.id}`} value={status.status} onChange={(e) => updateVendorDayStatus(status.id, { status: e.target.value as VendorDayStatusValue })}>
                        {(['Expected', 'En Route', 'Arrived', 'Setting Up', 'Ready', 'In Service', 'Completed', 'Delayed', 'No Show'] as VendorDayStatusValue[]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={status.primaryContactConfirmed} onChange={(e) => updateVendorDayStatus(status.id, { primaryContactConfirmed: e.target.checked })} className="size-4 accent-brand-700" />
                      Primary contact confirmed
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={status.setupComplete} onChange={(e) => updateVendorDayStatus(status.id, { setupComplete: e.target.checked })} className="size-4 accent-brand-700" />
                      Setup complete
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={status.serviceReady} onChange={(e) => updateVendorDayStatus(status.id, { serviceReady: e.target.checked })} className="size-4 accent-brand-700" />
                      Service ready
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={status.finalSettlementChecked} onChange={(e) => updateVendorDayStatus(status.id, { finalSettlementChecked: e.target.checked })} className="size-4 accent-brand-700" />
                      Final settlement checked
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {vendor?.phone && (
                      <Button variant="secondary" size="sm" icon={<Phone className="size-3.5" aria-hidden="true" />} onClick={() => (window.location.href = `tel:${vendor.phone}`)}>
                        Call
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => markVendorEnRoute(status.id)}>
                      Mark en route
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => checkInVendor(status.id, referenceISO)}>
                      Check in
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => markVendorReady(status.id)}>
                      Mark ready
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => markVendorDelayed(status.id)}>
                      Mark delayed
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => markVendorCompleted(status.id, referenceISO)}>
                      Mark completed
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => markVendorNoShow(status.id)}>
                      Mark no show
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/wedding-day/issues')}>
                      Add issue
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {untracked.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Select value={newVendorId} onChange={(e) => setNewVendorId(e.target.value)} aria-label="Vendor to track">
              <option value="">Select a vendor to track…</option>
              {untracked.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.category})
                </option>
              ))}
            </Select>
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newVendorId}>
              Track vendor
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
