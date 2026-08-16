import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/vendors', label: 'Overview', end: true },
  { to: '/vendors/vendors', label: 'Vendors', end: false },
  { to: '/vendors/quotes', label: 'Quotes', end: false },
  { to: '/vendors/contracts', label: 'Contracts', end: false },
  { to: '/vendors/budget', label: 'Budget', end: false },
  { to: '/vendors/payments', label: 'Payments', end: false },
  { to: '/vendors/reports', label: 'Reports', end: false },
];

export function VendorsNav() {
  return (
    <nav aria-label="Vendors and budget views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
