import { useMemo, useState } from 'react';
import type { EventScope, Vendor, VendorCategory, VendorStatus } from '@/types';

export type VendorSortKey = 'name' | 'category' | 'status';

export interface VendorFilterState {
  search: string;
  status: VendorStatus | 'All';
  category: VendorCategory | 'All';
  event: EventScope | 'All';
  sortKey: VendorSortKey;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: VendorFilterState = {
  search: '',
  status: 'All',
  category: 'All',
  event: 'All',
  sortKey: 'name',
  sortDir: 'asc',
};

function matchesSearch(vendor: Vendor, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    vendor.name.toLowerCase().includes(q) ||
    (vendor.city ?? '').toLowerCase().includes(q) ||
    (vendor.email ?? '').toLowerCase().includes(q) ||
    (vendor.phone ?? '').toLowerCase().includes(q) ||
    (vendor.bookingOwner ?? '').toLowerCase().includes(q)
  );
}

export function useVendorFilters(vendors: Vendor[]) {
  const [filters, setFilters] = useState<VendorFilterState>(DEFAULT_FILTERS);

  const setFilter = <K extends keyof VendorFilterState>(key: K, value: VendorFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let result = vendors.filter((vendor) => {
      if (filters.status !== 'All' && vendor.status !== filters.status) return false;
      if (filters.category !== 'All' && vendor.category !== filters.category) return false;
      if (filters.event !== 'All' && vendor.event !== filters.event && vendor.event !== 'Both') return false;
      if (!matchesSearch(vendor, filters.search)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [vendors, filters]);

  return { filters, setFilter, resetFilters, filtered };
}
