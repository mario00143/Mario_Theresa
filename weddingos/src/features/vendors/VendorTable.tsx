import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Vendor } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { VendorStatusBadge } from '@/components/ui/StatusBadge';
import { useUI } from '@/context/UIContext';
import { useVendors } from '@/hooks/useVendors';

interface VendorTableProps {
  vendors: Vendor[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function VendorTable({ vendors, emptyTitle = 'No vendors found', emptyDescription = 'Try adjusting your filters.' }: VendorTableProps) {
  const { openVendorDetail } = useUI();
  const { deleteVendor } = useVendors();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (vendors.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const vendorToDelete = vendors.find((v) => v.id === confirmDeleteId);

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Booking owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr
                key={vendor.id}
                onClick={() => openVendorDetail(vendor.id)}
                className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
              >
                <td className="px-4 py-3 max-w-[14rem]">
                  <p className="font-medium text-ink truncate">{vendor.name}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{vendor.category}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge tone="neutral">{vendor.event}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{vendor.city || '—'}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{vendor.bookingOwner || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <VendorStatusBadge status={vendor.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(vendor.id);
                    }}
                    aria-label={`Delete vendor "${vendor.name}"`}
                    className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="sm:hidden space-y-2.5">
        {vendors.map((vendor) => (
          <li key={vendor.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => openVendorDetail(vendor.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openVendorDetail(vendor.id);
              }}
              className="rounded-xl border border-line bg-surface p-4 cursor-pointer active:bg-surface-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink leading-snug">{vendor.name}</p>
                <Badge tone="neutral">{vendor.event}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                {vendor.category} · {vendor.city || 'No city'}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <VendorStatusBadge status={vendor.status} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete vendor"
        message={`Delete "${vendorToDelete?.name}"? Its contacts, quotes, contracts, payment schedules, payments, and refunds will also be removed. Any linked budget items, hotels, or vehicles will be un-linked, not deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDeleteId) deleteVendor(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
