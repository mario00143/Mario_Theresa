import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Field, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { VendorStatusBadge } from '@/components/ui/StatusBadge';
import { EVENTS, VENDOR_CATEGORIES, VENDOR_STATUSES, type EventScope, type VendorCategory, type VendorStatus } from '@/types';
import { useUI } from '@/context/UIContext';
import { useVendors } from '@/hooks/useVendors';
import { useVendorContactsForVendor } from '@/hooks/useVendorContacts';
import { useVendorQuotesForVendor } from '@/hooks/useVendorQuotes';
import { useContractsForVendor } from '@/hooks/useContracts';
import { usePaymentSchedulesForVendor } from '@/hooks/usePaymentSchedules';
import { usePaymentsForVendor } from '@/hooks/usePayments';
import { useBudgetItemsForVendor } from '@/hooks/useBudget';
import { useSettings } from '@/hooks/useSettings';
import { computeVendorReadiness, isCriticalVendorNotReconfirmed, READINESS_LEVELS } from '@/utils/vendorReadiness';
import { weddingDateTimeISO } from '@/utils/date';
import { VendorContactsSection } from './VendorContactsSection';
import { VendorQuotesSection } from './VendorQuotesSection';
import { VendorContractsSection } from './VendorContractsSection';
import { PaymentSchedulesSection } from './PaymentSchedulesSection';
import { VendorPaymentsSection } from './VendorPaymentsSection';
import { VendorRefundsSection } from './VendorRefundsSection';
import { AddPaymentModal } from './AddPaymentModal';
import { ConfirmVendorModal } from './ConfirmVendorModal';
import { VendorWeddingDaySection } from '@/features/weddingday/VendorWeddingDaySection';

const READINESS_TONE: Record<(typeof READINESS_LEVELS)[number], 'success' | 'info' | 'warning' | 'critical'> = {
  Ready: 'success',
  'Mostly Ready': 'info',
  'At Risk': 'warning',
  'Not Ready': 'critical',
};

