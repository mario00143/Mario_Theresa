import type { GroomingAppointment } from '@/types';
import { generateId } from '@/lib/id';
import { groomingAppointmentsStore } from '../stores';

export type NewGroomingAppointmentInput = Omit<GroomingAppointment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export function addGroomingAppointment(input: NewGroomingAppointmentInput): GroomingAppointment {
  const timestamp = nowISO();
  const appointment: GroomingAppointment = { ...input, id: generateId('grooming'), createdAt: timestamp, updatedAt: timestamp };
  groomingAppointmentsStore.set((prev) => [...prev, appointment]);
  return appointment;
}

export function updateGroomingAppointment(id: string, patch: Partial<Omit<GroomingAppointment, 'id' | 'createdAt'>>): void {
  groomingAppointmentsStore.set((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowISO() } : a)));
}

export function deleteGroomingAppointment(id: string): void {
  groomingAppointmentsStore.set((prev) => prev.filter((a) => a.id !== id));
}
