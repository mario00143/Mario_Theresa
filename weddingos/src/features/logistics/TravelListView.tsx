import { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import type { Guest, TravelSegment } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { TravelBookingStatusBadge } from './LogisticsBadges';
import { useUI } from '@/context/UIContext';
import { useTravel } from '@/hooks/useTravel';

interface TravelListViewProps {
  segments: TravelSegment[];
  guests: Guest[];
}

function segmentDateTime(segment: TravelSegment): string {
  const date = segment.direction === 'Arrival' ? segment.arrivalDate : segment.departureDate;
  const time = segment.direction === 'Arrival' ? segment.arrivalTime : segment.departureTime;
  if (!date) return '—';
  return time ? `${date} ${time}` : date;
}

export function TravelListView({ segments, guests }: TravelListViewProps) {
  const { openTravelDetail } = useUI();
  const { deleteTravelSegment, duplicateTravelSegment } = useTravel();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const guestById = new Map(guests.map((g) => [g.id, g]));

  if (segments.length === 0) {
    return <EmptyState title="No travel segments found" description="Try adjusting your filters, or add a new travel segment." />;
  }

  const segmentToDelete = segments.find((s) => s.id === confirmDeleteId);

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pickup/Drop</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => {
              const guest = guestById.get(segment.guestId);
              return (
                <tr
                  key={segment.id}
                  onClick={() => openTravelDetail(segment.id)}
                  className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                >
                  <td className="px-4 py-3 max-w-[10rem]">
                    <p className="font-medium text-ink truncate">{guest?.fullName ?? 'Unknown guest'}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{segment.event}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{segment.direction}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{segment.travelMode}</td>
                  <td className="px-4 py-3 text-ink-soft max-w-[14rem] truncate">
                    {segment.origin} → {segment.destination}
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{segmentDateTime(segment)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <TravelBookingStatusBadge status={segment.bookingStatus} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1">
                      {segment.pickupRequired && <Badge tone="info">Pickup</Badge>}
                      {segment.dropRequired && <Badge tone="info">Drop</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTravelSegment(segment.id);
                        }}
                        aria-label={`Duplicate travel segment for "${guest?.fullName ?? 'guest'}"`}
                        className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-ink"
                      >
                        <Copy className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(segment.id);
                        }}
                        aria-label={`Delete travel segment for "${guest?.fullName ?? 'guest'}"`}
                        className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="sm:hidden space-y-2.5">
        {segments.map((segment) => {
          const guest = guestById.get(segment.guestId);
          return (
            <li key={segment.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openTravelDetail(segment.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openTravelDetail(segment.id);
                }}
                className="rounded-xl border border-line bg-surface p-4 cursor-pointer active:bg-surface-subtle"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink leading-snug">{guest?.fullName ?? 'Unknown guest'}</p>
                  <Badge tone="neutral">{segment.direction}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {segment.origin} → {segment.destination} · {segment.travelMode}
                </p>
                <p className="mt-1 text-xs text-ink-faint">{segmentDateTime(segment)}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <TravelBookingStatusBadge status={segment.bookingStatus} />
                  {segment.pickupRequired && <Badge tone="info">Pickup</Badge>}
                  {segment.dropRequired && <Badge tone="info">Drop</Badge>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete travel segment"
        message={`Are you sure you want to delete this travel segment for "${segmentToDelete ? (guestById.get(segmentToDelete.guestId)?.fullName ?? 'this guest') : ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteId) deleteTravelSegment(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
