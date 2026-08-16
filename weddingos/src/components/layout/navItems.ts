import { AlertTriangle, CalendarDays, ChurchIcon, ClipboardList, FileText, FolderLock, LayoutDashboard, ListChecks, Radio, Route, Scale, Settings, Siren, Users, Wallet } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList, end: false },
  { to: '/guests', label: 'Guests', icon: Users, end: false },
  { to: '/logistics', label: 'Logistics', icon: Route, end: false },
  { to: '/vendors', label: 'Vendors', icon: Wallet, end: false },
  { to: '/wedding-prep', label: 'Wedding Prep', icon: ChurchIcon, end: false },
  { to: '/wedding-day', label: 'Wedding Day', icon: Radio, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/decisions', label: 'Decisions', icon: Scale, end: false },
  { to: '/documents', label: 'Documents', icon: FolderLock, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

/** Condensed set shown on the mobile bottom nav when Wedding Day Mode is on (section 30). */
export const WEDDING_DAY_MODE_NAV_ITEMS = [
  { to: '/wedding-day', label: 'Command', icon: Radio, end: true },
  { to: '/wedding-day/run-sheet', label: 'Run Sheet', icon: ListChecks, end: false },
  { to: '/wedding-day/issues', label: 'Issues', icon: AlertTriangle, end: false },
  { to: '/wedding-day/manifests', label: 'Manifests', icon: FileText, end: false },
  { to: '/wedding-day/emergency', label: 'Emergency', icon: Siren, end: false },
] as const;
