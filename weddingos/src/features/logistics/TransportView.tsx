import { useState } from 'react';
import { VehiclesPanel } from './VehiclesPanel';
import { DriversPanel } from './DriversPanel';
import { RoutesPanel } from './RoutesPanel';

const SUB_TABS = ['Vehicles', 'Drivers', 'Routes'] as const;
type SubTab = (typeof SUB_TABS)[number];

export function TransportView() {
  const [tab, setTab] = useState<SubTab>('Vehicles');

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-ink">Transport</h2>
      <div className="flex gap-1 rounded-lg border border-line p-1 w-fit">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === t ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Vehicles' && <VehiclesPanel />}
      {tab === 'Drivers' && <DriversPanel />}
      {tab === 'Routes' && <RoutesPanel />}
    </div>
  );
}
