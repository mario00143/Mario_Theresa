import { useState, type FormEvent } from 'react';
import type { NewWorkspaceInput } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, Input, Label, Select } from '@/components/ui/Field';
import { AuthLayout } from './AuthLayout';

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'UTC'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

export function CreateWorkspacePage() {
  const { signOut } = useAuth();
  const { createNewWorkspace, workspaces } = useWorkspace();
  const [name, setName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [engagementDate, setEngagementDate] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const input: NewWorkspaceInput = {
        name,
        groomName,
        brideName,
        timezone,
        currency,
        engagementDate: engagementDate || undefined,
        weddingDate: weddingDate || undefined,
      };
      await createNewWorkspace(input);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create workspace.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your wedding workspace"
      subtitle={
        workspaces.length === 0
          ? "You don't have a workspace yet — let's set one up."
          : 'Create another wedding workspace.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <Label htmlFor="wsName" required>
            Workspace name
          </Label>
          <Input id="wsName" placeholder="e.g. Alex & Priya's Wedding" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="groomName" required>
              Groom name
            </Label>
            <Input id="groomName" required value={groomName} onChange={(e) => setGroomName(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="brideName" required>
              Bride name
            </Label>
            <Input id="brideName" required value={brideName} onChange={(e) => setBrideName(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="engagementDate">Engagement date</Label>
            <Input id="engagementDate" type="date" value={engagementDate} onChange={(e) => setEngagementDate(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="weddingDate">Wedding date</Label>
            <Input id="weddingDate" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="timezone">Timezone</Label>
            <Select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <FieldError>{formError}</FieldError>
        <Button type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? 'Creating…' : 'Create workspace'}
        </Button>
      </form>
      <button type="button" onClick={() => void signOut()} className="text-ink-faint mt-4 w-full text-center text-sm hover:underline">
        Sign out
      </button>
    </AuthLayout>
  );
}
