import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { GuestsPage } from '@/pages/GuestsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { JoinPage } from '@/pages/auth/JoinPage';
import { CreateWorkspacePage } from '@/pages/auth/CreateWorkspacePage';
import { SelectWorkspacePage } from '@/pages/auth/SelectWorkspacePage';

/**
 * Section 42's route-level code splitting: these five modules (plus
 * Documents/Settings) are the heaviest in the bundle-size report (each
 * pulls in its own large feature tree — forms, CSV builders, manifest
 * logic, etc.) and are not needed on first paint, so they're split into
 * separate chunks fetched on first navigation rather than bundled into
 * the initial JS the login/dashboard screen has to download.
 */
const LogisticsPage = lazy(() => import('@/pages/LogisticsPage').then((m) => ({ default: m.LogisticsPage })));
const VendorsPage = lazy(() => import('@/pages/VendorsPage').then((m) => ({ default: m.VendorsPage })));
const WeddingPrepPage = lazy(() => import('@/pages/WeddingPrepPage').then((m) => ({ default: m.WeddingPrepPage })));
const WeddingDayPage = lazy(() => import('@/pages/WeddingDayPage').then((m) => ({ default: m.WeddingDayPage })));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-ink-faint text-sm">Loading…</p>
    </div>
  );
}

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
        <Route
          path="logistics/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LogisticsPage />
            </Suspense>
          }
        />
        <Route
          path="vendors/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <VendorsPage />
            </Suspense>
          }
        />
        <Route
          path="wedding-prep/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <WeddingPrepPage />
            </Suspense>
          }
        />
        <Route
          path="wedding-day/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <WeddingDayPage />
            </Suspense>
          }
        />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="decisions" element={<DecisionsPage />} />
        <Route
          path="documents"
          element={
            <Suspense fallback={<RouteFallback />}>
              <DocumentsPage />
            </Suspense>
          }
        />
        <Route
          path="settings/*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
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
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}
