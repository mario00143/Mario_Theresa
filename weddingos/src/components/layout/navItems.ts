import { CalendarDays, ClipboardList, LayoutDashboard, Scale, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/decisions', label: 'Decisions', icon: Scale, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;
