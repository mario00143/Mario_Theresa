import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { updateGuest } from '@/data/repositories/guestRepository';
import { updateTravelSegment } from '@/data/repositories/travelRepository';
import { updateRoomAssignment } from '@/data/repositories/roomAssignmentRepository';
import { updateTransportAssignment } from '@/data/repositories/transportAssignmentRepository';
import { discardOfflineSnapshot } from '@/data/offline/offlineSnapshot';
import { listInvites, revokeInvite } from '@/data/supabase/membershipRepository';

type CategoryKey = 'guestContactInfo' | 'travelBookingRefs' | 'logisticsNotes' | 'expiredInvites' | 'offlineSnapshot';

interface Category {
  key: CategoryKey;
  label: string;
  description: string;
}

const CATEGORIES: Category[] = [
  { key: 'guestContactInfo', label: 'Guest phone numbers & email addresses', description: 'Clears phone/email on every guest record. Names, RSVP history, and dietary/accessibility notes are kept.' },
  { key: 'travelBookingRefs', label: 'Travel booking references', description: 'Clears airline/train/bus booking reference numbers from travel records.' },
  { key: 'logisticsNotes', label: 'Logistics notes', description: 'Clears free-text notes on travel, room, and transport assignment records.' },
  { key: 'expiredInvites', label: 'Expired workspace invites', description: 'Revokes any invite past its expiry date that was never accepted. (Production Mode only.)' },
  { key: 'offlineSnapshot', label: 'Old Offline Pack on this device', description: 'Clears the locally saved Offline Pack from this device only — does not affect any other device or the server.' },
];

/**
 * Section 44's Post-Wedding Data Cleanup — Admin-only, deliberately never
 * runs automatically (no scheduled job, no auto-trigger on any date).
 * Financial records (payments, refunds, budget items, contracts) and the
 * audit log are never touched by any category here — this tool only
 * exists to reduce data retention of contact/logistics information once
 * it's no longer operationally needed, not to remove the historical
 * record of the wedding.
 */
export function PostWeddingCleanupSection() {
  const { isAdmin } = usePermission();
  const { supabaseEnabled } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { roomAssignments } = useRoomAssignments();
  const { transportAssignments } = useTransportAssignments();
  const [selected, setSelected] = useState<Set<CategoryKey>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      guestContactInfo: guests.filter((g) => g.phone || g.email).length,
      travelBookingRefs: travelSegments.filter((s) => s.bookingReference).length,
      logisticsNotes: travelSegments.filter((s) => s.notes).length + roomAssignments.filter((r) => r.notes).length + transportAssignments.filter((a) => a.notes).length,
      expiredInvites: 0,
      offlineSnapshot: 1,
    }),
    [guests, travelSegments, roomAssignments, transportAssignments],
  );

  if (!isAdmin()) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-faint">Post-Wedding Data Cleanup is only available to workspace Admins.</p>
        </CardBody>
      </Card>
    );
  }

  function toggle(key: CategoryKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleRun() {
    setRunning(true);
    let cleared = 0;

    if (selected.has('guestContactInfo')) {
      for (const g of guests) {
        if (g.phone || g.email) {
          updateGuest(g.id, { phone: undefined, email: undefined });
          cleared++;
        }
      }
    }
    if (selected.has('travelBookingRefs')) {
      for (const s of travelSegments) {
        if (s.bookingReference) {
          updateTravelSegment(s.id, { bookingReference: undefined });
          cleared++;
        }
      }
    }
    if (selected.has('logisticsNotes')) {
      for (const s of travelSegments) {
        if (s.notes) updateTravelSegment(s.id, { notes: undefined });
      }
      for (const r of roomAssignments) {
        if (r.notes) updateRoomAssignment(r.id, { notes: undefined });
      }
      for (const a of transportAssignments) {
        if (a.notes) updateTransportAssignment(a.id, { notes: undefined });
      }
    }
    if (selected.has('expiredInvites') && supabaseEnabled && currentWorkspace) {
      const invites = await listInvites(currentWorkspace.id);
      const now = new Date().toISOString();
      for (const invite of invites) {
        if (invite.status === 'Active' && invite.expiresAt < now) {
          await revokeInvite(invite.id);
          cleared++;
        }
      }
    }
    if (selected.has('offlineSnapshot')) {
      await discardOfflineSnapshot();
      cleared++;
    }

    setResult(`Cleanup complete. ${cleared} field(s)/record(s) updated across the selected categories.`);
    setSelected(new Set());
    setRunning(false);
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink">Only use this after the wedding</p>
            <p className="mt-0.5 text-xs text-ink-faint">
              This never runs automatically and never touches payments, refunds, budget items, contracts, or the audit log. Take a backup first
              (Settings → Backup) — some of these changes cannot be undone.
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose what to clear</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {CATEGORIES.filter((c) => c.key !== 'expiredInvites' || supabaseEnabled).map((c) => (
            <label key={c.key} className="flex items-start gap-2.5 rounded-lg border border-line-soft p-3">
              <input type="checkbox" checked={selected.has(c.key)} onChange={() => toggle(c.key)} className="mt-0.5 size-4" />
              <div>
                <p className="text-sm font-medium text-ink">
                  {c.label} {counts[c.key] > 0 && <span className="text-ink-faint">({counts[c.key]})</span>}
                </p>
                <p className="text-xs text-ink-faint">{c.description}</p>
              </div>
            </label>
          ))}
        </CardBody>
      </Card>

      {result && <p className="text-sm text-success">{result}</p>}

      <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={selected.size === 0 || running}>
        Run cleanup for selected categories
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Run post-wedding cleanup?"
        message="This clears the selected data across this workspace. This cannot be undone — make sure you have a recent backup."
        confirmLabel="Run cleanup"
        danger
        onConfirm={() => void handleRun()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
