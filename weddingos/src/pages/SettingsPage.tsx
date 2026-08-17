import { NavLink, Route, Routes } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { EventDetailsForm } from '@/features/settings/EventDetailsForm';
import { OwnerRolesManager } from '@/features/settings/OwnerRolesManager';
import { FinanceSettingsForm } from '@/features/settings/FinanceSettingsForm';
import { WeddingPrepSettingsForm } from '@/features/settings/WeddingPrepSettingsForm';
import { WeddingDaySettingsForm } from '@/features/settings/WeddingDaySettingsForm';
import { DataManagement } from '@/features/settings/DataManagement';
import { MyAccountSection } from '@/features/settings/MyAccountSection';
import { WorkspaceSettingsSection } from '@/features/settings/WorkspaceSettingsSection';
import { MembersSection } from '@/features/settings/MembersSection';
import { MigrationWizard } from '@/features/migration/MigrationWizard';
import { AuditLogView } from '@/features/audit/AuditLogView';
import { WorkspaceBackupExport } from '@/features/backup/WorkspaceBackupExport';
import { DiagnosticsSection } from '@/features/settings/DiagnosticsSection';
import { AboutSection } from '@/features/settings/AboutSection';
import { DataCleanupSection } from '@/features/settings/DataCleanupSection';
import { PostWeddingCleanupSection } from '@/features/settings/PostWeddingCleanupSection';
import { ProductionReadinessSection } from '@/features/settings/ProductionReadinessSection';

const LOCAL_TABS = [
  { to: '/settings', label: 'Event Details', end: true },
  { to: '/settings/owners', label: 'Owner Roles', end: false },
  { to: '/settings/finance', label: 'Finance', end: false },
  { to: '/settings/wedding-prep', label: 'Wedding Prep', end: false },
  { to: '/settings/wedding-day', label: 'Wedding Day', end: false },
  { to: '/settings/data', label: 'Data Management', end: false },
  { to: '/settings/data-cleanup', label: 'Demo Data Cleanup', end: false },
  { to: '/settings/post-wedding-cleanup', label: 'Post-Wedding Cleanup', end: false },
  { to: '/settings/readiness', label: 'Production Readiness', end: false },
  { to: '/settings/about', label: 'About', end: false },
];

const SUPABASE_TABS = [
  ...LOCAL_TABS,
  { to: '/settings/account', label: 'My Account', end: false },
  { to: '/settings/workspace', label: 'Workspace', end: false },
  { to: '/settings/members', label: 'Members', end: false },
  { to: '/settings/migration', label: 'Migrate Local Data', end: false },
  { to: '/settings/backup', label: 'Backup', end: false },
  { to: '/settings/audit-log', label: 'Audit Log', end: false },
  { to: '/settings/diagnostics', label: 'Diagnostics', end: false },
];

export function SettingsPage() {
  const { supabaseEnabled } = useAuth();
  const TABS = supabaseEnabled ? SUPABASE_TABS : LOCAL_TABS;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-faint mt-0.5">Couple, event, and workspace configuration.</p>
      </div>

      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-line-soft pb-px">
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

      <Routes>
        <Route index element={<EventDetailsForm />} />
        <Route path="owners" element={<OwnerRolesManager />} />
        <Route path="finance" element={<FinanceSettingsForm />} />
        <Route path="wedding-prep" element={<WeddingPrepSettingsForm />} />
        <Route path="wedding-day" element={<WeddingDaySettingsForm />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="data-cleanup" element={<DataCleanupSection />} />
        <Route path="post-wedding-cleanup" element={<PostWeddingCleanupSection />} />
        <Route path="readiness" element={<ProductionReadinessSection />} />
        <Route path="about" element={<AboutSection />} />
        {supabaseEnabled && (
          <>
            <Route path="account" element={<MyAccountSection />} />
            <Route path="workspace" element={<WorkspaceSettingsSection />} />
            <Route path="members" element={<MembersSection />} />
            <Route path="migration" element={<MigrationWizard />} />
            <Route path="backup" element={<WorkspaceBackupExport />} />
            <Route path="audit-log" element={<AuditLogView />} />
            <Route path="diagnostics" element={<DiagnosticsSection />} />
          </>
        )}
      </Routes>
    </div>
  );
}
