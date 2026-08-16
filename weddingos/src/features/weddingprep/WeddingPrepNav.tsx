import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/wedding-prep', label: 'Overview', end: true },
  { to: '/wedding-prep/church', label: 'Church', end: false },
  { to: '/wedding-prep/ceremony', label: 'Ceremony', end: false },
  { to: '/wedding-prep/ceremony-items', label: 'Ceremony Items', end: false },
  { to: '/wedding-prep/catering', label: 'Catering', end: false },
  { to: '/wedding-prep/decor', label: 'Décor', end: false },
  { to: '/wedding-prep/attire', label: 'Attire', end: false },
  { to: '/wedding-prep/photo-video', label: 'Photo & Video', end: false },
  { to: '/wedding-prep/music-av', label: 'Music & AV', end: false },
  { to: '/wedding-prep/gifts-kits', label: 'Gifts & Kits', end: false },
  { to: '/wedding-prep/readiness', label: 'Readiness', end: false },
  { to: '/wedding-prep/reports', label: 'Reports', end: false },
];

export function WeddingPrepNav() {
  return (
    <nav aria-label="Wedding preparation views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
