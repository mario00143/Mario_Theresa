import type { Decision } from '@/types';
import { generateId } from '@/lib/id';
import { decisionsStore } from '../stores';

export type NewDecisionInput = Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'options'> & {
  options?: string[];
};

function nowISO(): string {
  return new Date().toISOString();
}

export function addDecision(input: NewDecisionInput): Decision {
  const timestamp = nowISO();
  const decision: Decision = {
    ...input,
    options: input.options ?? [],
    id: generateId('decision'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  decisionsStore.set((prev) => [...prev, decision]);
  return decision;
}

export function updateDecision(id: string, patch: Partial<Omit<Decision, 'id' | 'createdAt'>>): void {
  decisionsStore.set((prev) =>
    prev.map((decision) => (decision.id === id ? { ...decision, ...patch, updatedAt: nowISO() } : decision)),
  );
}

export function deleteDecision(id: string): void {
  decisionsStore.set((prev) => prev.filter((decision) => decision.id !== id));
}
