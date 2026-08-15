import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useUI } from '@/context/UIContext';
import { HouseholdFilters } from './HouseholdFilters';
import { HouseholdListView } from './HouseholdListView';
import { useHouseholdFilters } from './useHouseholdFilters';

export function HouseholdsView() {
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { openQuickAdd } = useUI();
  const { filters, setFilter, resetFilters, filtered, cities } = useHouseholdFilters(households, guests);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Households</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => openQuickAdd('household')}>
          Add Household
        </Button>
      </div>
      <HouseholdFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} resultCount={filtered.length} cities={cities} />
      <HouseholdListView households={filtered} />
    </div>
  );
}
