import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, WEDDING_DAY_MODE_NAV_ITEMS } from './navItems';
import { cn } from '@/lib/cn';
import { useSettings } from '@/hooks/useSettings';

export function BottomNav() {
  const { settings } = useSettings();
  const items = settings.weddingDay.weddingDayModeEnabled ? WEDDING_DAY_MODE_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav
      aria-label="Primary"
      className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className={cn('grid', items.length === 5 ? 'grid-cols-5' : 'grid-cols-10')}>
        {items.map((item) => (
          <li key={item.to} className="min-w-0">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2.5 px-0.5 text-[10px] font-medium min-h-14',
                  isActive ? 'text-brand-700' : 'text-ink-faint',
                )
              }
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="w-full truncate text-center">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
