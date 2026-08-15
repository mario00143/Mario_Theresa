import { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import type { GuestEvent } from '@/types';
import { useGuests } from '@/hooks/useGuests';
import { computeMealCounts } from '@/utils/guestStats';

export function MealCountPanel() {
  const { guests } = useGuests();
  const [event, setEvent] = useState<GuestEvent>('Wedding');
  const counts = computeMealCounts(guests, event);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal count — confirmed attendees</CardTitle>
        <div className="flex rounded-lg border border-line p-1">
          {(['Wedding', 'Engagement'] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEvent(e)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${event === e ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">By age</p>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Adults" value={counts.adults} />
            <StatTile label="Children" value={counts.children} />
            <StatTile label="Infants" value={counts.infants} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">By diet</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(Object.keys(counts.byDiet) as (keyof typeof counts.byDiet)[]).map((diet) => (
              <StatTile key={diet} label={diet} value={counts.byDiet[diet]} />
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
