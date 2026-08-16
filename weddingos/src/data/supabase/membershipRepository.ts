import type { UserProfile, WorkspaceInvite, WorkspaceMember, WorkspaceRole } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { genericFromRow } from '@/data/adapters/genericMapper';
import { generateInviteToken, sha256Hex } from '@/lib/hashToken';
import type { Json } from '@/lib/supabase/database.types';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured.');
  return client;
}

export interface MemberWithProfile extends WorkspaceMember {
  profile?: Pick<UserProfile, 'displayName' | 'email'>;
}

export async function listMembers(workspaceId: string): Promise<MemberWithProfile[]> {
  const { data, error } = await requireClient()
    .from('workspace_members')
    .select('*, user_profiles(display_name, email)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const record = row as Record<string, Json> & { user_profiles?: { display_name: string; email: string } | null };
    const member = genericFromRow<WorkspaceMember>(record);
    return {
      ...member,
      profile: record.user_profiles
        ? { displayName: record.user_profiles.display_name, email: record.user_profiles.email }
        : undefined,
    };
  });
}

export async function getMyMembership(workspaceId: string, userId: string): Promise<WorkspaceMember | undefined> {
  const { data, error } = await requireClient()
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? genericFromRow<WorkspaceMember>(data as Record<string, Json>) : undefined;
}

export async function updateMemberRole(memberId: string, role: WorkspaceRole): Promise<void> {
  const { error } = await requireClient().from('workspace_members').update({ role }).eq('id', memberId);
  if (error) throw error;
}

export async function updateMemberStatus(memberId: string, status: WorkspaceMember['status']): Promise<void> {
  const { error } = await requireClient().from('workspace_members').update({ status }).eq('id', memberId);
  if (error) throw error;
}

export async function removeMember(memberId: string): Promise<void> {
  const { error } = await requireClient().from('workspace_members').delete().eq('id', memberId);
  if (error) throw error;
}

const INVITE_LIFETIME_DAYS = 7;

/** Creates an invite and returns the RAW token (shown once, embedded in the copyable link) — never stored. */
export async function createInvite(workspaceId: string, email: string, role: WorkspaceRole, invitedBy: string): Promise<string> {
  const token = generateInviteToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + INVITE_LIFETIME_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await requireClient()
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      token_hash: tokenHash,
      expires_at: expiresAt,
      invited_by: invitedBy,
      status: 'Active',
    } as never);
  if (error) throw error;
  return token;
}

export async function listInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
  const { data, error } = await requireClient()
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => genericFromRow<WorkspaceInvite>(row as Record<string, Json>));
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await requireClient().from('workspace_invites').update({ status: 'Revoked' } as never).eq('id', inviteId);
  if (error) throw error;
}

/** Validates + consumes an invite token and activates membership, all inside one DB transaction. Returns the joined workspace id. */
export async function acceptInvite(token: string): Promise<string> {
  const { data, error } = await requireClient().rpc('accept_workspace_invite', { p_token: token });
  if (error) throw error;
  return data as string;
}

export function buildInviteLink(token: string): string {
  return `${window.location.origin}${window.location.pathname}#/join?token=${encodeURIComponent(token)}`;
}