export function VendorDetailDrawer() {
  const { selectedVendorId, closeVendorDetail } = useUI();
  const { vendors, updateVendor, deleteVendor } = useVendors();
  const { settings } = useSettings();
  const vendor = vendors.find((v) => v.id === selectedVendorId);
  const contacts = useVendorContactsForVendor(selectedVendorId ?? undefined);
  const quotes = useVendorQuotesForVendor(selectedVendorId ?? undefined);
  const contracts = useContractsForVendor(selectedVendorId ?? undefined);
  const schedules = usePaymentSchedulesForVendor(selectedVendorId ?? undefined);
  const payments = usePaymentsForVendor(selectedVendorId ?? undefined);
  const budgetItems = useBudgetItemsForVendor(selectedVendorId ?? undefined);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmVendorOpen, setConfirmVendorOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalScheduleId, setPaymentModalScheduleId] = useState<string | undefined>(undefined);

  if (!selectedVendorId) return null;

  if (!vendor) {
    return (
      <Drawer open onClose={closeVendorDetail} title="Vendor not found">
        <p className="text-sm text-ink-faint">This vendor may have been deleted.</p>
      </Drawer>
    );
  }

  const currency = settings.finance.currency;
  const weddingDateTime = weddingDateTimeISO(settings);
  const readiness = computeVendorReadiness(vendor, contacts, quotes, contracts, schedules, payments);
  const needsReconfirmation = isCriticalVendorNotReconfirmed(
    vendor,
    settings.finance.criticalVendorCategories,
    weddingDateTime,
    72,
    new Date().toISOString(),
  );

  const openRecordPayment = (scheduleId?: string) => {
    setPaymentModalScheduleId(scheduleId);
    setPaymentModalOpen(true);
  };

  const handleDelete = () => {
    deleteVendor(vendor.id);
    setConfirmDelete(false);
    closeVendorDetail();
  };

  return (
    <>
      <Drawer
        open
        onClose={closeVendorDetail}
        title={vendor.name}
        subtitle={
          <div className="flex flex-wrap items-center gap-1.5">
            <VendorStatusBadge status={vendor.status} />
            <Badge tone="neutral">{vendor.category}</Badge>
            <Badge tone="neutral">{vendor.event}</Badge>
            <Badge tone={READINESS_TONE[readiness.level]}>{readiness.level}</Badge>
            {needsReconfirmation && <Badge tone="critical">Reconfirmation needed</Badge>}
          </div>
        }
        footer={
          <>
            <Button variant="ghost" icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
              Delete vendor
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" size="sm" disabled={vendor.status === 'Completed'} onClick={() => updateVendor(vendor.id, { status: 'Completed' })}>
              Mark Completed
            </Button>
            <Button variant="primary" size="sm" onClick={() => setConfirmVendorOpen(true)}>
              Mark Confirmed
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {readiness.reasons.length > 0 && (
            <section className="rounded-lg border border-line-soft bg-surface-subtle px-3 py-2.5 space-y-1">
              <p className="text-xs font-semibold text-ink">Readiness: {readiness.level} — not just a score, here's why</p>
              <ul className="list-disc list-inside space-y-0.5">
                {readiness.reasons.map((r) => (
                  <li key={r} className="text-xs text-ink-faint">
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3">
            <p className="text-sm font-semibold text-ink">Overview</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="v-name" required>
                  Name
                </Label>
                <Input id="v-name" defaultValue={vendor.name} key={`v-name-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { name: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="v-category" required>
                  Category
                </Label>
                <Select id="v-category" value={vendor.category} onChange={(e) => updateVendor(vendor.id, { category: e.target.value as VendorCategory })}>
                  {VENDOR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="v-status">Status</Label>
                <Select id="v-status" value={vendor.status} onChange={(e) => updateVendor(vendor.id, { status: e.target.value as VendorStatus })}>
                  {VENDOR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="v-event">Event</Label>
                <Select id="v-event" value={vendor.event} onChange={(e) => updateVendor(vendor.id, { event: e.target.value as EventScope })}>
                  {EVENTS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="v-city">City</Label>
                <Input id="v-city" defaultValue={vendor.city ?? ''} key={`v-city-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { city: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="v-booking-owner">Booking owner</Label>
                <Input
                  id="v-booking-owner"
                  defaultValue={vendor.bookingOwner ?? ''}
                  key={`v-booking-owner-${vendor.id}`}
                  onBlur={(e) => updateVendor(vendor.id, { bookingOwner: e.target.value || undefined })}
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor="v-address">Address</Label>
              <Input id="v-address" defaultValue={vendor.address ?? ''} key={`v-address-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { address: e.target.value || undefined })} />
            </Field>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Commercial info</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="v-phone">Phone</Label>
                <Input id="v-phone" defaultValue={vendor.phone ?? ''} key={`v-phone-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { phone: e.target.value || undefined })} />
              </Field>
              <Field>
                <Label htmlFor="v-email">Email</Label>
                <Input id="v-email" type="email" defaultValue={vendor.email ?? ''} key={`v-email-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { email: e.target.value || undefined })} />
              </Field>
            </div>
            <Field>
              <Label htmlFor="v-website">Website</Label>
              <Input id="v-website" defaultValue={vendor.website ?? ''} key={`v-website-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { website: e.target.value || undefined })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="v-primary-contact">Primary contact</Label>
                <Select id="v-primary-contact" value={vendor.primaryContactId ?? ''} onChange={(e) => updateVendor(vendor.id, { primaryContactId: e.target.value || undefined })}>
                  <option value="">None</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label htmlFor="v-backup-contact">Backup contact</Label>
                <Select id="v-backup-contact" value={vendor.backupContactId ?? ''} onChange={(e) => updateVendor(vendor.id, { backupContactId: e.target.value || undefined })}>
                  <option value="">None</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={vendor.gstApplicable} onChange={(e) => updateVendor(vendor.id, { gstApplicable: e.target.checked })} className="size-4 accent-brand-700" />
                GST applicable
              </label>
              {vendor.gstApplicable && (
                <Input
                  defaultValue={vendor.gstNumber ?? ''}
                  key={`v-gst-${vendor.id}`}
                  onBlur={(e) => updateVendor(vendor.id, { gstNumber: e.target.value || undefined })}
                  placeholder="GST number"
                  aria-label="GST number"
                  className="max-w-[12rem]"
                />
              )}
            </div>
            <FieldHint>
              {vendor.lastConfirmedAt
                ? `Last reconfirmed ${new Date(vendor.lastConfirmedAt).toLocaleString('en-IN')}${vendor.confirmedBy ? ` by ${vendor.confirmedBy}` : ''}.`
                : 'Not yet reconfirmed.'}
            </FieldHint>
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <p className="text-sm font-semibold text-ink">Wedding day</p>
            <VendorWeddingDaySection vendorId={vendor.id} />
          </section>

          <section className="space-y-3 border-t border-line-soft pt-5">
            <Field>
              <Label htmlFor="v-notes">Notes</Label>
              <Textarea id="v-notes" defaultValue={vendor.notes ?? ''} key={`v-notes-${vendor.id}`} onBlur={(e) => updateVendor(vendor.id, { notes: e.target.value || undefined })} />
            </Field>
          </section>

          <VendorContactsSection vendorId={vendor.id} />
          <VendorQuotesSection vendorId={vendor.id} vendorEvent={vendor.event} currency={currency} />
          <VendorContractsSection vendorId={vendor.id} weddingDate={settings.wedding.date} engagementDate={settings.engagement.date} />
          <PaymentSchedulesSection vendorId={vendor.id} budgetItems={budgetItems} contracts={contracts} currency={currency} onRecordPayment={openRecordPayment} />
          <VendorPaymentsSection
            vendorId={vendor.id}
            currency={currency}
            largeCashWarningThreshold={settings.finance.largeCashWarningThreshold}
            onAddPayment={() => openRecordPayment(undefined)}
          />
          <VendorRefundsSection vendorId={vendor.id} contracts={contracts} currency={currency} />
        </div>
      </Drawer>

      <ConfirmVendorModal open={confirmVendorOpen} onClose={() => setConfirmVendorOpen(false)} vendor={vendor} />

      <AddPaymentModal
        key={`payment-modal-${paymentModalScheduleId ?? 'none'}`}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        vendorId={vendor.id}
        budgetItems={budgetItems}
        schedules={schedules}
        defaultScheduleId={paymentModalScheduleId}
        largeCashWarningThreshold={settings.finance.largeCashWarningThreshold}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete vendor"
        message={`Delete "${vendor.name}"? Its contacts, quotes, contracts, payment schedules, payments, and refunds will also be removed. Any linked budget items, hotels, or vehicles will be un-linked, not deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
