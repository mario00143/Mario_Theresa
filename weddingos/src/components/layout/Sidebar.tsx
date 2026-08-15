import { NavLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { useSettings } from '@/hooks/useSettings';
import { getCountdown } from '@/utils/countdown';

export function Sidebar() {
  const { settings } = useSettings();
  const weddingCountdown = getCountdown(settings.wedding.date);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-700 text-white">
          <Heart className="size-4.5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink leading-tight">{APP_NAME}</p>
          <p className="text-xs text-ink-faint leading-tight truncate">{APP_SUBTITLE}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2" aria-label="Primary">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-soft hover:bg-surface-subtle hover:text-ink',
                  )
                }
              >
                <item.icon className="size-4.5 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-lg border border-line-soft bg-surface-subtle px-3.5 py-3">
        <p className="text-xs font-medium text-ink-faint">Wedding day</p>
        <p className="text-sm font-semibold text-ink mt-0.5">{weddingCountdown.label}</p>
      </div>
    </aside>
  );
}
