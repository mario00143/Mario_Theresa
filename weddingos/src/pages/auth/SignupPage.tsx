import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Field, FieldError, FieldHint, Input, Label } from '@/components/ui/Field';
import { AuthLayout } from './AuthLayout';

const MIN_PASSWORD_LENGTH = 8;

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? '/';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
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
      await signUp(email, password, displayName);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a confirmation link to finish creating your account.">
        <Button variant="primary" fullWidth onClick={() => navigate('/login', { state: { redirectTo } })}>
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start planning your wedding with WeddingOS.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <Label htmlFor="displayName" required>
            Your name
          </Label>
          <Input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <Label htmlFor="password" required>
            Password
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
            Confirm password
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
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-ink-faint mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
