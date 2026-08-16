import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/wedding-day', label: 'Command Center', end: true },
  { to: '/wedding-day/run-sheet', label: 'Run Sheet', end: false },
  { to: '/wedding-day/issues', label: 'Issues', end: false },
  { to: '/wedding-day/duties', label: 'Duties', end: false },
  { to: '/wedding-day/manifests', label: 'Manifests', end: false },
  { to: '/wedding-day/ceremony-items', label: 'Ceremony Items', end: false },
  { to: '/wedding-day/vendors', label: 'Vendors', end: false },
  { to: '/wedding-day/emergency', label: 'Emergency', end: false },
  { to: '/wedding-day/closeout', label: 'Closeout', end: false },
];

export function WeddingDayNav() {
  return (
    <nav aria-label="Wedding day views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
  );
}
