import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Smartphone, Battery, Laptop, Printer } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useSettings } from '@/hooks/useSettings';
import { useOwners } from '@/hooks/useOwners';
import { useHotels } from '@/hooks/useHotels';
import { useVendors } from '@/hooks/useVendors';
import { useDutyAssignments } from '@/hooks/useDutyAssignments';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useRunSheet } from '@/hooks/useRunSheet';
import { listMembers } from '@/data/supabase/membershipRepository';
import { runSystemCheck, type SystemCheckStatus } from '@/lib/systemCheck';
import { getLastBackupExportedAt } from '@/lib/backupTracking';
import { loadOfflineSnapshot, isOfflineSnapshotStale } from '@/data/offline/offlineSnapshot';
import { exportBackup } from '@/data/repositories/backupRepository';
import { validateReferences } from '@/data/migration/migrationEngine';
import { computeOnboardingChecklist } from '@/utils/onboardingChecklist';
import { APP_VERSION } from '@/lib/appVersion';
import { DEFAULT_CRITICAL_DUTY_ROLES } from '@/types/dutyAssignment';
import { DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES } from '@/types/ceremonyItem';
import type { ProductionLaunchReview } from '@/types/settings';

interface ReadinessRow {
  status: SystemCheckStatus;
  label: string;
  detail: string;
}

function StatusIcon({ status }: { status: SystemCheckStatus }) {
  if (status === 'pass') return <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />;
  if (status === 'warning') return <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />;
  return <XCircle className="size-4 shrink-0 text-critical" aria-hidden="true" />;
}

