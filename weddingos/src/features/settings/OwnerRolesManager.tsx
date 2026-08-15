import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { useOwners } from '@/hooks/useOwners';
import { OwnerInUseError } from '@/data/repositories/ownerRepository';

export function OwnerRolesManager() {
  const { owners, addOwner, renameOwner, deleteOwner, countTasksForOwner } = useOwners();
  const [newRoleName, setNewRoleName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newRoleName.trim()) return;
    addOwner(newRoleName.trim());
    setNewRoleName('');
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingValue(current);
  };

  const commitEdit = () => {
    if (editingId && editingValue.trim()) {
      renameOwner(editingId, editingValue.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteError(null);
    try {
      deleteOwner(id);
    } catch (err) {
      if (err instanceof OwnerInUseError) {
        setDeleteError(err.message);
      } else {
        throw err;
      }
    }
    setConfirmDeleteId(null);
  };

  const ownerToDelete = owners.find((o) => o.id === confirmDeleteId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner roles</CardTitle>
      </CardHeader>
      <CardBody>
        {deleteError && (
          <div className="mb-4 rounded-lg border border-critical/30 bg-critical-bg px-3.5 py-3 text-sm text-critical">{deleteError}</div>
        )}

        <ul className="space-y-2 mb-4">
          {owners.map((owner) => {
            const taskCount = countTasksForOwner(owner.name);
            return (
              <li key={owner.id} className="flex items-center gap-2 rounded-lg border border-line-soft px-3 py-2.5">
                {editingId === owner.id ? (
                  <Input
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="h-8"
                  />
                ) : (
                  <span className="flex-1 text-sm text-ink">{owner.name}</span>
                )}
                <span className="text-xs text-ink-faint whitespace-nowrap">
                  {taskCount} task{taskCount === 1 ? '' : 's'}
                </span>
                {!owner.isCustom && <Badge tone="neutral">Default</Badge>}
                <button
                  type="button"
                  onClick={() => startEdit(owner.id, owner.name)}
                  aria-label={`Rename ${owner.name}`}
                  className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-ink"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
                {owner.isCustom && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(owner.id)}
                    aria-label={`Delete ${owner.name}`}
                    className="rounded-md p-1.5 text-ink-faint hover:bg-surface-muted hover:text-critical"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2">
          <Input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a custom owner role…"
            aria-label="New owner role name"
          />
          <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={handleAdd} disabled={!newRoleName.trim()}>
            Add role
          </Button>
        </div>
      </CardBody>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete owner role"
        message={`Are you sure you want to delete "${ownerToDelete?.name}"? This can only be done if no tasks are assigned to this role.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </Card>
  );
}
