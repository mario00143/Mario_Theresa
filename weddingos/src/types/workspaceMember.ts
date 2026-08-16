export const WORKSPACE_ROLES = [
  'Admin',
  'Couple',
  'Finance Lead',
  'Workstream Lead',
  'Family Editor',
  'Viewer',
  'Day-of Operator',
] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const WORKSPACE_MEMBER_STATUSES = ['Invited', 'Active', 'Suspended', 'Removed'] as const;
export type WorkspaceMemberStatus = (typeof WORKSPACE_MEMBER_STATUSES)[number];

/** One user's membership in one workspace, with a single role (section 8). */
export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}
