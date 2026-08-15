import { Route, Routes } from 'react-router-dom';
import { TasksNav } from '@/features/tasks/TasksNav';
import { AllTasksView } from '@/features/tasks/AllTasksView';
import { KanbanTasksRoute } from '@/features/tasks/KanbanTasksRoute';
import { MyTasksView } from '@/features/tasks/MyTasksView';
import { OverdueView } from '@/features/tasks/OverdueView';
import { DueSoonView } from '@/features/tasks/DueSoonView';
import { BlockedView } from '@/features/tasks/BlockedView';

export function TasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Tasks</h1>
        <p className="text-sm text-ink-faint mt-0.5">Every workstream, tracked to completion.</p>
      </div>
      <TasksNav />
      <Routes>
        <Route index element={<AllTasksView />} />
        <Route path="kanban" element={<KanbanTasksRoute />} />
        <Route path="my-tasks" element={<MyTasksView />} />
        <Route path="overdue" element={<OverdueView />} />
        <Route path="due-soon" element={<DueSoonView />} />
        <Route path="blocked" element={<BlockedView />} />
      </Routes>
    </div>
  );
}
