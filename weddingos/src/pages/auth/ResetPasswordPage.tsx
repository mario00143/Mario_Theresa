import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, FieldHint, Input, Label } from '@/components/ui/Field';
import { AuthLayout } from './AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

/** Landed on via the reset-link email (redirectTo=#/reset-password). Supabase's client library already exchanges the URL token for a session before this mounts. */
export function ResetPasswordPage() {
  const { completePasswordReset } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await completePasswordReset(password);
      setDone(true);
    } catch (err) {
      setFormError(
        err instanceof Error && /expired|invalid/i.test(err.message)
          ? 'This reset link has expired. Request a new one from the sign-in page.'
          : err instanceof Error
            ? err.message
            : 'Could not reset password.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password.">
        <Button variant="primary" fullWidth onClick={() => navigate('/login', { replace: true })}>
          Continue to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <Label htmlFor="password" required>
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldHint>At least {MIN_PASSWORD_LENGTH} characters.</FieldHint>
        </Field>
        <Field>
          <Label htmlFor="confirmPassword" required>
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        <FieldError>{formError}</FieldError>
        <Button type="submit" variant="primary" fullWidth disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
