import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/guests', label: 'Overview', end: true },
  { to: '/guests/households', label: 'Households', end: false },
  { to: '/guests/guests', label: 'Guests', end: false },
  { to: '/guests/invitations', label: 'Invitations', end: false },
  { to: '/guests/rsvp', label: 'RSVP', end: false },
  { to: '/guests/reports', label: 'Reports', end: false },
];

export function GuestsNav() {
  return (
    <nav aria-label="Guest management views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
