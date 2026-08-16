import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { GuestsPage } from '@/pages/GuestsPage';
import { LogisticsPage } from '@/pages/LogisticsPage';
import { VendorsPage } from '@/pages/VendorsPage';
import { WeddingPrepPage } from '@/pages/WeddingPrepPage';
import { WeddingDayPage } from '@/pages/WeddingDayPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { JoinPage } from '@/pages/auth/JoinPage';
import { CreateWorkspacePage } from '@/pages/auth/CreateWorkspacePage';
import { SelectWorkspacePage } from '@/pages/auth/SelectWorkspacePage';

function SplashScreen() {
  return (
    <div className="bg-surface-subtle flex min-h-screen items-center justify-center">
      <p className="text-ink-faint text-sm">Loading WeddingOS…</p>
    </div>
  );
}

/** The full Phase 1-6 app tree, unchanged — used both for Demo/Local Mode and for an authenticated user with an active workspace. */
function WeddingOSApp() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks/*" element={<TasksPage />} />
        <Route path="guests/*" element={<GuestsPage />} />
        <Route path="logistics/*" element={<LogisticsPage />} />
        <Route path="vendors/*" element={<VendorsPage />} />
        <Route path="wedding-prep/*" element={<WeddingPrepPage />} />
        <Route path="wedding-day/*" element={<WeddingDayPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings/*" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function WorkspaceGate() {
  const { loading, workspaces, currentWorkspace } = useWorkspace();
  if (loading) return <SplashScreen />;

  if (!currentWorkspace) {
    return (
      <Routes>
        <Route path="/create-workspace" element={<CreateWorkspacePage />} />
        <Route path="/*" element={workspaces.length > 1 ? <SelectWorkspacePage /> : <Navigate to="/create-workspace" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/create-workspace" element={<CreateWorkspacePage />} />
      <Route path="/*" element={<WeddingOSApp />} />
    </Routes>
  );
}

function AuthenticatedGate() {
  return (
    <WorkspaceProvider>
      <WorkspaceGate />
    </WorkspaceProvider>
  );
}

/** Production Mode (Supabase configured): auth pages, invite/join, then workspace-gated app. Never falls back to Local Mode after a failed sign-in. */
function SupabaseModeRoutes() {
  const { loading, session } = useAuth();
  if (loading) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={session ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={session ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/*" element={session ? <AuthenticatedGate /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { supabaseEnabled } = useAuth();
  return supabaseEnabled ? <SupabaseModeRoutes /> : <WeddingOSApp />;
}

export default function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </UIProvider>
  );
}
