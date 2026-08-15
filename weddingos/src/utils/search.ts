import type { Decision, Task } from '@/types';

export interface SearchResults {
  tasks: Task[];
  decisions: Decision[];
}

function matches(haystack: (string | undefined)[], query: string): boolean {
  const q = query.toLowerCase();
  return haystack.some((value) => value?.toLowerCase().includes(q));
}

export function searchAll(tasks: Task[], decisions: Decision[], query: string): SearchResults {
  const trimmed = query.trim();
  if (!trimmed) return { tasks: [], decisions: [] };

  const matchedTasks = tasks.filter((task) =>
    matches([task.title, task.description, task.workstream, task.owner, ...task.tags], trimmed),
  );
  const matchedDecisions = decisions.filter((decision) => matches([decision.title, decision.description], trimmed));

  return { tasks: matchedTasks.slice(0, 20), decisions: matchedDecisions.slice(0, 20) };
}
