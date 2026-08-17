import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickAddModal } from './QuickAddModal';
import { OfflineBanner } from './OfflineBanner';
import { OfflineSyncManager } from './OfflineSyncManager';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { InstallPrompt } from './InstallPrompt';
import { TaskDetailDrawer } from '@/features/tasks/TaskDetailDrawer';
import { DecisionDetailDrawer } from '@/features/decisions/DecisionDetailDrawer';
import { HouseholdDetailDrawer } from '@/features/guests/HouseholdDetailDrawer';
import { GuestDetailDrawer } from '@/features/guests/GuestDetailDrawer';
import { TravelDetailDrawer } from '@/features/logistics/TravelDetailDrawer';
import { VendorDetailDrawer } from '@/features/vendors/VendorDetailDrawer';

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-subtle">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />

      <GlobalSearchModal />
      <QuickAddModal />
      <OfflineSyncManager />
      <PwaUpdatePrompt />
      <InstallPrompt />
      <TaskDetailDrawer />
      <DecisionDetailDrawer />
      <HouseholdDetailDrawer />
      <GuestDetailDrawer />
      <TravelDetailDrawer />
      <VendorDetailDrawer />
    </div>
  );
}
