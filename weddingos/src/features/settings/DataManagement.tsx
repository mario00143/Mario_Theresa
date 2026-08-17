import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  backupFilename,
  driverDirectoryCsvFilename,
  driverDirectoryToCSV,
  dropManifestCsvFilename,
  dropManifestToCSV,
  exportBackup,
  guestsCsvFilename,
  guestsToCSV,
  householdsCsvFilename,
  householdsToCSV,
  importBackup,
  normalizeBackup,
  pickupManifestCsvFilename,
  pickupManifestToCSV,
  roomAssignmentsCsvFilename,
  roomAssignmentsToCSV,
  rsvpReportCsvFilename,
  rsvpReportToCSV,
  tasksCsvFilename,
  tasksToCSV,
  travelCsvFilename,
  travelToCSV,
  validateBackup,
  vehicleManifestCsvFilename,
  vehicleManifestToCSV,
} from '@/data/repositories/backupRepository';
import {
  budgetCsvFilename,
  budgetToCSV,
  contractsCsvFilename,
  contractsToCSV,
  paymentHistoryCsvFilename,
  paymentHistoryToCSV,
  paymentsDueCsvFilename,
  paymentsDueToCSV,
  refundsCsvFilename,
  refundsToCSV,
  vendorQuotesCsvFilename,
  vendorQuotesToCSV,
  vendorReadinessCsvFilename,
  vendorReadinessToCSV,
  vendorsCsvFilename,
  vendorsToCSV,
} from '@/data/repositories/financeCsv';
import {
  attireReadinessCsvFilename,
  attireReadinessToCSV,
  cateringSummaryCsvFilename,
  cateringSummaryToCSV,
  ceremonyItemsCsvFilename,
  ceremonyItemsToCSV,
  ceremonyParticipantsCsvFilename,
  ceremonyParticipantsToCSV,
  churchRequirementsCsvFilename,
  churchRequirementsToCSV,
  decorPlansCsvFilename,
  decorPlansToCSV,
  giftsFavorsCsvFilename,
  giftsFavorsToCSV,
  menuCsvFilename,
  menuToCSV,
  musicCueSheetCsvFilename,
  musicCueSheetToCSV,
  photoGroupListCsvFilename,
  photoGroupListToCSV,
  weddingPrepIssuesCsvFilename,
  weddingPrepIssuesToCSV,
  weddingPrepReadinessCsvFilename,
  weddingPrepReadinessToCSV,
} from '@/data/repositories/weddingPrepCsv';
import { resetToDemoData } from '@/data/stores';
import { useTasks } from '@/hooks/useTasks';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { useTravel } from '@/hooks/useTravel';
import { useHotels } from '@/hooks/useHotels';
import { useRoomTypes, useRooms } from '@/hooks/useRooms';
import { useRoomAssignments } from '@/hooks/useRoomAssignments';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useTransportRoutes } from '@/hooks/useTransportRoutes';
import { useTransportAssignments } from '@/hooks/useTransportAssignments';
import { useVendors } from '@/hooks/useVendors';
import { useVendorContacts } from '@/hooks/useVendorContacts';
import { useVendorQuotes } from '@/hooks/useVendorQuotes';
import { useContracts } from '@/hooks/useContracts';
import { useBudgetCategories, useBudgetItems } from '@/hooks/useBudget';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';
import { usePayments } from '@/hooks/usePayments';
import { useRefunds } from '@/hooks/useRefunds';
import { useChurchProfiles } from '@/hooks/useChurchProfiles';
import { useChurchRequirements } from '@/hooks/useChurchRequirements';
import { useCeremonyParticipants } from '@/hooks/useCeremonyParticipants';
import { useCeremonySequence } from '@/hooks/useCeremonySequence';
import { useCeremonyItems } from '@/hooks/useCeremonyItems';
import { useCateringPlans } from '@/hooks/useCateringPlans';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDecorPlans } from '@/hooks/useDecorPlans';
import { useDecorDeliverables } from '@/hooks/useDecorDeliverables';
import { useAttireProfiles } from '@/hooks/useAttireProfiles';
import { useAttireItems } from '@/hooks/useAttireItems';
import { useGroomingAppointments } from '@/hooks/useGroomingAppointments';
import { usePhotographyPlans } from '@/hooks/usePhotographyPlans';
import { usePhotoGroups } from '@/hooks/usePhotoGroups';
import { useMusicCues } from '@/hooks/useMusicCues';
import { useMusicAVPlans } from '@/hooks/useMusicAVPlans';
import { useGiftPlans } from '@/hooks/useGiftPlans';
import { useWelcomeKits } from '@/hooks/useWelcomeKits';
import { useSettings } from '@/hooks/useSettings';
import { computeSuggestedCateringCounts } from '@/utils/cateringLogic';
import { detectWeddingPrepIssues } from '@/utils/weddingPrepDataQuality';
import {
  computeAttireReadiness,
  computeCateringReadiness,
  computeCeremonyReadiness,
  computeChurchReadiness,
  computeDecorReadiness,
  computeGiftsKitsReadiness,
  computeMusicAVReadiness,
  computePhotographyReadiness,
} from '@/utils/weddingPrepReadiness';
import { weddingDateTimeISO } from '@/utils/date';
import { downloadTextFile } from '@/utils/download';
import { recordBackupExported } from '@/lib/backupTracking';
import type { WeddingOSBackup } from '@/types';

