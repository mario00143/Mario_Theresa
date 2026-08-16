import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Label, Textarea } from '@/components/ui/Field';
import type { Vendor } from '@/types';
import { useVendors } from '@/hooks/useVendors';

interface ConfirmVendorModalProps {
  open: boolean;
  onClose: () => void;
  vendor: Vendor;
}

export function ConfirmVendorModal({ open, onClose, vendor }: ConfirmVendorModalProps) {
  const { confirmVendor, updateVendor } = useVendors();
  const [confirmedBy, setConfirmedBy] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [finalTeamSize, setFinalTeamSize] = useState(vendor.finalTeamSize?.toString() ?? '');
  const [finalArrivalTime, setFinalArrivalTime] = useState(vendor.finalArrivalTime ?? '');
  const [primaryConfirmed, setPrimaryConfirmed] = useState(vendor.finalPrimaryContactConfirmed);
  const [backupConfirmed, setBackupConfirmed] = useState(vendor.finalBackupContactConfirmed);

  const handleClose = () => {
    setConfirmedBy('');
    setConfirmationNotes('');
    onClose();
  };

  const handleSubmit = () => {
    confirmVendor(vendor.id, {
      confirmedBy: confirmedBy.trim() || undefined,
      confirmationNotes: confirmationNotes.trim() || undefined,
      finalTeamSize: finalTeamSize.trim() === '' ? undefined : Number(finalTeamSize),
      finalArrivalTime: finalArrivalTime.trim() || undefined,
      finalPrimaryContactConfirmed: primaryConfirmed,
      finalBackupContactConfirmed: backupConfirmed,
    });
    if (vendor.status !== 'Completed' && vendor.status !== 'Cancelled') {
      updateVendor(vendor.id, { status: 'Confirmed' });
    }
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Confirm Vendor"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Mark Confirmed
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-ink-faint">Records a fresh reconfirmation timestamp and moves this vendor to "Confirmed".</p>
        <Field>
          <Label htmlFor="confirm-by">Confirmed by</Label>
          <Input id="confirm-by" value={confirmedBy} onChange={(e) => setConfirmedBy(e.target.value)} placeholder="Your name" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="confirm-team-size">Final team size</Label>
            <Input id="confirm-team-size" type="number" min={0} value={finalTeamSize} onChange={(e) => setFinalTeamSize(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="confirm-arrival">Final arrival time</Label>
            <Input id="confirm-arrival" type="time" value={finalArrivalTime} onChange={(e) => setFinalArrivalTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={primaryConfirmed} onChange={(e) => setPrimaryConfirmed(e.target.checked)} className="size-4 accent-brand-700" />
            Primary contact confirmed
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={backupConfirmed} onChange={(e) => setBackupConfirmed(e.target.checked)} className="size-4 accent-brand-700" />
            Backup contact confirmed
          </label>
        </div>
        <Field>
          <Label htmlFor="confirm-notes">Confirmation notes</Label>
          <Textarea id="confirm-notes" value={confirmationNotes} onChange={(e) => setConfirmationNotes(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
