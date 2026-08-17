import { useState } from 'react';
import { Download } from 'lucide-react';
import type { CeremonyItemMovementAction } from '@/types';
import { CEREMONY_ITEM_MOVEMENT_ACTIONS } from '@/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Input, Label, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSettings } from '@/hooks/useSettings';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCeremonyItemMovements, useCeremonyItemMovementsForItem } from '@/hooks/useCeremonyItemMovements';
import { isCriticalCeremonyItem } from '@/utils/ceremonyLogic';
import {
  currentLocationForItem,
  isCriticalItemUnverifiedBeforeDeparture,
  isCustodianMissing,
  isItemCheckedOutButNotReceived,
  isItemUsedButNotSecured,
  isLocationMismatchNearDeadline,
  lastMovement,
} from '@/utils/ceremonyItemMovementLogic';
import { ceremonyItemMovementsCsvFilename, ceremonyItemMovementsToCSV } from '@/data/repositories/weddingDayCsv';
import { downloadTextFile } from '@/utils/download';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAuth } from '@/context/AuthContext';
import { enqueueOfflineMutation } from '@/data/offline/offlineMutationQueue';

function ItemRow({ itemId }: { itemId: string }) {
  const { settings } = useSettings();
  const { ceremonyItems } = useCeremonyItems();
  const { addCeremonyItemMovement } = useCeremonyItemMovements();
  const movements = useCeremonyItemMovementsForItem(itemId);
  const isOnline = useOnlineStatus();
  const { supabaseEnabled } = useAuth();
  const [recording, setRecording] = useState(false);
  const [action, setAction] = useState<CeremonyItemMovementAction>('Checked Out');
  const [toLocation, setToLocation] = useState('');
  const [handedBy, setHandedBy] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const item = ceremonyItems.find((i) => i.id === itemId);
  if (!item) return null;

  const referenceISO = settings.weddingDay.simulationDateTimeISO ?? new Date().toISOString();
  const critical = isCriticalCeremonyItem(item);
  const current = currentLocationForItem(item, movements);
  const last = lastMovement(item.id, movements);
  const unverified = isCriticalItemUnverifiedBeforeDeparture(item, settings.wedding.date, referenceISO.slice(0, 10));
  const mismatch = isLocationMismatchNearDeadline(item, movements, referenceISO);
  const missingCustodian = isCustodianMissing(item);
  const checkedOutNotReceived = isItemCheckedOutButNotReceived(item.id, movements);
  const usedNotSecured = isItemUsedButNotSecured(item.id, movements);

  function handleRecord() {
    const current = lastMovement(itemId, movements);
    if (supabaseEnabled && !isOnline) {
      void enqueueOfflineMutation({
        entityType: 'ceremonyItemMovement',
        action: 'create',
        payload: {
          ceremonyItemId: itemId,
          movementAction: action,
          fromLocation: current?.toLocation,
          toLocation: toLocation || undefined,
          handedBy: handedBy || undefined,
          receivedBy: receivedBy || undefined,
        },
      });
    } else {
      addCeremonyItemMovement({
        ceremonyItemId: itemId,
        action,
        timestamp: referenceISO,
        fromLocation: current?.toLocation,
        toLocation: toLocation || undefined,
        handedBy: handedBy || undefined,
        receivedBy: receivedBy || undefined,
      });
    }
    setToLocation('');
    setHandedBy('');
    setReceivedBy('');
    setRecording(false);
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${critical ? 'border-critical/30 bg-critical-bg/30' : 'border-line-soft'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink">{item.name}</span>
          {critical && <Badge tone="critical">Critical</Badge>}
          <Badge tone="neutral">{item.applicability}</Badge>
          <Badge tone={item.verificationStatus === 'Verified' ? 'success' : 'warning'}>{item.verificationStatus}</Badge>
          {last && <Badge tone="info">{last.action}</Badge>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setRecording((r) => !r)}>
          Record movement
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <p>
          <span className="text-ink-faint">Custodian: </span>
          {item.custodian ?? '—'}
        </p>
        <p>
          <span className="text-ink-faint">Current location: </span>
          {current ?? '—'}
        </p>
        <p>
          <span className="text-ink-faint">Required location: </span>
          {item.requiredAtLocation ?? '—'}
        </p>
        <p>
          <span className="text-ink-faint">Required by: </span>
          {item.requiredByDate ? `${item.requiredByDate} ${item.requiredByTime ?? ''}` : '—'}
        </p>
      </div>

      {(unverified || mismatch || missingCustodian || checkedOutNotReceived || usedNotSecured) && (
        <div className="flex flex-wrap gap-1.5">
          {unverified && <Badge tone="critical">Unverified critical item</Badge>}
          {mismatch && <Badge tone="critical">Location mismatch near deadline</Badge>}
          {missingCustodian && <Badge tone="warning">Missing custodian</Badge>}
          {checkedOutNotReceived && <Badge tone="warning">Checked out, not received</Badge>}
          {usedNotSecured && <Badge tone="warning">Used, not secured/returned</Badge>}
        </div>
      )}

      {recording && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 rounded-lg border border-line-soft bg-surface-subtle p-2.5">
          <Field>
            <Label htmlFor={`mv-action-${item.id}`}>Action</Label>
            <Select id={`mv-action-${item.id}`} value={action} onChange={(e) => setAction(e.target.value as CeremonyItemMovementAction)}>
              {CEREMONY_ITEM_MOVEMENT_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor={`mv-to-${item.id}`}>To location</Label>
            <Input id={`mv-to-${item.id}`} value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor={`mv-handed-${item.id}`}>Handed by</Label>
            <Input id={`mv-handed-${item.id}`} value={handedBy} onChange={(e) => setHandedBy(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor={`mv-received-${item.id}`}>Received by</Label>
            <Input id={`mv-received-${item.id}`} value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
          </Field>
          <div className="col-span-2 sm:col-span-4">
            <Button variant="primary" size="sm" onClick={handleRecord}>
              Save movement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CeremonyItemsDayOfView() {
  const { ceremonyItems } = useCeremonyItems();
  const { ceremonyItemMovements } = useCeremonyItemMovements();

  const applicable = ceremonyItems.filter((i) => i.applicability === 'Applicable');
  const sorted = [...applicable].sort((a, b) => Number(isCriticalCeremonyItem(b)) - Number(isCriticalCeremonyItem(a)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ceremony items — day of ({sorted.length})</CardTitle>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download className="size-3.5" aria-hidden="true" />}
          onClick={() => downloadTextFile(ceremonyItemMovementsCsvFilename(), ceremonyItemMovementsToCSV(ceremonyItemMovements, ceremonyItems), 'text/csv')}
        >
          Export CSV
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        {sorted.length === 0 ? (
          <EmptyState title="No applicable ceremony items" description="Applicable ceremony items from Wedding Prep will appear here." />
        ) : (
          <div className="space-y-3">
            {sorted.map((i) => (
              <ItemRow key={i.id} itemId={i.id} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
