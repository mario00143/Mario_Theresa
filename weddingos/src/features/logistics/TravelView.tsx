import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGuests } from '@/hooks/useGuests';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useTravel } from '@/hooks/useTravel';
import { TravelFilters } from './TravelFilters';
import { TravelListView } from './TravelListView';
import { AddTravelModal } from './AddTravelModal';
import { useTravelFilters } from './useTravelFilters';

export function TravelView() {
  const { guests } = useGuests();
  const { households } = useHouseholds();
  const { travelSegments } = useTravel();
  const { filters, setFilter, resetFilters, filtered } = useTravelFilters(travelSegments, guests, households);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Travel</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setAddOpen(true)}>
          Add Travel
        </Button>
      </div>
      <TravelFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} resultCount={filtered.length} />
      <TravelListView segments={filtered} guests={guests} />
      <AddTravelModal open={addOpen} onClose={() => setAddOpen(false)} guests={guests} />
    </div>
  );
}
