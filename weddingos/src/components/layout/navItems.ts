import { CalendarDays, ClipboardList, LayoutDashboard, Route, Scale, Settings, Users, Wallet } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList, end: false },
  { to: '/guests', label: 'Guests', icon: Users, end: false },
  { to: '/logistics', label: 'Logistics', icon: Route, end: false },
  { to: '/vendors', label: 'Vendors', icon: Wallet, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/decisions', label: 'Decisions', icon: Scale, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;
