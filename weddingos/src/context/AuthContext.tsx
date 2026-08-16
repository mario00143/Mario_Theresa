import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getMyProfile } from '@/data/supabase/userProfileRepository';

export interface AuthContextValue {
  /** false when VITE_SUPABASE_URL/ANON_KEY are unset — the whole app runs in Demo/Local Mode and none of the fields below apply. */
  supabaseEnabled: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.';
  if (/user already registered/i.test(message)) return 'An account with this email already exists.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email before signing in.';
  if (/rate limit/i.test(message)) return 'Too many attempts — please wait a moment and try again.';
  if (/network/i.test(message) || /fetch/i.test(message)) return 'Network error — check your connection and try again.';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseEnabled = isSupabaseConfigured();
  const [loading, setLoading] = useState(supabaseEnabled);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!supabaseEnabled) return;
    try {
      const p = await getMyProfile();
      setProfile(p ?? null);
    } catch {
      // Profile row is created by a DB trigger on sign-up; a transient miss on the very first load is not fatal.
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!supabaseEnabled) return;
    const client = getSupabaseClient();
    if (!client) return;

    let cancelled = false;

    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session) void refreshProfile();
      setLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) void refreshProfile();
      else setProfile(null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      supabaseEnabled,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      error,
      async signUp(email, password, displayName) {
        setError(null);
        const client = getSupabaseClient();
        if (!client) return;
        const { error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (signUpError) {
          setError(friendlyAuthError(signUpError));
          throw signUpError;
        }
      },
      async signIn(email, password) {
        setError(null);
        const client = getSupabaseClient();
        if (!client) return;
        const { error: signInError } = await client.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(friendlyAuthError(signInError));
          throw signInError;
        }
      },
      async signOut() {
        setError(null);
        const client = getSupabaseClient();
        if (!client) return;
        await client.auth.signOut();
      },
      async requestPasswordReset(email) {
        setError(null);
        const client = getSupabaseClient();
        if (!client) return;
        const { error: resetError } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
        });
        if (resetError) {
          setError(friendlyAuthError(resetError));
          throw resetError;
        }
      },
      async completePasswordReset(newPassword) {
        setError(null);
        const client = getSupabaseClient();
        if (!client) return;
        const { error: updateError } = await client.auth.updateUser({ password: newPassword });
        if (updateError) {
          setError(friendlyAuthError(updateError));
          throw updateError;
        }
      },
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabaseEnabled, loading, session, profile, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
