import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { INVITATION_METHODS, INVITATION_STATUSES, type InvitationMethod, type InvitationStatus } from '@/types';
import { useOwners } from '@/hooks/useOwners';
import { useHouseholds } from '@/hooks/useHouseholds';

interface InvitationBulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function InvitationBulkActionsBar({ selectedIds, onClear }: InvitationBulkActionsBarProps) {
  const { owners } = useOwners();
  const { bulkSetInvitationStatus, bulkSetInvitationOwner, bulkSetInvitationMethod, bulkSetFollowUpOwner } = useHouseholds();
  const [status, setStatus] = useState<InvitationStatus>('Sent');
  const [owner, setOwner] = useState('');
  const [method, setMethod] = useState<InvitationMethod>('Printed');
  const [followUpOwner, setFollowUpOwner] = useState('');

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-lg">
      <span className="text-sm font-medium text-ink shrink-0">{selectedIds.length} selected</span>

      <div className="flex items-center gap-1.5">
        <Select aria-label="Bulk status" value={status} onChange={(e) => setStatus(e.target.value as InvitationStatus)} className="w-auto! h-9 text-xs">
          {INVITATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="secondary" onClick={() => bulkSetInvitationStatus(selectedIds, status)}>
          Set status
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <Select aria-label="Bulk invitation owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-auto! h-9 text-xs">
          <option value="">Choose owner…</option>
          {owners.map((o) => (
            <option key={o.id} value={o.name}>
              {o.name}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="secondary" onClick={() => owner && bulkSetInvitationOwner(selectedIds, owner)} disabled={!owner}>
          Assign owner
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <Select aria-label="Bulk invitation method" value={method} onChange={(e) => setMethod(e.target.value as InvitationMethod)} className="w-auto! h-9 text-xs">
          {INVITATION_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="secondary" onClick={() => bulkSetInvitationMethod(selectedIds, [method])}>
          Set method
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <Select aria-label="Bulk follow-up owner" value={followUpOwner} onChange={(e) => setFollowUpOwner(e.target.value)} className="w-auto! h-9 text-xs">
          <option value="">Choose owner…</option>
          {owners.map((o) => (
            <option key={o.id} value={o.name}>
              {o.name}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="secondary" onClick={() => followUpOwner && bulkSetFollowUpOwner(selectedIds, followUpOwner)} disabled={!followUpOwner}>
          Set follow-up owner
        </Button>
      </div>

      <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
        Clear selection
      </Button>
    </div>
  );
}
