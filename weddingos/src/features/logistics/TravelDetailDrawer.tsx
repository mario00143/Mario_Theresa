import { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { EVENTS, TRAVEL_BOOKING_STATUSES, TRAVEL_DIRECTIONS, TRAVEL_MODES, type EventScope, type TravelBookingStatus, type TravelDirection, type TravelMode } from '@/types';
import { useUI } from '@/context/UIContext';
import { useTravel, useTravelSegment } from '@/hooks/useTravel';
import { useGuests } from '@/hooks/useGuests';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { validateTravelSegment } from '@/utils/travelLogic';
import { formatDisplayDate } from '@/utils/date';

export function TravelDetailDrawer() {
  const { selectedTravelSegmentId, closeTravelDetail, openGuestDetail } = useUI();
  const segment = useTravelSegment(selectedTravelSegmentId ?? undefined);
  const { updateTravelSegment, deleteTravelSegment, duplicateTravelSegment } = useTravel();
  const { guests } = useGuests();
  const { transportAssignments } = useTransportAssignments();
  const { routes } = useTransportRoutes();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedTravelSegmentId) return null;

  if (!segment) {
    return (
      <Drawer open onClose={closeTravelDetail} title="Travel segment not found">
        <p className="text-sm text-ink-faint">This travel segment may have been deleted.</p>
      </Drawer>
    );
  }

  const guest = guests.find((g) => g.id === segment.guestId);
  const warnings = validateTravelSegment(segment);
  const linkedAssignment = transportAssignments.find((a) => a.travelSegmentId === segment.id);
  const linkedRoute = linkedAssignment ? routes.find((r) => r.id === linkedAssignment.routeId) : undefined;

  const handleDelete = () => {
    deleteTravelSegment(segment.id);
    setConfirmDelete(false);
    closeTravelDetail();
  };

  const isArrival = segment.direction === 'Arrival';

  return (
    <>
      <Drawer
        open
        onClose={closeTravelDetail}
        title={guest?.fullName ?? 'Unknown guest'}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{segment.direction}</Badge>
            <Badge tone="neutral">{segment.event}</Badge>
            {guest && (
              <button type="button" onClick={() => openGuestDetail(guest.id)} className="text-xs text-brand-700 hover:underline">
                View guest
              </button>
            )}
          </div>
        }
        footer={
          <>
            <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              variant="secondary"
              icon={<Copy className="size-4" aria-hidden="true" />}
              onClick={() => {
                const duplicate = duplicateTravelSegment(segment.id);
                if (duplicate) closeTravelDetail();
              }}
            >
              Duplicate
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {warnings.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning-bg p-3 space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-warning">
                  {w.message}
                </p>
              ))}
            </div>
          )}

          <section className="space-y-3">
            <p className="text-sm font-semibold text-ink">Journey</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="t-event">Event</Label>
                <Select id="t-event" value={segment.event} onChange={(e) => updateTravelSegment(segment.id, { event: e.target.value as EventScope })}>
                  {EVENTS.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="t-direction">Direction</Label>
                <Select id="t-direction" value={segment.direction} onChange={(e) => updateTravelSegment(segment.id, { direction: e.target.value as TravelDirection })}>
                  {TRAVEL_DIRECTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field>
              <Label htmlFor="t-mode">Mode</Label>
              <Select id="t-mode" value={segment.travelMode} onChange={(e) => updateTravelSegment(segment.id, { travelMode: e.target.value as TravelMode })}>
                {TRAVEL_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="t-origin" required>
                  Origin
                </Label>
                <Input id="t-origin" defaultValue={segment.origin} key={`origin-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { origin: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="t-destination" required>
                  Destination
                </Label>
                <Input id="t-destination" defaultValue={segment.destination} key={`destination-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { destination: e.target.value })} />
              </Field>
            </div>
            <FieldHint>Free text — airport, railway station, bus terminal, hotel, or any custom location.</FieldHint>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="t-date">{isArrival ? 'Arrival date' : 'Departure date'}</Label>
                <Input
                  id="t-date"
                  type="date"
                  value={(isArrival ? segment.arrivalDate : segment.departureDate) ?? ''}
                  onChange={(e) =>
                    updateTravelSegment(segment.id, isArrival ? { arrivalDate: e.target.value || undefined } : { departureDate: e.target.value || undefined })
                  }
                />
              </Field>
              <Field>
                <Label htmlFor="t-time">{isArrival ? 'Arrival time' : 'Departure time'}</Label>
                <Input
                  id="t-time"
                  type="time"
                  value={(isArrival ? segment.arrivalTime : segment.departureTime) ?? ''}
                  onChange={(e) =>
                    updateTravelSegment(segment.id, isArrival ? { arrivalTime: e.target.value || undefined } : { departureTime: e.target.value || undefined })
                  }
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor="t-terminal">{isArrival ? 'Arrival terminal' : 'Departure terminal'}</Label>
              <Input
                id="t-terminal"
                defaultValue={(isArrival ? segment.arrivalTerminal : segment.departureTerminal) ?? ''}
                key={`terminal-${segment.id}`}
                onBlur={(e) =>
                  updateTravelSegment(segment.id, isArrival ? { arrivalTerminal: e.target.value || undefined } : { departureTerminal: e.target.value || undefined })
                }
              />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Booking</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="t-carrier">Carrier</Label>
                <Input id="t-carrier" defaultValue={segment.carrier ?? ''} key={`carrier-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { carrier: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="t-service">Service number</Label>
                <Input
                  id="t-service"
                  defaultValue={segment.serviceNumber ?? ''}
                  key={`service-${segment.id}`}
                  onBlur={(e) => updateTravelSegment(segment.id, { serviceNumber: e.target.value || undefined })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="t-status">Booking status</Label>
                <Select id="t-status" value={segment.bookingStatus} onChange={(e) => updateTravelSegment(segment.id, { bookingStatus: e.target.value as TravelBookingStatus })}>
                  {TRAVEL_BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="t-reference">Booking reference</Label>
                <Input
                  id="t-reference"
                  defaultValue={segment.bookingReference ?? ''}
                  key={`reference-${segment.id}`}
                  onBlur={(e) => updateTravelSegment(segment.id, { bookingReference: e.target.value || undefined })}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={segment.ticketConfirmed}
                onChange={(e) => updateTravelSegment(segment.id, { ticketConfirmed: e.target.checked })}
                className="size-4 accent-brand-700"
              />
              Ticket confirmed
            </label>
            <Field>
              <Label htmlFor="t-owner">Booking owner</Label>
              <Input id="t-owner" defaultValue={segment.bookingOwner ?? ''} key={`owner-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { bookingOwner: e.target.value || undefined })} />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Ground logistics</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={segment.pickupRequired}
                  onChange={(e) => updateTravelSegment(segment.id, { pickupRequired: e.target.checked })}
                  className="size-4 accent-brand-700"
                />
                Pickup required
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={segment.dropRequired}
                  onChange={(e) => updateTravelSegment(segment.id, { dropRequired: e.target.checked })}
                  className="size-4 accent-brand-700"
                />
                Drop required
              </label>
            </div>
            {linkedRoute && (
              <p className="text-xs text-ink-soft">
                Linked transport route: <span className="font-medium text-ink">{linkedRoute.name}</span>
              </p>
            )}
            <Field>
              <Label htmlFor="t-luggage">Luggage notes</Label>
              <Input id="t-luggage" defaultValue={segment.luggageNotes ?? ''} key={`luggage-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { luggageNotes: e.target.value || undefined })} />
            </Field>
            <Field>
              <Label htmlFor="t-assistance">Special assistance</Label>
              <Input
                id="t-assistance"
                defaultValue={segment.specialAssistance ?? ''}
                key={`assistance-${segment.id}`}
                onBlur={(e) => updateTravelSegment(segment.id, { specialAssistance: e.target.value || undefined })}
              />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <Field>
              <Label htmlFor="t-notes">Notes</Label>
              <Textarea id="t-notes" defaultValue={segment.notes ?? ''} key={`notes-${segment.id}`} onBlur={(e) => updateTravelSegment(segment.id, { notes: e.target.value || undefined })} />
            </Field>
          </section>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line-soft text-xs text-ink-faint">
            <div>Created {formatDisplayDate(segment.createdAt)}</div>
            <div>Updated {formatDisplayDate(segment.updatedAt)}</div>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete travel segment"
        message={`Are you sure you want to delete this travel segment for "${guest?.fullName ?? 'this guest'}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
