import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Household } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { InvitationStatusBadge, HouseholdRsvpBadge } from './GuestBadges';
import { useUI } from '@/context/UIContext';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { householdPrimaryRsvpState } from '@/utils/rsvpLogic';

interface HouseholdListViewProps {
  households: Household[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function HouseholdListView({ households, emptyTitle = 'No households found', emptyDescription = 'Try adjusting your filters.' }: HouseholdListViewProps) {
  const { openHouseholdDetail } = useUI();
  const { deleteHousehold, countGuestsForHousehold } = useHouseholds();
  const { guests } = useGuests();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (households.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const householdToDelete = households.find((h) => h.id === confirmDeleteId);
  const memberCountToDelete = householdToDelete ? countGuestsForHousehold(householdToDelete.id) : 0;

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Primary Contact</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Relationship</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Invitation</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {households.map((household) => {
              const memberCount = guests.filter((g) => g.householdId === household.id).length;
              return (
                <tr
                  key={household.id}
                  onClick={() => openHouseholdDetail(household.id)}
                  className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                >
                  <td className="px-4 py-3 max-w-[14rem]">
                    <p className="font-medium text-ink truncate">{household.householdName}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household.primaryContactName || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household.side}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household.relationshipCategory}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household.city || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{memberCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge tone="neutral">{household.invitationPriority}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <InvitationStatusBadge status={household.invitationStatus} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <HouseholdRsvpBadge state={householdPrimaryRsvpState(household, guests)} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(household.id);
                      }}
                      aria-label={`Delete household "${household.householdName}"`}
                      className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="sm:hidden space-y-2.5">
        {households.map((household) => {
          const memberCount = guests.filter((g) => g.householdId === household.id).length;
          return (
            <li key={household.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openHouseholdDetail(household.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openHouseholdDetail(household.id);
                }}
                className="rounded-xl border border-line bg-surface p-4 cursor-pointer active:bg-surface-subtle"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink leading-snug">{household.householdName}</p>
                  <Badge tone="neutral">{household.side}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {household.primaryContactName || 'No contact'} · {household.city || 'No city'} · {memberCount} member{memberCount === 1 ? '' : 's'}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <InvitationStatusBadge status={household.invitationStatus} />
                  <HouseholdRsvpBadge state={householdPrimaryRsvpState(household, guests)} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete household"
        message={
          memberCountToDelete > 0
            ? `"${householdToDelete?.householdName}" has ${memberCountToDelete} guest${memberCountToDelete === 1 ? '' : 's'} attached. Deleting this household will also delete ${memberCountToDelete === 1 ? 'that guest' : 'all of those guests'}. This cannot be undone.`
            : `Are you sure you want to delete "${householdToDelete?.householdName}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteId) deleteHousehold(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