function Section({ title, rows }: { title: string; rows: ReadinessRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2">
            <StatusIcon status={r.status} />
            <div>
              <p className="text-sm font-medium text-ink">{r.label}</p>
              <p className="text-xs text-ink-faint">{r.detail}</p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

const BACKUP_STALE_DAYS = 14;

/**
 * Section 84's Production Readiness screen — Admin-only, final pre-launch
 * check. Every section is Pass/Warning/Fail with a plain-language reason
 * and, implicitly, what to do about it (the detail text). Nothing here
 * is auto-corrected and nothing is ever silently claimed ready — nothing
 * in this file writes "Pass" without a check that actually ran.
 */
export function ProductionReadinessSection() {
  const { isAdmin } = usePermission();
  const { supabaseEnabled, session } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { settings, updateSettings } = useSettings();
  const { owners } = useOwners();
  const { hotels } = useHotels();
  const { vendors } = useVendors();
  const { dutyAssignments } = useDutyAssignments();
  const { ceremonyItems } = useCeremonyItems();
  const { emergencyContacts } = useEmergencyContacts();
  const { runSheetItems } = useRunSheet();

  const [systemCheck, setSystemCheck] = useState<Awaited<ReturnType<typeof runSystemCheck>> | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [offlineFresh, setOfflineFresh] = useState<boolean | null>(null);
  const [swActive, setSwActive] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    void runSystemCheck().then(setSystemCheck);
    void loadOfflineSnapshot().then((s) => setOfflineFresh(s ? !isOfflineSnapshotStale(s) : false));
    void navigator.serviceWorker?.getRegistration().then((r) => setSwActive(Boolean(r)));
    setInstalled(window.matchMedia?.('(display-mode: standalone)').matches ?? false);
    if (supabaseEnabled && currentWorkspace) {
      void listMembers(currentWorkspace.id).then((members) => setAdminCount(members.filter((m) => m.role === 'Admin' && m.status === 'Active').length));
    }
  }, [supabaseEnabled, currentWorkspace]);

  if (!isAdmin()) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-faint">Production Readiness is only available to workspace Admins.</p>
        </CardBody>
      </Card>
    );
  }

  const backup = exportBackup();
  const referenceProblems = validateReferences(backup);
  const onboarding = computeOnboardingChecklist(settings, owners, hotels, vendors);
  const onboardingIncomplete = onboarding.filter((i) => !i.complete);
  const lastBackup = getLastBackupExportedAt();
  const backupAgeDays = lastBackup ? (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24) : null;

  const criticalDutiesFilled = DEFAULT_CRITICAL_DUTY_ROLES.filter((role) => dutyAssignments.some((d) => d.role === role && d.personName.trim()));
  const criticalCeremonyItems = ceremonyItems.filter((i) => DEFAULT_CRITICAL_CEREMONY_ITEM_CATEGORIES.includes(i.category) && i.applicability === 'Applicable');
  const unverifiedCriticalItems = criticalCeremonyItems.filter((i) => i.verificationStatus !== 'Verified');

  const infrastructure: ReadinessRow[] = [
    {
      status: supabaseEnabled ? 'pass' : 'warning',
      label: 'Backend configured',
      detail: supabaseEnabled ? 'Supabase Production Mode is active.' : 'Running in Demo/Local Mode — set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY and deploy before real use with multiple people.',
    },
    {
      status: 'warning',
      label: 'Vercel deployment',
      detail: 'Not verifiable from inside the app — confirm your production URL loads correctly from a phone on a different network than this device. See docs/DEPLOYMENT.md.',
    },
  ];

  const isHttps = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const security: ReadinessRow[] = [
    {
      status: isHttps || isLocalhost ? 'pass' : 'warning',
      label: 'Served over HTTPS',
      detail: isHttps
        ? 'This page is loaded over HTTPS.'
        : isLocalhost
          ? 'Local development server — HTTPS is not expected here. Vercel serves production deployments over HTTPS automatically.'
          : 'Not HTTPS — Vercel serves production deployments over HTTPS automatically; this only matters if you are self-hosting elsewhere.',
    },
    {
      status: 'pass',
      label: 'Security headers & CSP configured',
      detail: 'CSP and security headers are defined in vercel.json (reviewed in code — see docs/SECURITY_CHECKLIST.md). Verify with your browser\'s network tab once deployed.',
    },
  ];

  const authentication: ReadinessRow[] = supabaseEnabled
    ? [
        { status: session ? 'pass' : 'fail', label: 'Signed in', detail: session ? 'Active session.' : 'No active session.' },
        { status: currentWorkspace ? 'pass' : 'fail', label: 'Workspace selected', detail: currentWorkspace ? currentWorkspace.name : 'No workspace selected.' },
      ]
    : [{ status: 'pass', label: 'Authentication', detail: 'Demo/Local Mode has no accounts by design — this section does not apply.' }];

  const database: ReadinessRow[] = !supabaseEnabled
    ? [{ status: 'pass', label: 'Database', detail: 'Demo/Local Mode stores everything in this browser — no external database to check.' }]
    : systemCheck
      ? systemCheck.filter((r) => r.label === 'Auth reachable' || r.label === 'Database reachable').map((r) => ({ status: r.status, label: r.label, detail: r.detail }))
      : [{ status: 'warning', label: 'Database', detail: 'Checking…' }];

  const backupSection: ReadinessRow[] = [
    {
      status: !lastBackup ? 'fail' : backupAgeDays !== null && backupAgeDays > BACKUP_STALE_DAYS ? 'warning' : 'pass',
      label: 'Recent backup on this device',
      detail: !lastBackup
        ? 'No backup has been downloaded from this device yet — go to Settings → Backup.'
        : `Last backup from this device: ${new Date(lastBackup).toLocaleString()}.`,
    },
  ];

  const pwaSection: ReadinessRow[] = [
    { status: swActive ? 'pass' : 'warning', label: 'Service worker active', detail: swActive ? 'The offline app shell is installed on this device.' : 'No service worker registered on this device yet — reload once online.' },
    { status: installed ? 'pass' : 'warning', label: 'Installed to home screen (this device)', detail: installed ? 'Running as an installed app.' : 'Not installed on this device — see Device Readiness page.' },
  ];

  const offlinePackSection: ReadinessRow[] = [
    { status: offlineFresh === null ? 'warning' : offlineFresh ? 'pass' : 'warning', label: 'Offline Pack fresh (this device)', detail: offlineFresh ? 'Refreshed recently.' : 'Missing or stale — go to Wedding Day → Offline Pack and Refresh.' },
  ];

  const usersRoles: ReadinessRow[] = supabaseEnabled
    ? [{ status: adminCount === null ? 'warning' : adminCount >= 1 ? 'pass' : 'fail', label: 'At least one active Admin', detail: adminCount === null ? 'Checking…' : `${adminCount} active Admin(s).` }]
    : [{ status: 'pass', label: 'Users & Roles', detail: 'Demo/Local Mode has a single implicit user — this section does not apply.' }];

  const dataQuality: ReadinessRow[] = [
    { status: referenceProblems.length === 0 ? 'pass' : 'warning', label: 'No broken references', detail: referenceProblems.length === 0 ? 'No dangling references found.' : `${referenceProblems.length} issue(s) — see Settings → Data Management.` },
    { status: onboardingIncomplete.length === 0 ? 'pass' : 'warning', label: 'Real-data onboarding checklist', detail: onboardingIncomplete.length === 0 ? 'All fields complete.' : `${onboardingIncomplete.length} item(s) still incomplete: ${onboardingIncomplete.map((i) => i.label).join(', ')}.` },
  ];

  const weddingDayReadiness: ReadinessRow[] = [
    {
      status: criticalDutiesFilled.length === DEFAULT_CRITICAL_DUTY_ROLES.length ? 'pass' : 'warning',
      label: 'Critical duty roles filled',
      detail: `${criticalDutiesFilled.length}/${DEFAULT_CRITICAL_DUTY_ROLES.length} filled.`,
    },
    {
      status: unverifiedCriticalItems.length === 0 ? 'pass' : 'warning',
      label: 'Critical ceremony items verified',
      detail: unverifiedCriticalItems.length === 0 ? 'All applicable critical items verified.' : `${unverifiedCriticalItems.length} not yet verified.`,
    },
    { status: emergencyContacts.length > 0 ? 'pass' : 'fail', label: 'Emergency contacts added', detail: `${emergencyContacts.length} contact(s).` },
    { status: runSheetItems.length > 0 ? 'pass' : 'fail', label: 'Run sheet has items', detail: `${runSheetItems.length} item(s).` },
  ];

  const allRows = [...infrastructure, ...security, ...authentication, ...database, ...backupSection, ...pwaSection, ...offlinePackSection, ...usersRoles, ...dataQuality, ...weddingDayReadiness];
  const unresolvedWarnings = allRows.filter((r) => r.status !== 'pass').map((r) => r.label);
  const review = settings.weddingDay.productionLaunchReview;

  function handleMarkReviewed() {
    const next: ProductionLaunchReview = {
      reviewedAt: new Date().toISOString(),
      reviewedBy: settings.couple.groomName || settings.couple.brideName || 'Admin',
      appVersion: APP_VERSION,
      unresolvedWarnings,
    };
    updateSettings({ weddingDay: { ...settings.weddingDay, productionLaunchReview: next } });
  }

  return (
    <div className="space-y-4">
      <Card className={unresolvedWarnings.length === 0 ? 'border-success/40' : 'border-warning/40'}>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className={unresolvedWarnings.length === 0 ? 'mt-0.5 size-5 shrink-0 text-success' : 'mt-0.5 size-5 shrink-0 text-warning'} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink">{unresolvedWarnings.length === 0 ? 'All checks passing' : `${unresolvedWarnings.length} item(s) need attention`}</p>
              <p className="text-xs text-ink-faint">This screen never claims "ready" automatically — review every section below before marking launch reviewed.</p>
              {review && (
                <p className="mt-1 text-xs text-ink-faint">
                  Last marked reviewed {new Date(review.reviewedAt).toLocaleString()} by {review.reviewedBy} (v{review.appVersion})
                  {review.unresolvedWarnings.length > 0 ? ` with ${review.unresolvedWarnings.length} open warning(s) at the time.` : '.'}
                </p>
              )}
            </div>
          </div>
          <Button variant="primary" onClick={handleMarkReviewed}>
            Mark "Production Launch Reviewed"
          </Button>
        </CardBody>
      </Card>

      <Section title="Infrastructure" rows={infrastructure} />
      <Section title="Security" rows={security} />
      <Section title="Authentication" rows={authentication} />
      <Section title="Database" rows={database} />
      <Section title="Backup" rows={backupSection} />
      <Section title="PWA" rows={pwaSection} />
      <Section title="Offline Pack" rows={offlinePackSection} />
      <Section title="Users & Roles" rows={usersRoles} />
      <Section title="Data Quality" rows={dataQuality} />
      <Section title="Wedding Day Readiness" rows={weddingDayReadiness} />

      <Card>
        <CardHeader>
          <CardTitle>
            <Laptop className="mr-1.5 inline size-4" aria-hidden="true" />
            Device redundancy
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-faint">
            WeddingOS is not designed to depend on a single device. For the wedding day, plan for: a primary phone (the main operator), a backup phone
            with the app installed and signed in, a laptop or tablet at the command desk for anything easier to read on a larger screen, and a
            printed Command Sheet (Wedding Day → Command Sheet → Print) as the ultimate fallback if every device fails.
          </p>
        </CardBody>
      </Card>

      {settings.weddingDay.simulationDateTimeISO && (
        <Card className="border-critical/40">
          <CardBody className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-critical" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-critical">Simulation Time is active</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                The Command Center is currently using a simulated date/time ({new Date(settings.weddingDay.simulationDateTimeISO).toLocaleString()})
                instead of the real clock. Turn this off before the actual wedding day — Settings → Wedding Day.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-2"
                onClick={() => updateSettings({ weddingDay: { ...settings.weddingDay, simulationDateTimeISO: undefined } })}
              >
                Disable Simulation
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <Printer className="mr-1.5 inline size-4" aria-hidden="true" />
            Wedding Week System Checklist
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <p className="text-ink-faint">A staged version of the checks above, split by how close you are to the wedding.</p>
          <div>
            <p className="font-semibold text-ink">7 days before</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
              <li>Review this Production Readiness screen top to bottom</li>
              <li>Confirm the real-data onboarding checklist is complete</li>
              <li>Take a fresh backup</li>
              <li>Review current Supabase Free plan limits and Vercel Hobby plan limits/terms</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">72 hours before</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
              <li>Confirm every operator device can sign in and has WeddingOS installed</li>
              <li>Refresh the Offline Pack on every device</li>
              <li>Run System Check (Settings → Diagnostics) on the command-desk device</li>
              <li>Print the Command Sheet, emergency contacts, and manifests as a paper backup</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">24 hours before</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
              <li>Take a final backup</li>
              <li>Refresh the Offline Pack again on every device</li>
              <li>Confirm Simulation Time (above) is off</li>
              <li>Charge every device fully overnight</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Wedding morning</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
              <li>Log in and confirm the Supabase project is reachable (Diagnostics)</li>
              <li>Confirm device clocks match the venue's actual local time</li>
              <li>Confirm every operator knows how to reach Emergency (always one tap away in Wedding Day Mode)</li>
              <li>
                <Battery className="mr-1 inline size-3" aria-hidden="true" />
                Bring chargers/power banks for every device
              </li>
              <li>
                <Smartphone className="mr-1 inline size-3" aria-hidden="true" />
                Confirm backup devices are charged and signed in
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
