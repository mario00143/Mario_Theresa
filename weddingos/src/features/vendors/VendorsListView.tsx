import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVendors } from '@/hooks/useVendors';
import { useUI } from '@/context/UIContext';
import { VendorFilters } from './VendorFilters';
import { VendorTable } from './VendorTable';
import { useVendorFilters } from './useVendorFilters';
import { AddVendorModal } from './AddVendorModal';

export function VendorsListView() {
  const { vendors } = useVendors();
  const { openVendorDetail } = useUI();
  const { filters, setFilter, resetFilters, filtered } = useVendorFilters(vendors);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Vendors</h2>
        <Button variant="primary" size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setAddOpen(true)}>
          Add Vendor
        </Button>
      </div>
      <VendorFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} resultCount={filtered.length} />
      <VendorTable vendors={filtered} />
      <AddVendorModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={(id) => openVendorDetail(id)} />
    </div>
  );
}
