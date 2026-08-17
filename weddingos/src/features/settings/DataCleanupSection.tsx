import { useMemo, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';
import { useTasks } from '@/hooks/useTasks';
import { useDecisions } from '@/hooks/useDecisions';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useGuests } from '@/hooks/useGuests';
import { getSeedIdentificationModules } from '@/data/demoData/seedIdentification';
import { deleteTask } from '@/data/repositories/taskRepository';
import { deleteDecision } from '@/data/repositories/decisionRepository';
import { deleteHousehold } from '@/data/repositories/householdRepository';
import { deleteGuest } from '@/data/repositories/guestRepository';

/**
 * Section 62's Demo Data Cleanup Assistant — Admin-only, never runs
 * automatically. Only ever selects/deletes records whose id exactly
 * matches a precomputed, deterministic seed id (seedIdentification.ts) —
 * nothing here is guessed from a record's current name, so a user-created
 * record can never be accidentally caught, even if its title happens to
 * match a seed record's original title.
 */
export function DataCleanupSection() {
  const { isAdmin } = usePermission();
  const { tasks } = useTasks();
  const { decisions } = useDecisions();
  const { households } = useHouseholds();
  const { guests } = useGuests();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const liveByCollection = { tasks, decisions, households, guests };

  const rows = useMemo(() => {
    return getSeedIdentificationModules().map((mod) => {
      const live = liveByCollection[mod.collectionKey] as { id: string; title?: string; householdName?: string; fullName?: string }[];
      const matches = live.filter((r) => mod.knownIds.has(r.id));
      return { ...mod, matches };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, decisions, households, guests]);

  const totalMatches = rows.reduce((sum, r) => sum + r.matches.length, 0);

  if (!isAdmin()) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-ink-faint">Demo Data Cleanup is only available to workspace Admins.</p>
        </CardBody>
      </Card>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllConfident() {
    setSelected(new Set(rows.flatMap((r) => r.matches.map((m) => m.id))));
  }

  function handleDeleteConfirmed() {
    for (const row of rows) {
      for (const match of row.matches) {
        if (!selected.has(match.id)) continue;
        if (row.collectionKey === 'tasks') deleteTask(match.id);
        else if (row.collectionKey === 'decisions') deleteDecision(match.id);
        else if (row.collectionKey === 'households') deleteHousehold(match.id);
        else if (row.collectionKey === 'guests') deleteGuest(match.id);
      }
    }
    setSelected(new Set());
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink">Before real-data onboarding</p>
            <p className="mt-0.5 text-xs text-ink-faint">
              This tool identifies only records that exactly match the app's original demo/seed content by id — never by matching names or guessing. Any
              record you or a family member created is never touched, even if the title looks similar. Take a backup first (Settings → Backup).
            </p>
          </div>
        </CardBody>
      </Card>

      {rows.map((row) => (
        <Card key={row.collectionKey}>
          <CardHeader>
            <CardTitle>
              {row.label} ({row.matches.length} confidently identified)
            </CardTitle>
          </CardHeader>
          <CardBody>
            {row.matches.length === 0 ? (
              <p className="text-sm text-ink-faint">No original demo {row.label.toLowerCase()} found in this workspace.</p>
            ) : (
              <ul className="space-y-1.5">
                {row.matches.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} className="size-4" aria-label={`Select ${m.title ?? m.householdName ?? m.fullName ?? m.id}`} />
                    <span className="text-ink">{m.title ?? m.householdName ?? m.fullName ?? m.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={selectAllConfident} disabled={totalMatches === 0}>
          Select all confidently identified ({totalMatches})
        </Button>
        <Button variant="danger" size="sm" icon={<Trash2 className="size-3.5" aria-hidden="true" />} onClick={() => setConfirmOpen(true)} disabled={selected.size === 0}>
          Delete selected ({selected.size})
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete selected demo records?"
        message={`This permanently deletes ${selected.size} original demo record(s) from this workspace. This cannot be undone — make sure you have a backup if you're unsure.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
