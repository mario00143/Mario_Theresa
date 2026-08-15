import type { InvitationMethod, InvitationStatus } from '@/types';
import { householdsStore } from '../stores';

function nowISO(): string {
  return new Date().toISOString();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function setStatus(id: string, status: InvitationStatus, extra: Record<string, unknown> = {}): void {
  householdsStore.set((prev) =>
    prev.map((household) =>
      household.id === id ? { ...household, ...extra, invitationStatus: status, updatedAt: nowISO() } : household,
    ),
  );
}

export function markReady(id: string): void {
  setStatus(id, 'Ready', { preparedAt: today() });
}

export function markSent(id: string): void {
  setStatus(id, 'Sent', { sentAt: today() });
}

export function markDelivered(id: string): void {
  setStatus(id, 'Delivered', { deliveredAt: today() });
}

export function markFollowUpRequired(id: string): void {
  setStatus(id, 'Follow-up Required');
}

export function markComplete(id: string): void {
  setStatus(id, 'Complete');
}

export function bulkSetInvitationStatus(ids: string[], status: InvitationStatus): void {
  const idSet = new Set(ids);
  const extra: Record<string, string> = {};
  if (status === 'Ready') extra.preparedAt = today();
  if (status === 'Sent') extra.sentAt = today();
  if (status === 'Delivered') extra.deliveredAt = today();
  householdsStore.set((prev) =>
    prev.map((household) =>
      idSet.has(household.id) ? { ...household, invitationStatus: status, ...extra, updatedAt: nowISO() } : household,
    ),
  );
}

export function bulkSetInvitationOwner(ids: string[], owner: string): void {
  const idSet = new Set(ids);
  householdsStore.set((prev) =>
    prev.map((household) => (idSet.has(household.id) ? { ...household, invitationOwner: owner, updatedAt: nowISO() } : household)),
  );
}

export function bulkSetInvitationMethod(ids: string[], methods: InvitationMethod[]): void {
  const idSet = new Set(ids);
  householdsStore.set((prev) =>
    prev.map((household) => (idSet.has(household.id) ? { ...household, invitationMethod: methods, updatedAt: nowISO() } : household)),
  );
}

export function bulkSetFollowUpOwner(ids: string[], owner: string): void {
  const idSet = new Set(ids);
  householdsStore.set((prev) =>
    prev.map((household) => (idSet.has(household.id) ? { ...household, rsvpFollowUpOwner: owner, updatedAt: nowISO() } : household)),
  );
}

export function recordFollowUp(id: string, patch: { nextFollowUpAt?: string; followUpNotes?: string }): void {
  householdsStore.set((prev) =>
    prev.map((household) =>
      household.id === id
        ? { ...household, lastFollowUpAt: today(), ...patch, updatedAt: nowISO() }
        : household,
    ),
  );
}
