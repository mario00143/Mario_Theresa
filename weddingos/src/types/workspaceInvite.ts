import type { WorkspaceRole } from './workspaceMember';

export const WORKSPACE_INVITE_STATUSES = ['Active', 'Used', 'Expired', 'Revoked'] as const;
export type WorkspaceInviteStatus = (typeof WORKSPACE_INVITE_STATUSES)[number];

/**
 * A free, link-based workspace invite (section 19-20). The raw token is
 * shown to the inviter exactly once (embedded in the copyable /join?token=
 * link) and is never stored — only `tokenHash` is persisted, so a leaked
 * database row cannot be used to join a workspace on its own.
 */
export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  invitedBy: string;
  status: WorkspaceInviteStatus;
  createdAt: string;
}
