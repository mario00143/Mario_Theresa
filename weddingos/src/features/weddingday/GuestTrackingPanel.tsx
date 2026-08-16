import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { GuestOperationalState } from '@/types';
import { GUEST_OPERATIONAL_STATES } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGuests } from '@/hooks/useGuests';
import { useGuestOperationalStatuses } from '@/hooks/useGuestOperationalStatuses';

export function GuestTrackingPanel() {
  const { guests } = useGuests();
  const { guestOperationalStatuses, addGuestOperationalStatus, updateGuestOperationalStatus, deleteGuestOperationalStatus, setGuestOperationalState } = useGuestOperationalStatuses();
  const [newGuestId, setNewGuestId] = useState('');

  const guestById = new Map(guests.map((g) => [g.id, g]));
  const trackedGuestIds = new Set(guestOperationalStatuses.map((s) => s.guestId));
  const untracked = guests.filter((g) => !trackedGuestIds.has(g.id));

  function handleAdd() {
    if (!newGuestId) return;
    addGuestOperationalStatus({ guestId: newGuestId, state: 'Expected', isVip: false, lastUpdatedAt: new Date().toISOString() });
    setNewGuestId('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest tracking — VIP / elderly / accessibility ({guestOperationalStatuses.length})</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs text-ink-faint">
          Lightweight operational tracking for VIPs, elderly guests, accessibility cases, and key family members only — not a general guest tracker.
        </p>

        {guestOperationalStatuses.length === 0 ? (
          <EmptyState title="No guests tracked yet" description="Add a VIP, elderly, or accessibility guest below." />
        ) : (
          <div className="space-y-2.5">
            {guestOperationalStatuses.map((status) => {
              const guest = guestById.get(status.guestId);
              return (
                <div key={status.id} className="rounded-lg border border-line-soft p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink">{guest?.fullName ?? 'Unknown guest'}</span>
                      {status.isVip && <Badge tone="warning">VIP</Badge>}
                      <Badge tone={status.state === 'Assistance Required' ? 'critical' : 'neutral'}>{status.state}</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteGuestOperationalStatus(status.id)}
                      aria-label={`Stop tracking "${guest?.fullName ?? 'guest'}"`}
                      className="shrink-0 rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    <Field>
                      <Label htmlFor={`gos-state-${status.id}`}>State</Label>
                      <Select id={`gos-state-${status.id}`} value={status.state} onChange={(e) => setGuestOperationalState(status.id, e.target.value as GuestOperationalState)}>
                        {GUEST_OPERATIONAL_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <label className="flex items-center gap-1.5 self-end pb-2">
                      <input type="checkbox" checked={status.isVip} onChange={(e) => updateGuestOperationalStatus(status.id, { isVip: e.target.checked })} className="size-4 accent-brand-700" />
                      <span className="text-sm text-ink">VIP</span>
                    </label>
                    <Field>
                      <Label htmlFor={`gos-note-${status.id}`}>Assistance note</Label>
                      <Input id={`gos-note-${status.id}`} defaultValue={status.assistanceNote ?? ''} key={`gos-note-${status.id}`} onBlur={(e) => updateGuestOperationalStatus(status.id, { assistanceNote: e.target.value || undefined })} />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {untracked.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Select value={newGuestId} onChange={(e) => setNewGuestId(e.target.value)} aria-label="Guest to track">
              <option value="">Select a guest to track…</option>
              {untracked.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.fullName}
                </option>
              ))}
            </Select>
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newGuestId}>
              Track guest
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
