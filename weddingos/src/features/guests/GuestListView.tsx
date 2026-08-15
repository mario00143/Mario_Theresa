import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Guest, Household } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { RsvpStatusBadge } from './GuestBadges';
import { useUI } from '@/context/UIContext';
import { useGuests } from '@/hooks/useGuests';
import { getGuestRsvpStatus } from '@/utils/rsvpLogic';

interface GuestListViewProps {
  guests: Guest[];
  households: Household[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function GuestListView({ guests, households, emptyTitle = 'No guests found', emptyDescription = 'Try adjusting your filters.' }: GuestListViewProps) {
  const { openGuestDetail } = useUI();
  const { deleteGuest } = useGuests();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const householdById = new Map(households.map((h) => [h.id, h]));

  if (guests.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const guestToDelete = guests.find((g) => g.id === confirmDeleteId);

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Wedding RSVP</th>
              <th className="px-4 py-3">Engagement RSVP</th>
              <th className="px-4 py-3">Diet</th>
              <th className="px-4 py-3">Accom.</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const household = householdById.get(guest.householdId);
              return (
                <tr
                  key={guest.id}
                  onClick={() => openGuestDetail(guest.id)}
                  className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                >
                  <td className="px-4 py-3 max-w-[12rem]">
                    <p className="font-medium text-ink truncate">{guest.fullName}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap max-w-[10rem] truncate">{household?.householdName ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{household?.side ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{guest.ageCategory}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {guest.invitedEvents.includes('Wedding') ? <RsvpStatusBadge status={getGuestRsvpStatus(guest, 'Wedding')} /> : <span className="text-ink-faint text-xs">Not invited</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {guest.invitedEvents.includes('Engagement') ? <RsvpStatusBadge status={getGuestRsvpStatus(guest, 'Engagement')} /> : <span className="text-ink-faint text-xs">Not invited</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{guest.dietaryPreference}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{guest.accommodationRequired ? <Badge tone="info">Yes</Badge> : <span className="text-ink-faint text-xs">No</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{guest.pickupRequired ? <Badge tone="info">Yes</Badge> : <span className="text-ink-faint text-xs">No</span>}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(guest.id);
                      }}
                      aria-label={`Delete guest "${guest.fullName}"`}
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
        {guests.map((guest) => {
          const household = householdById.get(guest.householdId);
          return (
            <li key={guest.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openGuestDetail(guest.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openGuestDetail(guest.id);
                }}
                className="rounded-xl border border-line bg-surface p-4 cursor-pointer active:bg-surface-subtle"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink leading-snug">{guest.fullName}</p>
                  <Badge tone="neutral">{guest.ageCategory}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {household?.householdName ?? 'No household'} · {household?.side ?? '—'}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {guest.invitedEvents.includes('Wedding') && <RsvpStatusBadge status={getGuestRsvpStatus(guest, 'Wedding')} />}
                  {guest.invitedEvents.includes('Engagement') && <RsvpStatusBadge status={getGuestRsvpStatus(guest, 'Engagement')} />}
                  <span className="text-xs text-ink-faint">{guest.dietaryPreference}</span>
                  {guest.accommodationRequired && <Badge tone="info">Accom.</Badge>}
                  {guest.pickupRequired && <Badge tone="info">Pickup</Badge>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete guest"
        message={`Are you sure you want to delete "${guestToDelete?.fullName}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteId) deleteGuest(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
