import type { AppSettings, Decision, Guest, Household, Owner, Task } from '@/types';
import { seedOwners } from './owners.seed';
import { seedSettings } from './settings.seed';
import { buildSeedTasks } from './tasks.seed';
import { buildSeedDecisions } from './decisions.seed';
import { buildSeedHouseholdsAndGuests } from './households.seed';

export interface SeedBundle {
  settings: AppSettings;
  tasks: Task[];
  decisions: Decision[];
  owners: Owner[];
  households: Household[];
  guests: Guest[];
}

export function createSeedBundle(): SeedBundle {
  const { tasks, idByKey } = buildSeedTasks();
  const decisions = buildSeedDecisions(idByKey);
  const { households, guests } = buildSeedHouseholdsAndGuests();
  return {
    settings: seedSettings(),
    tasks,
    decisions,
    owners: seedOwners(),
    households,
    guests,
  };
}
