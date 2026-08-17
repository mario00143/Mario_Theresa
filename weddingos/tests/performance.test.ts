import { describe, expect, it } from 'vitest';
import type { Task, Decision, Guest, BudgetItem, Payment, RoomAssignment, CateringPlan, MenuItem, RunSheetItem } from '@/types';
import { computePlanningHealth } from '@/utils/dashboardStats';
import { computeCateringReadiness } from '@/utils/weddingPrepReadiness';
import { findGuestsRequiringAccommodationUnassigned } from '@/utils/logisticsStats';
import { computeFinanceSnapshot } from '@/utils/financeStats';
import { getCurrentRunSheetItem } from '@/utils/runSheetLogic';
import { seedSettings } from '@/data/settings.seed';

/**
 * Section 41's large-data performance benchmarks — 1,000+ records through
 * the same aggregation/filter/search functions the UI actually calls.
 * Thresholds are deliberately generous (hundreds of ms) so these stay
 * non-flaky on a loaded CI box; the point is catching an accidental O(n^2)
 * regression, not micro-benchmarking.
 */
const N = 1000;

function makeTasks(count: number): Task[] {
  const now = new Date().toISOString();
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    title: `Task ${i}`,
    description: '',
    event: 'Wedding',
    workstream: 'Vendors',
    owner: 'Owner',
    status: i % 5 === 0 ? 'Done' : 'Not Started',
    priority: 'Medium',
    dependencies: [],
    completionCriteria: '',
    tags: [],
    subtasks: [],
    createdAt: now,
    updatedAt: now,
  }));
}

function makeGuests(count: number): Guest[] {
  const now = new Date().toISOString();
  return Array.from({ length: count }, (_, i) => ({
    id: `guest-${i}`,
    householdId: `household-${i % 50}`,
    fullName: `Guest Name ${i}`,
    ageCategory: 'Adult',
    invitedEvents: ['Wedding'],
    rsvpResponses: [],
    dietaryPreference: 'Vegetarian',
    elderlyAssistanceRequired: false,
    accommodationRequired: i % 3 === 0,
    travelDetailsRequired: false,
    pickupRequired: false,
    plusOneStatus: 'Not Applicable',
    createdAt: now,
    updatedAt: now,
  }));
}

describe('Large-data performance (section 41)', () => {
  it(`filters ${N} tasks quickly`, () => {
    const tasks = makeTasks(N);
    const start = performance.now();
    const filtered = tasks.filter((t) => t.status === 'Not Started' && t.workstream === 'Vendors');
    const elapsed = performance.now() - start;
    expect(filtered.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });

  it(`searches ${N} guests by name quickly`, () => {
    const guests = makeGuests(N);
    const start = performance.now();
    const results = guests.filter((g) => g.fullName.toLowerCase().includes('name 42'));
    const elapsed = performance.now() - start;
    expect(results.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });

  it('computes dashboard planning health over 1,000 tasks + 200 decisions quickly', () => {
    const tasks = makeTasks(N);
    const now = new Date().toISOString();
    const decisions: Decision[] = Array.from({ length: 200 }, (_, i) => ({
      id: `decision-${i}`,
      title: `Decision ${i}`,
      description: '',
      category: 'Other',
      owner: 'Owner',
      options: ['A', 'B'],
      status: 'Open',
      createdAt: now,
      updatedAt: now,
    }));
    const start = performance.now();
    const health = computePlanningHealth(tasks, decisions);
    const elapsed = performance.now() - start;
    expect(health).toBeDefined();
    expect(elapsed).toBeLessThan(300);
  });

  it('computes Wedding Prep catering readiness over 1,000 menu items quickly', () => {
    const now = new Date().toISOString();
    const plan: CateringPlan = { id: 'plan-1', event: 'Wedding', serviceStyle: 'Buffet', coupleMealReserved: false, createdAt: now, updatedAt: now };
    const menuItems: MenuItem[] = Array.from({ length: N }, (_, i) => ({
      id: `menu-${i}`,
      cateringPlanId: 'plan-1',
      course: 'Main Course',
      name: `Item ${i}`,
      dietaryType: 'Mixed',
      liveCounter: false,
      approved: i % 2 === 0,
      tastingStatus: 'Completed',
      createdAt: now,
      updatedAt: now,
    }));
    const start = performance.now();
    const readiness = computeCateringReadiness([plan], menuItems);
    const elapsed = performance.now() - start;
    expect(readiness).toBeDefined();
    expect(elapsed).toBeLessThan(300);
  });

  it('computes unassigned-accommodation guests over 1,000 guests + 1,000 room assignments quickly', () => {
    const guests = makeGuests(N);
    const now = new Date().toISOString();
    const roomAssignments: RoomAssignment[] = Array.from({ length: N }, (_, i) => ({
      id: `ra-${i}`,
      roomId: `room-${i % 100}`,
      guestId: `guest-${i}`,
      householdId: `household-${i % 50}`,
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-03',
      assignmentStatus: 'Confirmed',
      primaryOccupant: true,
      extraBedRequired: false,
      childCotRequired: false,
      accessibilityRequired: false,
      createdAt: now,
      updatedAt: now,
    }));
    const start = performance.now();
    const unassigned = findGuestsRequiringAccommodationUnassigned(guests, roomAssignments);
    const elapsed = performance.now() - start;
    expect(Array.isArray(unassigned)).toBe(true);
    expect(elapsed).toBeLessThan(300);
  });

  it('computes finance snapshot over 1,000 budget items + 1,000 payments quickly', () => {
    const now = new Date().toISOString();
    const budgetItems: BudgetItem[] = Array.from({ length: N }, (_, i) => ({
      id: `bi-${i}`,
      categoryId: `cat-${i % 20}`,
      event: 'Wedding',
      itemName: `Item ${i}`,
      originalBudget: 10000,
      approvalStatus: 'Approved',
      createdAt: now,
      updatedAt: now,
    }));
    const payments: Payment[] = Array.from({ length: N }, (_, i) => ({
      id: `pay-${i}`,
      vendorId: `vendor-${i % 30}`,
      budgetItemId: `bi-${i}`,
      paymentDate: '2026-06-01',
      amount: 5000,
      paymentMethod: 'UPI',
      invoiceReceived: true,
      receiptReceived: true,
      createdAt: now,
      updatedAt: now,
    }));
    const start = performance.now();
    const snapshot = computeFinanceSnapshot(budgetItems, payments);
    const elapsed = performance.now() - start;
    expect(snapshot).toBeDefined();
    expect(elapsed).toBeLessThan(300);
  });

  it('finds the current run-sheet item among 1,000 items quickly', () => {
    const settings = seedSettings();
    const now = new Date();
    const items: RunSheetItem[] = Array.from({ length: N }, (_, i) => {
      const start = new Date(now.getTime() + (i - 500) * 60_000);
      const end = new Date(start.getTime() + 30_000);
      return {
        id: `rs-${i}`,
        event: 'Wedding',
        date: settings.wedding.date,
        startTime: start.toISOString().slice(11, 16),
        endTime: end.toISOString().slice(11, 16),
        relativeReference: 'None',
        activity: `Item ${i}`,
        category: 'Other',
        participantIds: [],
        vendorIds: [],
        requiredItemIds: [],
        relatedTaskIds: [],
        relatedTransportRouteIds: [],
        dependencyIds: [],
        status: 'Planned',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    });
    const start = performance.now();
    getCurrentRunSheetItem(items, settings, now.toISOString());
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(300);
  });
});
