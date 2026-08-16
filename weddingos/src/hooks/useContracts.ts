import { useCallback } from 'react';
import type { Contract } from '@/types';
import { contractsStore } from '@/data/stores';
import { addContract, deleteContract, updateContract, type NewContractInput } from '@/data/repositories/contractRepository';
import { useStoreValue } from './useStore';

export function useContracts() {
  const contracts = useStoreValue(contractsStore);

  return {
    contracts,
    addContract: useCallback((input: NewContractInput) => addContract(input), []),
    updateContract: useCallback((id: string, patch: Partial<Omit<Contract, 'id' | 'createdAt'>>) => updateContract(id, patch), []),
    deleteContract: useCallback((id: string) => deleteContract(id), []),
  };
}

export function useContractsForVendor(vendorId: string | undefined): Contract[] {
  const contracts = useStoreValue(contractsStore);
  return vendorId ? contracts.filter((c) => c.vendorId === vendorId) : [];
}
