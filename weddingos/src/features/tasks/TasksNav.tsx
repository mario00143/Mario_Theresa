import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/tasks', label: 'All Tasks', end: true },
  { to: '/tasks/kanban', label: 'Kanban', end: false },
  { to: '/tasks/my-tasks', label: 'My Tasks', end: false },
  { to: '/tasks/overdue', label: 'Overdue', end: false },
  { to: '/tasks/due-soon', label: 'Due Soon', end: false },
  { to: '/tasks/blocked', label: 'Blocked', end: false },
];

export function TasksNav() {
  return (
    <nav aria-label="Task views" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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
