import type { DutyAssignment } from '@/types';
import { generateId } from '@/lib/id';
import { dutyAssignmentsStore } from '../stores';

export type NewDutyAssignmentInput = Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addDutyAssignment(input: NewDutyAssignmentInput): DutyAssignment {
  const timestamp = nowISO();
  const duty: DutyAssignment = { ...input, id: generateId('duty'), createdAt: timestamp, updatedAt: timestamp };
  dutyAssignmentsStore.set((prev) => [...prev, duty]);
  return duty;
}

export function updateDutyAssignment(id: string, patch: Partial<Omit<DutyAssignment, 'id' | 'createdAt'>>): void {
  dutyAssignmentsStore.set((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowISO() } : d)));
}

export function deleteDutyAssignment(id: string): void {
  dutyAssignmentsStore.set((prev) => prev.filter((d) => d.id !== id));
}