export function DataManagement() {
  const { tasks } = useTasks();
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const { travelSegments } = useTravel();
  const { hotels } = useHotels();
  const { roomTypes } = useRoomTypes();
  const { rooms } = useRooms();
  const { roomAssignments } = useRoomAssignments();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const { routes } = useTransportRoutes();
  const { transportAssignments } = useTransportAssignments();
  const { vendors } = useVendors();
  const { vendorContacts } = useVendorContacts();
  const { vendorQuotes } = useVendorQuotes();
  const { contracts } = useContracts();
  const { budgetCategories } = useBudgetCategories();
  const { budgetItems } = useBudgetItems();
  const { paymentSchedules } = usePaymentSchedules();
  const { payments } = usePayments();
  const { refunds } = useRefunds();
  const { churchProfiles } = useChurchProfiles();
  const { churchRequirements } = useChurchRequirements();
  const { ceremonyParticipants } = useCeremonyParticipants();
  const { sequenceItems } = useCeremonySequence();
  const { ceremonyItems } = useCeremonyItems();
  const { cateringPlans } = useCateringPlans();
  const { menuItems } = useMenuItems();
  const { decorPlans } = useDecorPlans();
  const { decorDeliverables } = useDecorDeliverables();
  const { attireProfiles } = useAttireProfiles();
  const { attireItems } = useAttireItems();
  const { groomingAppointments } = useGroomingAppointments();
  const { photographyPlans } = usePhotographyPlans();
  const { photoGroups } = usePhotoGroups();
  const { musicCues } = useMusicCues();
  const { musicAVPlans } = useMusicAVPlans();
  const { giftPlans } = useGiftPlans();
  const { welcomeKits } = useWelcomeKits();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<WeddingOSBackup | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    const backup = exportBackup();
    downloadTextFile(backupFilename(), JSON.stringify(backup, null, 2), 'application/json');
    recordBackupExported();
    setStatus('Backup exported.');
  };

  const handleExportTasksCSV = () => {
    downloadTextFile(tasksCsvFilename(), tasksToCSV(tasks), 'text/csv');
    setStatus('Tasks exported as CSV.');
  };

  const handleExportHouseholdsCSV = () => {
    downloadTextFile(householdsCsvFilename(), householdsToCSV(households, guests), 'text/csv');
    setStatus('Households exported as CSV.');
  };

  const handleExportGuestsCSV = () => {
    downloadTextFile(guestsCsvFilename(), guestsToCSV(guests, households), 'text/csv');
    setStatus('Guests exported as CSV.');
  };

  const handleExportRsvpReportCSV = () => {
    downloadTextFile(rsvpReportCsvFilename(), rsvpReportToCSV(guests, households), 'text/csv');
    setStatus('RSVP report exported as CSV.');
  };

  const handleExportTravelCSV = () => {
    downloadTextFile(travelCsvFilename(), travelToCSV(travelSegments, guests, households), 'text/csv');
    setStatus('Travel exported as CSV.');
  };

  const handleExportRoomAssignmentsCSV = () => {
    downloadTextFile(roomAssignmentsCsvFilename(), roomAssignmentsToCSV(roomAssignments, guests, rooms, roomTypes, hotels), 'text/csv');
    setStatus('Room assignments exported as CSV.');
  };

  const handleExportPickupManifestCSV = () => {
    downloadTextFile(pickupManifestCsvFilename(), pickupManifestToCSV(transportAssignments, routes, guests, vehicles, drivers), 'text/csv');
    setStatus('Pickup manifest exported as CSV.');
  };

  const handleExportDropManifestCSV = () => {
    downloadTextFile(dropManifestCsvFilename(), dropManifestToCSV(transportAssignments, routes, guests, vehicles, drivers), 'text/csv');
    setStatus('Drop manifest exported as CSV.');
  };

  const handleExportVehicleManifestCSV = () => {
    downloadTextFile(vehicleManifestCsvFilename(), vehicleManifestToCSV(vehicles, routes, transportAssignments), 'text/csv');
    setStatus('Vehicle manifest exported as CSV.');
  };

  const handleExportDriverDirectoryCSV = () => {
    downloadTextFile(driverDirectoryCsvFilename(), driverDirectoryToCSV(drivers, vehicles, routes), 'text/csv');
    setStatus('Driver directory exported as CSV.');
  };

  const handleExportVendorsCSV = () => {
    downloadTextFile(vendorsCsvFilename(), vendorsToCSV(vendors, vendorContacts), 'text/csv');
    setStatus('Vendors exported as CSV.');
  };

  const handleExportVendorQuotesCSV = () => {
    downloadTextFile(vendorQuotesCsvFilename(), vendorQuotesToCSV(vendorQuotes, vendors), 'text/csv');
    setStatus('Vendor quotes exported as CSV.');
  };

  const handleExportContractsCSV = () => {
    downloadTextFile(contractsCsvFilename(), contractsToCSV(contracts, vendors), 'text/csv');
    setStatus('Contracts exported as CSV.');
  };

  const handleExportBudgetCSV = () => {
    downloadTextFile(budgetCsvFilename(), budgetToCSV(budgetCategories, budgetItems, vendors), 'text/csv');
    setStatus('Budget exported as CSV.');
  };

  const handleExportPaymentsDueCSV = () => {
    downloadTextFile(paymentsDueCsvFilename(), paymentsDueToCSV(paymentSchedules, vendors, payments), 'text/csv');
    setStatus('Payments due exported as CSV.');
  };

  const handleExportPaymentHistoryCSV = () => {
    downloadTextFile(paymentHistoryCsvFilename(), paymentHistoryToCSV(payments, vendors), 'text/csv');
    setStatus('Payment history exported as CSV.');
  };

  const handleExportRefundsCSV = () => {
    downloadTextFile(refundsCsvFilename(), refundsToCSV(refunds, vendors), 'text/csv');
    setStatus('Refunds exported as CSV.');
  };

  const handleExportVendorReadinessCSV = () => {
    downloadTextFile(
      vendorReadinessCsvFilename(),
      vendorReadinessToCSV(vendors, vendorContacts, vendorQuotes, contracts, paymentSchedules, payments),
      'text/csv',
    );
    setStatus('Vendor readiness exported as CSV.');
  };

  const handleExportChurchRequirementsCSV = () => {
    downloadTextFile(churchRequirementsCsvFilename(), churchRequirementsToCSV(churchRequirements), 'text/csv');
    setStatus('Church requirements exported as CSV.');
  };

  const handleExportCeremonyParticipantsCSV = () => {
    downloadTextFile(ceremonyParticipantsCsvFilename(), ceremonyParticipantsToCSV(ceremonyParticipants), 'text/csv');
    setStatus('Ceremony participants exported as CSV.');
  };

  const handleExportCeremonyItemsCSV = () => {
    downloadTextFile(ceremonyItemsCsvFilename(), ceremonyItemsToCSV(ceremonyItems), 'text/csv');
    setStatus('Ceremony items exported as CSV.');
  };

  const handleExportCateringSummaryCSV = () => {
    downloadTextFile(cateringSummaryCsvFilename(), cateringSummaryToCSV(cateringPlans), 'text/csv');
    setStatus('Catering summary exported as CSV.');
  };

  const handleExportMenuCSV = () => {
    downloadTextFile(menuCsvFilename(), menuToCSV(menuItems), 'text/csv');
    setStatus('Menu exported as CSV.');
  };

  const handleExportDecorPlansCSV = () => {
    downloadTextFile(decorPlansCsvFilename(), decorPlansToCSV(decorPlans, decorDeliverables, vendors), 'text/csv');
    setStatus('Décor plans exported as CSV.');
  };

  const handleExportAttireReadinessCSV = () => {
    downloadTextFile(attireReadinessCsvFilename(), attireReadinessToCSV(attireProfiles, attireItems), 'text/csv');
    setStatus('Attire readiness exported as CSV.');
  };

  const handleExportPhotoGroupListCSV = () => {
    downloadTextFile(photoGroupListCsvFilename(), photoGroupListToCSV(photoGroups), 'text/csv');
    setStatus('Photo group list exported as CSV.');
  };

  const handleExportMusicCueSheetCSV = () => {
    downloadTextFile(musicCueSheetCsvFilename(), musicCueSheetToCSV(musicCues), 'text/csv');
    setStatus('Music cue sheet exported as CSV.');
  };

  const handleExportGiftsFavorsCSV = () => {
    downloadTextFile(giftsFavorsCsvFilename(), giftsFavorsToCSV(giftPlans), 'text/csv');
    setStatus('Gifts and favors exported as CSV.');
  };

  const handleExportWeddingPrepIssuesCSV = () => {
    const weddingDateTime = weddingDateTimeISO(settings);
    const suggested = computeSuggestedCateringCounts(guests, 'Wedding');
    const issues = detectWeddingPrepIssues({
      churchProfile: churchProfiles[0],
      churchRequirements,
      ceremonyParticipants,
      ceremonyItems,
      cateringPlans,
      menuItems,
      decorPlans,
      attireProfiles,
      attireItems,
      photographyPlans,
      photoGroups,
      musicCues,
      musicAVPlans,
      giftPlans,
      welcomeKits,
      weddingDateTimeISO: weddingDateTime,
      confirmedWeddingAttendance: suggested.confirmedAttendees,
      favorBuffer: 10,
    });
    downloadTextFile(weddingPrepIssuesCsvFilename(), weddingPrepIssuesToCSV(issues), 'text/csv');
    setStatus('Wedding prep issues exported as CSV.');
  };

  const handleExportWeddingPrepReadinessCSV = () => {
    const sections = {
      Church: computeChurchReadiness(churchProfiles[0], churchRequirements),
      Ceremony: computeCeremonyReadiness(ceremonyParticipants, sequenceItems, ceremonyItems),
      Catering: computeCateringReadiness(cateringPlans, menuItems),
      'Décor': computeDecorReadiness(decorPlans, decorDeliverables),
      Attire: computeAttireReadiness(attireProfiles, attireItems, groomingAppointments),
      Photography: computePhotographyReadiness(photographyPlans, photoGroups),
      'Music / AV': computeMusicAVReadiness(musicAVPlans, musicCues),
      'Gifts / Kits': computeGiftsKitsReadiness(giftPlans, welcomeKits),
    };
    downloadTextFile(weddingPrepReadinessCsvFilename(), weddingPrepReadinessToCSV(sections), 'text/csv');
    setStatus('Wedding prep readiness exported as CSV.');
  };

  const handleFileSelected = async (file: File) => {
    setImportErrors([]);
    setStatus(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const validation = validateBackup(data);
      if (!validation.valid) {
        setImportErrors(validation.errors);
        return;
      }
      setPendingImport(normalizeBackup(data));
    } catch {
      setImportErrors(['File is not valid JSON.']);
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    importBackup(pendingImport);
    const wasV1 = pendingImport.version < 2;
    setPendingImport(null);
    setStatus(
      wasV1
        ? 'Backup imported successfully. This was a version 1 (Phase 1) backup, so guest data was initialized empty.'
        : 'Backup imported successfully.',
    );
  };

  const handleReset = () => {
    resetToDemoData();
    setConfirmReset(false);
    setStatus('Demo data restored.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data management</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        {status && <div className="rounded-lg border border-success/30 bg-success-bg px-3.5 py-2.5 text-sm text-success">{status}</div>}
        {importErrors.length > 0 && (
          <div className="rounded-lg border border-critical/30 bg-critical-bg px-3.5 py-3 text-sm text-critical space-y-1">
            <p className="font-medium">This file could not be imported:</p>
            <ul className="list-disc list-inside">
              {importErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-ink">Backup</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">
            Export everything — settings, tasks, decisions, owner roles, households, guests, travel/accommodation/transport logistics, vendors/budget/payments, and church/ceremony/wedding-preparation records — as a single JSON file.
            Version 1 through 4 backups from earlier phases can still be imported; collections introduced after a file's version are initialized empty for those files.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportJSON}>
              Export backup (JSON)
            </Button>
            <Button
              variant="secondary"
              icon={<Upload className="size-4" aria-hidden="true" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import backup (JSON)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Export CSV</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">
            Spreadsheet-friendly exports for tasks, households, guests, RSVP, travel/accommodation/transport logistics, and vendors/budget/payments.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportTasksCSV}>
              Export tasks (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportHouseholdsCSV}>
              Export households (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportGuestsCSV}>
              Export guests (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportRsvpReportCSV}>
              Export RSVP report (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportTravelCSV}>
              Export travel (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportRoomAssignmentsCSV}>
              Export room assignments (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportPickupManifestCSV}>
              Export pickup manifest (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportDropManifestCSV}>
              Export drop manifest (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportVehicleManifestCSV}>
              Export vehicle manifest (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportDriverDirectoryCSV}>
              Export driver directory (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportVendorsCSV}>
              Export vendors (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportVendorQuotesCSV}>
              Export vendor quotes (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportContractsCSV}>
              Export contracts (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportBudgetCSV}>
              Export budget (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportPaymentsDueCSV}>
              Export payments due (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportPaymentHistoryCSV}>
              Export payment history (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportRefundsCSV}>
              Export refunds (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportVendorReadinessCSV}>
              Export vendor readiness (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportChurchRequirementsCSV}>
              Export church requirements (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportCeremonyParticipantsCSV}>
              Export ceremony participants (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportCeremonyItemsCSV}>
              Export ceremony items (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportCateringSummaryCSV}>
              Export catering summary (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportMenuCSV}>
              Export menu (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportDecorPlansCSV}>
              Export décor plans (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportAttireReadinessCSV}>
              Export attire readiness (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportPhotoGroupListCSV}>
              Export photo group list (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportMusicCueSheetCSV}>
              Export music cue sheet (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportGiftsFavorsCSV}>
              Export gifts &amp; favors (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportWeddingPrepIssuesCSV}>
              Export wedding prep issues (CSV)
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" aria-hidden="true" />} onClick={handleExportWeddingPrepReadinessCSV}>
              Export wedding prep readiness (CSV)
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Reset</p>
          <p className="text-xs text-ink-faint mt-0.5 mb-2.5">Discard all current data and restore the original demo dataset. This cannot be undone.</p>
          <Button variant="danger" icon={<RotateCcw className="size-4" aria-hidden="true" />} onClick={() => setConfirmReset(true)}>
            Reset to demo data
          </Button>
        </div>
      </CardBody>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Import backup"
        message="Importing will replace all current settings, tasks, decisions, owner roles, households, and guests with the contents of this file. This cannot be undone."
        confirmLabel="Import and overwrite"
        danger
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset to demo data"
        message="This will permanently delete all current settings, tasks, decisions, owner roles, households, and guests, replacing them with the original demo dataset."
        confirmLabel="Reset"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </Card>
  );
}
