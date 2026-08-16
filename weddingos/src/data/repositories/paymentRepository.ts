import type { Payment } from '@/types';
import { generateId } from '@/lib/id';
import { budgetItemsStore, paymentSchedulesStore, paymentsStore, vendorsStore } from '../stores';

export type NewPaymentInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

function nowISO(): string {
  return new Date().toISOString();
}

export class InvalidPaymentAmountError extends Error {
  amount: number;

  constructor(amount: number) {
    super(amount < 0 ? 'Payment amount cannot be negative.' : 'Payment amount must be greater than zero.');
    this.name = 'InvalidPaymentAmountError';
    this.amount = amount;
  }
}

export class PaymentLinkedEntityNotFoundError extends Error {
  field: string;

  constructor(field: string) {
    super(`The ${field} this payment references could not be found.`);
    this.name = 'PaymentLinkedEntityNotFoundError';
    this.field = field;
  }
}

function validateLinks(input: Pick<Payment, 'vendorId' | 'budgetItemId' | 'paymentScheduleId'>): void {
  if (!vendorsStore.get().some((v) => v.id === input.vendorId)) {
    throw new PaymentLinkedEntityNotFoundError('vendor');
  }
  if (input.budgetItemId && !budgetItemsStore.get().some((i) => i.id === input.budgetItemId)) {
    throw new PaymentLinkedEntityNotFoundError('budget item');
  }
  if (input.paymentScheduleId && !paymentSchedulesStore.get().some((s) => s.id === input.paymentScheduleId)) {
    throw new PaymentLinkedEntityNotFoundError('payment schedule');
  }
}

/**
 * Adds a payment after enforcing the hard rules from Phase 4 section 16:
 * amount must be positive, and every linked entity (vendor required; budget
 * item / payment schedule only if provided) must actually exist.
 */
export function addPayment(input: NewPaymentInput): Payment {
  if (input.amount <= 0) throw new InvalidPaymentAmountError(input.amount);
  validateLinks(input);

  const timestamp = nowISO();
  const payment: Payment = { ...input, id: generateId('payment'), createdAt: timestamp, updatedAt: timestamp };
  paymentsStore.set((prev) => [...prev, payment]);
  return payment;
}

export function updatePayment(id: string, patch: Partial<Omit<Payment, 'id' | 'createdAt'>>): void {
  const existing = paymentsStore.get().find((p) => p.id === id);
  if (!existing) return;

  if (patch.amount !== undefined && patch.amount <= 0) throw new InvalidPaymentAmountError(patch.amount);

  const next = { ...existing, ...patch };
  if (patch.vendorId !== undefined || patch.budgetItemId !== undefined || patch.paymentScheduleId !== undefined) {
    validateLinks(next);
  }

  paymentsStore.set((prev) => prev.map((p) => (p.id === id ? { ...next, updatedAt: nowISO() } : p)));
}

export function deletePayment(id: string): void {
  paymentsStore.set((prev) => prev.filter((p) => p.id !== id));
}
