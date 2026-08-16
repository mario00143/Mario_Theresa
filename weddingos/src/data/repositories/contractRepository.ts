import type { Contract } from '@/types';
import { generateId } from '@/lib/id';
import { contractsStore, paymentSchedulesStore, refundsStore } from '../stores';

export type NewContractInput = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addContract(input: NewContractInput): Contract {
  const timestamp = nowISO();
  const contract: Contract = { ...input, id: generateId('contract'), createdAt: timestamp, updatedAt: timestamp };
  contractsStore.set((prev) => [...prev, contract]);
  return contract;
}

export function updateContract(id: string, patch: Partial<Omit<Contract, 'id' | 'createdAt'>>): void {
  contractsStore.set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)));
}

/** Deletes a contract and un-links any payment schedules/refunds that reference it. */
export function deleteContract(id: string): void {
  contractsStore.set((prev) => prev.filter((c) => c.id !== id));
  paymentSchedulesStore.set((prev) => prev.map((s) => (s.contractId === id ? { ...s, contractId: undefined, updatedAt: nowISO() } : s)));
  refundsStore.set((prev) => prev.map((r) => (r.contractId === id ? { ...r, contractId: undefined, updatedAt: nowISO() } : r)));
}
