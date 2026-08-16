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
import { downloadTextFile } from '@/utils/download';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<WeddingOSBackup | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    const backup = exportBackup();
    downloadTextFile(backupFilename(), JSON.stringify(backup, null, 2), 'application/json');
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
            Export everything — settings, tasks, decisions, owner roles, households, guests, travel/accommodation/transport logistics, and vendors/budget/payments — as a single JSON file.
            Version 1, 2, and 3 backups from earlier phases can still be imported; collections introduced after a file's version are initialized empty for those files.
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
