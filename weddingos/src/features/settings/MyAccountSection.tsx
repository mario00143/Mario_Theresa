import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateMyProfile } from '@/data/supabase/userProfileRepository';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, FieldError, Input, Label } from '@/components/ui/Field';

export function MyAccountSection() {
  const { profile, user, refreshProfile, signOut, requestPasswordReset } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateMyProfile({ displayName });
      await refreshProfile();
      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-lg space-y-4 p-4">
      <h2 className="text-ink text-sm font-semibold">My Account</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <Field>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field>
          <Label htmlFor="accountEmail">Email</Label>
          <Input id="accountEmail" value={user?.email ?? ''} disabled />
        </Field>
        <FieldError>{error}</FieldError>
        {message && <p className="text-success text-xs">{message}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => user?.email && requestPasswordReset(user.email)}>
            Send password reset link
          </Button>
        </div>
      </form>
      <div className="border-line-soft border-t pt-3">
        <Button variant="danger" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </Card>
  );
}
