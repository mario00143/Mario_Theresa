import { EmptyState } from '@/components/ui/EmptyState';
import { useTasks } from '@/hooks/useTasks';
import { useUI } from '@/context/UIContext';
import { daysBlocked, getDependencyStatus } from '@/utils/taskLogic';

export function BlockedView() {
  const { tasks } = useTasks();
  const { openTaskDetail } = useUI();
  const blocked = tasks.filter((t) => t.status === 'Blocked');

  if (blocked.length === 0) {
    return <EmptyState title="No blocked tasks" description="Nothing is currently blocked." />;
  }

  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Blocked reason</th>
              <th className="px-4 py-3">Dependency</th>
              <th className="px-4 py-3">Days blocked</th>
            </tr>
          </thead>
          <tbody>
            {blocked.map((task) => {
              const depStatus = getDependencyStatus(task, tasks);
              return (
                <tr
                  key={task.id}
                  onClick={() => openTaskDetail(task.id)}
                  className="border-b border-line-soft last:border-0 cursor-pointer hover:bg-surface-subtle"
                >
                  <td className="px-4 py-3 font-medium text-ink max-w-[16rem] truncate">{task.title}</td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{task.owner}</td>
                  <td className="px-4 py-3 text-ink-soft max-w-[18rem]">{task.blockedReason || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft max-w-[14rem]">
                    {depStatus.incomplete.length > 0 ? depStatus.incomplete.map((d) => d.title).join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{daysBlocked(task)} day{daysBlocked(task) === 1 ? '' : 's'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="sm:hidden space-y-2.5">
        {blocked.map((task) => {
          const depStatus = getDependencyStatus(task, tasks);
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => openTaskDetail(task.id)}
                className="w-full rounded-xl border border-line bg-surface p-4 text-left active:bg-surface-subtle"
              >
                <p className="font-medium text-ink">{task.title}</p>
                <p className="mt-1 text-xs text-ink-faint">{task.owner} · {daysBlocked(task)} day{daysBlocked(task) === 1 ? '' : 's'} blocked</p>
                {task.blockedReason && <p className="mt-1.5 text-sm text-ink-soft">{task.blockedReason}</p>}
                {depStatus.incomplete.length > 0 && (
                  <p className="mt-1 text-xs text-warning">Depends on: {depStatus.incomplete.map((d) => d.title).join(', ')}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
