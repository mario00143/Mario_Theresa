import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UIProvider } from '@/context/UIContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  return (
    <UIProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks/*" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="decisions" element={<DecisionsPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </UIProvider>
  );
}
