import type { AppSettings, Decision, Owner, Task } from '@/types';
import { seedOwners } from './owners.seed';
import { seedSettings } from './settings.seed';
import { buildSeedTasks } from './tasks.seed';
import { buildSeedDecisions } from './decisions.seed';

export interface SeedBundle {
  settings: AppSettings;
  tasks: Task[];
  decisions: Decision[];
  owners: Owner[];
}

export function createSeedBundle(): SeedBundle {
  const { tasks, idByKey } = buildSeedTasks();
  const decisions = buildSeedDecisions(idByKey);
  return {
    settings: seedSettings(),
    tasks,
    decisions,
    owners: seedOwners(),
  };
}
