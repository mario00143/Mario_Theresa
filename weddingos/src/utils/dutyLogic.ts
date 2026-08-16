import type { DutyAssignment, DutyRole } from '@/types';
import { DEFAULT_CRITICAL_DUTY_ROLES } from '@/types';

export function isCriticalDutyRole(role: DutyRole, criticalRoles: DutyRole[] = DEFAULT_CRITICAL_DUTY_ROLES): boolean {
  return criticalRoles.includes(role);
}

/** Section 16: critical roles with nobody assigned at all. */
export function missingCriticalDutyRoles(duties: DutyAssignment[], criticalRoles: DutyRole[] = DEFAULT_CRITICAL_DUTY_ROLES): DutyRole[] {
  const assignedRoles = new Set(duties.map((d) => d.role));
  return criticalRoles.filter((role) => !assignedRoles.has(role));
}

/** Section 16: critical-role assignments missing a phone number. */
export function criticalDutiesWithoutPhone(duties: DutyAssignment[], criticalRoles: DutyRole[] = DEFAULT_CRITICAL_DUTY_ROLES): DutyAssignment[] {
  return duties.filter((d) => isCriticalDutyRole(d.role, criticalRoles) && !d.phone?.trim());
}

/** Section 16: critical-role assignments missing a named backup person. */
export function criticalDutiesWithoutBackup(duties: DutyAssignment[], criticalRoles: DutyRole[] = DEFAULT_CRITICAL_DUTY_ROLES): DutyAssignment[] {
  return duties.filter((d) => isCriticalDutyRole(d.role, criticalRoles) && !d.backupPersonName?.trim());
}

function timeToMinutes(time: string | undefined): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function windowsOverlap(aStart: number | null, aEnd: number | null, bStart: number | null, bEnd: number | null): boolean {
  if (aStart === null || bStart === null) return false;
  const aE = aEnd ?? aStart;
  const bE = bEnd ?? bStart;
  return aStart < bE && bStart < aE;
}

export interface DutyOverlap {
  personName: string;
  dutyAId: string;
  dutyBId: string;
}

/** Section 16: same person assigned two duties whose time windows overlap. */
export function detectDutyOverlaps(duties: DutyAssignment[]): DutyOverlap[] {
  const overlaps: DutyOverlap[] = [];
  const byPerson = new Map<string, DutyAssignment[]>();
  for (const duty of duties) {
    const key = duty.personName.trim().toLowerCase();
    if (!key) continue;
    const list = byPerson.get(key) ?? [];
    list.push(duty);
    byPerson.set(key, list);
  }
  for (const list of byPerson.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (windowsOverlap(timeToMinutes(a.startTime), timeToMinutes(a.endTime), timeToMinutes(b.startTime), timeToMinutes(b.endTime))) {
          overlaps.push({ personName: a.personName, dutyAId: a.id, dutyBId: b.id });
        }
      }
    }
  }
  return overlaps;
}

/** Section 16: duty shift ends before a run-sheet item in the same category/location that needs it — checked by the caller supplying the responsibility's required end time. */
export function isDutyShiftTooShort(duty: DutyAssignment, requiredEndTime: string): boolean {
  const dutyEnd = timeToMinutes(duty.endTime);
  const required = timeToMinutes(requiredEndTime);
  if (dutyEnd === null || required === null) return false;
  return dutyEnd < required;
}
