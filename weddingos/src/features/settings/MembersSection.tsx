import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { WorkspaceRole } from '@/types';
import { WORKSPACE_ROLES } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermission } from '@/hooks/usePermission';
import {
  buildInviteLink,
  createInvite,
  listInvites,
  listMembers,
  removeMember,
  revokeInvite,
  updateMemberRole,
  updateMemberStatus,
  type MemberWithProfile,
} from '@/data/supabase/membershipRepository';
import { logAuditAction } from '@/data/supabase/auditLogRepository';
import type { WorkspaceInvite } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, FieldError, Input, Label, Select } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function MembersSection() {
  const { profile } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { canAssignRole, isAdminOrCouple } = usePermission();
  const canManage = isAdminOrCouple();

  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('Viewer');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberWithProfile | null>(null);

  const load = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setError(null);
    try {
      const [m, i] = await Promise.all([listMembers(currentWorkspace.id), canManage ? listInvites(currentWorkspace.id) : Promise.resolve([])]);
      setMembers(m);
      setInvites(i.filter((invite) => invite.status === 'Active'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, canManage]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!currentWorkspace) return null;

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!currentWorkspace || !profile) return;
    setError(null);
    try {
      const token = await createInvite(currentWorkspace.id, inviteEmail, inviteRole, profile.id);
      setInviteLink(buildInviteLink(token));
      setInviteEmail('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite.');
    }
  }

  async function handleRoleChange(member: MemberWithProfile, role: WorkspaceRole) {
    try {
      await updateMemberRole(member.id, role);
      logAuditAction({
        action: 'member.role_change',
        entityType: 'WorkspaceMember',
        entityId: member.id,
        summary: `Changed ${member.profile?.displayName ?? member.userId}'s role from ${member.role} to ${role}`,
        metadata: { fromRole: member.role, toRole: role },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role.');
    }
  }

  async function handleSuspend(member: MemberWithProfile) {
    const nextStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
    await updateMemberStatus(member.id, nextStatus);
    logAuditAction({
      action: 'member.status_change',
      entityType: 'WorkspaceMember',
      entityId: member.id,
      summary: `Set ${member.profile?.displayName ?? member.userId}'s status to ${nextStatus}`,
    });
    await load();
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    await removeMember(removeTarget.id);
    logAuditAction({
      action: 'member.remove',
      entityType: 'WorkspaceMember',
      entityId: removeTarget.id,
      summary: `Removed ${removeTarget.profile?.displayName ?? removeTarget.userId} from the workspace`,
    });
    setRemoveTarget(null);
    await load();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="space-y-3 p-4">
        <h2 className="text-ink text-sm font-semibold">Members ({members.length})</h2>
        {loading ? (
          <p className="text-ink-faint text-sm">Loading…</p>
        ) : (
          <div className="divide-line-soft divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-medium">{member.profile?.displayName ?? member.userId}</p>
                  <p className="text-ink-faint truncate text-xs">{member.profile?.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {member.status !== 'Active' && <Badge tone="warning">{member.status}</Badge>}
                  {canManage ? (
                    <Select
                      aria-label={`Role for ${member.profile?.displayName ?? member.userId}`}
                      value={member.role}
                      disabled={!canAssignRole(member.role)}
                      onChange={(e) => void handleRoleChange(member, e.target.value as WorkspaceRole)}
                      className="w-40"
                    >
                      {WORKSPACE_ROLES.map((role) => (
                        <option key={role} value={role} disabled={!canAssignRole(role)}>
                          {role}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge>{member.role}</Badge>
                  )}
                  {canManage && member.userId !== profile?.id && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => void handleSuspend(member)}>
                        {member.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setRemoveTarget(member)}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {canManage && (
        <Card className="space-y-3 p-4">
          <h2 className="text-ink text-sm font-semibold">Invite a member</h2>
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
            <Field className="min-w-48 flex-1">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input id="inviteEmail" type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </Field>
            <Field className="w-44">
              <Label htmlFor="inviteRole">Role</Label>
              <Select id="inviteRole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}>
                {WORKSPACE_ROLES.filter((role) => canAssignRole(role)).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" variant="primary">
              Create invite link
            </Button>
          </form>
          <FieldError>{error}</FieldError>
          {inviteLink && (
            <div className="border-line-soft bg-surface-subtle rounded-lg border p-2.5">
              <p className="text-ink-faint mb-1 text-xs">
                Share this link (via WhatsApp, email, etc.) — it works once and expires in 7 days:
              </p>
              <code className="text-ink block truncate text-xs">{inviteLink}</code>
            </div>
          )}
          {invites.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-ink-faint text-xs font-medium">Pending invites</p>
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {invite.email} <span className="text-ink-faint">· {invite.role}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void revokeInvite(invite.id).then(() => {
                        void load();
                      })
                    }
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove member"
        message={`Remove ${removeTarget?.profile?.displayName ?? 'this member'} from the workspace? They will immediately lose access.`}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
