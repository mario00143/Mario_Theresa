import type { Decision, Guest, Household, Task } from '@/types';

export interface SearchResults {
  tasks: Task[];
  decisions: Decision[];
  households: Household[];
  guests: Guest[];
}

function matches(haystack: (string | undefined)[], query: string): boolean {
  const q = query.toLowerCase();
  return haystack.some((value) => value?.toLowerCase().includes(q));
}

export function searchAll(
  tasks: Task[],
  decisions: Decision[],
  households: Household[],
  guests: Guest[],
  query: string,
): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) return { tasks: [], decisions: [], households: [], guests: [] };

  const matchedTasks = tasks.filter((task) =>
    matches([task.title, task.description, task.workstream, task.owner, ...task.tags], trimmed),
  );
  const matchedDecisions = decisions.filter((decision) => matches([decision.title, decision.description], trimmed));
  const matchedHouseholds = households.filter((household) =>
    matches([household.householdName, household.primaryContactName, household.primaryPhone, household.email, household.city], trimmed),
  );
  const matchedGuests = guests.filter((guest) => matches([guest.fullName, guest.phone, guest.email], trimmed));

  return {
    tasks: matchedTasks.slice(0, 20),
    decisions: matchedDecisions.slice(0, 20),
    households: matchedHouseholds.slice(0, 20),
    guests: matchedGuests.slice(0, 20),
  };
}
