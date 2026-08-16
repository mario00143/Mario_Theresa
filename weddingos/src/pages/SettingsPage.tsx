import { NavLink, Route, Routes } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { EventDetailsForm } from '@/features/settings/EventDetailsForm';
import { OwnerRolesManager } from '@/features/settings/OwnerRolesManager';
import { FinanceSettingsForm } from '@/features/settings/FinanceSettingsForm';
import { WeddingPrepSettingsForm } from '@/features/settings/WeddingPrepSettingsForm';
import { WeddingDaySettingsForm } from '@/features/settings/WeddingDaySettingsForm';
import { DataManagement } from '@/features/settings/DataManagement';

const TABS = [
  { to: '/settings', label: 'Event Details', end: true },
  { to: '/settings/owners', label: 'Owner Roles', end: false },
  { to: '/settings/finance', label: 'Finance', end: false },
  { to: '/settings/wedding-prep', label: 'Wedding Prep', end: false },
  { to: '/settings/wedding-day', label: 'Wedding Day', end: false },
  { to: '/settings/data', label: 'Data Management', end: false },
];

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-faint mt-0.5">Couple, event, and workspace configuration.</p>
      </div>

      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
                isActive ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-faint hover:text-ink',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route index element={<EventDetailsForm />} />
        <Route path="owners" element={<OwnerRolesManager />} />
        <Route path="finance" element={<FinanceSettingsForm />} />
        <Route path="wedding-prep" element={<WeddingPrepSettingsForm />} />
        <Route path="wedding-day" element={<WeddingDaySettingsForm />} />
        <Route path="data" element={<DataManagement />} />
      </Routes>
    </div>
  );
}
