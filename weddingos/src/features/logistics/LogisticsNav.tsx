import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/logistics', label: 'Overview', end: true },
  { to: '/logistics/travel', label: 'Travel', end: false },
  { to: '/logistics/hotels', label: 'Hotels', end: false },
  { to: '/logistics/rooms', label: 'Rooms', end: false },
  { to: '/logistics/transport', label: 'Transport', end: false },
  { to: '/logistics/assignments', label: 'Assignments', end: false },
  { to: '/logistics/reports', label: 'Reports', end: false },
];

export function LogisticsNav() {
  return (
    <nav aria-label="Logistics views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
