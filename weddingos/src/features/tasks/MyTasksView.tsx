import { useState } from 'react';
import { Field, Label, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTasks } from '@/hooks/useTasks';
import { useOwners } from '@/hooks/useOwners';
import { TaskListView } from './TaskListView';

export function MyTasksView() {
  const { tasks } = useTasks();
  const { owners } = useOwners();
  const [owner, setOwner] = useState('');

  const ownerTasks = owner ? tasks.filter((t) => t.owner === owner) : [];

  return (
    <div className="space-y-4">
      <Field className="max-w-xs">
        <Label htmlFor="my-tasks-owner">View tasks for</Label>
        <Select id="my-tasks-owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Select an owner…</option>
          {owners.map((o) => (
            <option key={o.id} value={o.name}>
              {o.name}
            </option>
          ))}
        </Select>
      </Field>

      {!owner ? (
        <EmptyState title="Select an owner" description="Choose an owner above to see their assigned tasks." />
      ) : (
        <TaskListView tasks={ownerTasks} emptyTitle={`No tasks assigned to ${owner}`} />
      )}
    </div>
  );
}
