import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge, DecisionStatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { InvitationStatusBadge } from '@/features/guests/GuestBadges';
import { TravelBookingStatusBadge } from '@/features/logistics/LogisticsBadges';
import { useUI } from '@/context/UIContext';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useHotels } from '@/hooks/useHotels';
import { useRooms } from '@/hooks/useRooms';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { searchAll } from '@/utils/search';
import { formatDisplayDate } from '@/utils/date';

export function GlobalSearchModal() {
  const { searchOpen, closeSearch, openTaskDetail, openDecisionDetail, openHouseholdDetail, openGuestDetail, openTravelDetail } = useUI();
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { decisions } = useDecisions();
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { hotels } = useHotels();
  const { rooms } = useRooms();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { routes } = useTransportRoutes();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const results = searchAll(tasks, decisions, households, guests, travelSegments, hotels, rooms, vehicles, drivers, routes, query);
  const hasQuery = query.trim().length > 0;
  const hasResults =
    results.tasks.length > 0 ||
    results.decisions.length > 0 ||
    results.households.length > 0 ||
    results.guests.length > 0 ||
    results.travelSegments.length > 0 ||
    results.hotels.length > 0 ||
    results.rooms.length > 0 ||
    results.vehicles.length > 0 ||
    results.drivers.length > 0 ||
    results.routes.length > 0;
  const householdById = new Map(households.map((h) => [h.id, h]));
  const guestById = new Map(guests.map((g) => [g.id, g]));
  const hotelById = new Map(hotels.map((h) => [h.id, h]));

  return (
    <Modal open={searchOpen} onClose={closeSearch} title="Search" size="lg">
      <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 mb-4">
        <Search className="size-4 text-ink-faint shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, decisions, households, guests, travel, hotels, transport…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
          aria-label="Search query"
        />
      </div>

      {!hasQuery && (
        <EmptyState
          title="Start typing to search"
          description="Search across tasks, decisions, households, guests, travel, hotels, and transport by name, service number, booking reference, registration number, or route."
        />
      )}

      {hasQuery && !hasResults && <EmptyState title="No results" description={`Nothing matched "${query}".`} />}

      {hasQuery && results.tasks.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Tasks ({results.tasks.length})</p>
          <ul className="space-y-1">
            {results.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => {
                    openTaskDetail(task.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{task.title}</p>
                    <span className="text-xs text-ink-faint shrink-0">{formatDisplayDate(task.dueDate)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-ink-faint">{task.workstream} · {task.owner}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.decisions.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Decisions ({results.decisions.length})</p>
          <ul className="space-y-1">
            {results.decisions.map((decision) => (
              <li key={decision.id}>
                <button
                  type="button"
                  onClick={() => {
                    openDecisionDetail(decision.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{decision.title}</p>
                    <span className="text-xs text-ink-faint shrink-0">{formatDisplayDate(decision.deadline)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <DecisionStatusBadge status={decision.status} />
                    <span className="text-xs text-ink-faint">{decision.category} · {decision.owner}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.households.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Households ({results.households.length})</p>
          <ul className="space-y-1">
            {results.households.map((household) => (
              <li key={household.id}>
                <button
                  type="button"
                  onClick={() => {
                    openHouseholdDetail(household.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{household.householdName}</p>
                    <InvitationStatusBadge status={household.invitationStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{household.side}</Badge>
                    <span className="text-xs text-ink-faint">{household.primaryContactName} · {household.city}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.guests.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Guests ({results.guests.length})</p>
          <ul className="space-y-1">
            {results.guests.map((guest) => (
              <li key={guest.id}>
                <button
                  type="button"
                  onClick={() => {
                    openGuestDetail(guest.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{guest.fullName}</p>
                    <Badge tone="neutral">{guest.ageCategory}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-faint">
                      {householdById.get(guest.householdId)?.householdName ?? 'No household'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.travelSegments.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Travel ({results.travelSegments.length})</p>
          <ul className="space-y-1">
            {results.travelSegments.map((segment) => (
              <li key={segment.id}>
                <button
                  type="button"
                  onClick={() => {
                    openTravelDetail(segment.id);
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{guestById.get(segment.guestId)?.fullName ?? 'Unknown guest'}</p>
                    <TravelBookingStatusBadge status={segment.bookingStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-faint">
                      {segment.origin} → {segment.destination}
                      {segment.serviceNumber ? ` · ${segment.serviceNumber}` : ''}
                      {segment.bookingReference ? ` · ${segment.bookingReference}` : ''}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && (results.hotels.length > 0 || results.rooms.length > 0) && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Hotels ({results.hotels.length + results.rooms.length})
          </p>
          <ul className="space-y-1">
            {results.hotels.map((hotel) => (
              <li key={hotel.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/logistics/hotels');
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <p className="text-sm font-medium text-ink truncate">{hotel.name}</p>
                  <p className="mt-1 text-xs text-ink-faint">{hotel.area ? `${hotel.area}, ` : ''}{hotel.city}</p>
                </button>
              </li>
            ))}
            {results.rooms.map((room) => (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/logistics/hotels');
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <p className="text-sm font-medium text-ink truncate">Room {room.roomNumber}</p>
                  <p className="mt-1 text-xs text-ink-faint">{hotelById.get(room.hotelId)?.name ?? 'Unknown hotel'}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && (results.vehicles.length > 0 || results.drivers.length > 0 || results.routes.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Transport ({results.vehicles.length + results.drivers.length + results.routes.length})
          </p>
          <ul className="space-y-1">
            {results.vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/logistics/transport');
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{vehicle.name}</p>
                    <Badge tone="neutral">Vehicle</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">{vehicle.registrationNumber ?? 'No registration on file'}</p>
                </button>
              </li>
            ))}
            {results.drivers.map((driver) => (
              <li key={driver.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/logistics/transport');
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{driver.name}</p>
                    <Badge tone="neutral">Driver</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">{driver.phone}</p>
                </button>
              </li>
            ))}
            {results.routes.map((route) => (
              <li key={route.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/logistics/transport');
                    closeSearch();
                  }}
                  className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{route.name}</p>
                    <Badge tone="neutral">Route</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {route.origin} → {route.destination}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
