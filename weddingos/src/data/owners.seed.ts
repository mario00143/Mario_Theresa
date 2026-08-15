import type { Owner } from '@/types';
import { DEFAULT_OWNER_NAMES } from '@/types';
import { generateId } from '@/lib/id';

export function seedOwners(): Owner[] {
  return DEFAULT_OWNER_NAMES.map((name) => ({
    id: generateId('owner'),
    name,
    isCustom: false,
  }));
}
