import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGuests } from '@/hooks/useGuests';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useUI } from '@/context/UIContext';
import { GuestFilters } from './GuestFilters';
import { GuestListView } from './GuestListView';
import { useGuestFilters } from './useGuestFilters';

export function GuestsListView() {
  const { guests } = useGuests();
  const { households } = useHouseholds();
  const { openQuickAdd } = useUI();
  const { filters, setFilter, resetFilters, filtered } = useGuestFilters(guests, households);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Guests</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('guest')}>
          Add Guest
        </Button>
      </div>
      <GuestFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} resultCount={filtered.length} households={households} />
      <GuestListView guests={filtered} households={households} />
    </div>
  );
}
