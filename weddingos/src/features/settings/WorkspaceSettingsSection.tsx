import { useState, type FormEvent } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import { updateWorkspace } from '@/data/supabase/workspaceRepository';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, FieldError, Input, Label } from '@/components/ui/Field';

export function WorkspaceSettingsSection() {
  const { currentWorkspace, refresh } = useWorkspace();
  const { can, reason } = usePermission();
  const writable = can('workspaceSettings').write;
  const [name, setName] = useState(currentWorkspace?.name ?? '');
  const [groomName, setGroomName] = useState(currentWorkspace?.groomName ?? '');
  const [brideName, setBrideName] = useState(currentWorkspace?.brideName ?? '');
  const [timezone, setTimezone] = useState(currentWorkspace?.timezone ?? '');
  const [currency, setCurrency] = useState(currentWorkspace?.currency ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!currentWorkspace) return null;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateWorkspace(currentWorkspace!.id, { name, groomName, brideName, timezone, currency });
      await refresh();
      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-lg space-y-4 p-4">
      <h2 className="text-ink text-sm font-semibold">Workspace</h2>
      {!writable && <p className="text-ink-faint text-xs">{reason('workspaceSettings')}</p>}
      <form onSubmit={handleSave} className="space-y-3">
        <Field>
          <Label htmlFor="wsSettingsName">Workspace name</Label>
          <Input id="wsSettingsName" disabled={!writable} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="wsGroom">Groom name</Label>
            <Input id="wsGroom" disabled={!writable} value={groomName} onChange={(e) => setGroomName(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="wsBride">Bride name</Label>
            <Input id="wsBride" disabled={!writable} value={brideName} onChange={(e) => setBrideName(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="wsTimezone">Timezone</Label>
            <Input id="wsTimezone" disabled={!writable} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="wsCurrency">Currency</Label>
            <Input id="wsCurrency" disabled={!writable} value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </Field>
        </div>
        <FieldError>{error}</FieldError>
        {message && <p className="text-success text-xs">{message}</p>}
        {writable && (
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        )}
      </form>
    </Card>
  );
}
