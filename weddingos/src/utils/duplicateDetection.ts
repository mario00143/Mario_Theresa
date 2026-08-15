import type { Guest, Household } from '@/types';
import { isVerySimilar, normalizeEmail, normalizePhone } from './stringSimilarity';

export interface DuplicateWarning {
  reason: string;
  matchId: string;
  matchLabel: string;
}

/**
 * Checks a candidate household (new or being edited — pass its own id as
 * excludeId to avoid matching itself) against existing households for
 * likely duplicates. Never blocks — callers show these as warnings the
 * user can override, since real families do share names.
 */
export function findSimilarHouseholds(
  candidate: { householdName: string; primaryPhone?: string; email?: string },
  households: Household[],
  excludeId?: string,
): DuplicateWarning[] {
  const warnings: DuplicateWarning[] = [];
  const candidatePhone = candidate.primaryPhone ? normalizePhone(candidate.primaryPhone) : '';
  const candidateEmail = candidate.email ? normalizeEmail(candidate.email) : '';

  for (const household of households) {
    if (household.id === excludeId) continue;

    if (candidate.householdName && isVerySimilar(candidate.householdName, household.householdName)) {
      warnings.push({
        reason: `Household name is very similar to "${household.householdName}".`,
        matchId: household.id,
        matchLabel: household.householdName,
      });
    }
    if (candidatePhone && household.primaryPhone && normalizePhone(household.primaryPhone) === candidatePhone) {
      warnings.push({
        reason: `Primary phone matches "${household.householdName}".`,
        matchId: household.id,
        matchLabel: household.householdName,
      });
    }
    if (candidateEmail && household.email && normalizeEmail(household.email) === candidateEmail) {
      warnings.push({
        reason: `Email matches "${household.householdName}".`,
        matchId: household.id,
        matchLabel: household.householdName,
      });
    }
  }

  return warnings;
}

/**
 * Checks a candidate guest against existing guests for likely duplicates:
 * a strongly similar name anywhere, a matching phone/email anywhere, or
 * the exact same full name within the same household.
 */
export function findSimilarGuests(
  candidate: { fullName: string; phone?: string; email?: string; householdId: string },
  guests: Guest[],
  excludeId?: string,
): DuplicateWarning[] {
  const warnings: DuplicateWarning[] = [];
  const candidatePhone = candidate.phone ? normalizePhone(candidate.phone) : '';
  const candidateEmail = candidate.email ? normalizeEmail(candidate.email) : '';
  const candidateName = candidate.fullName.trim().toLowerCase();

  for (const guest of guests) {
    if (guest.id === excludeId) continue;

    const sameHousehold = guest.householdId === candidate.householdId;
    const sameName = candidateName.length > 0 && guest.fullName.trim().toLowerCase() === candidateName;

    if (sameHousehold && sameName) {
      warnings.push({
        reason: `"${guest.fullName}" already exists in this household — check this isn't a duplicate entry.`,
        matchId: guest.id,
        matchLabel: guest.fullName,
      });
      continue;
    }

    if (candidate.fullName && isVerySimilar(candidate.fullName, guest.fullName)) {
      warnings.push({
        reason: `Name strongly matches existing guest "${guest.fullName}".`,
        matchId: guest.id,
        matchLabel: guest.fullName,
      });
    }
    if (candidatePhone && guest.phone && normalizePhone(guest.phone) === candidatePhone) {
      warnings.push({
        reason: `Phone matches existing guest "${guest.fullName}".`,
        matchId: guest.id,
        matchLabel: guest.fullName,
      });
    }
    if (candidateEmail && guest.email && normalizeEmail(guest.email) === candidateEmail) {
      warnings.push({
        reason: `Email matches existing guest "${guest.fullName}".`,
        matchId: guest.id,
        matchLabel: guest.fullName,
      });
    }
  }

  return warnings;
}
