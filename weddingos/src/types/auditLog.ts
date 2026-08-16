/**
 * Audit actions are free-form-but-conventionalized strings of the form
 * "<entity>.<verb>" (e.g. "payment.create", "member.role_change") rather
 * than a closed enum — new call sites can log a new action without a type
 * change, and the Audit Log UI groups/filters on the string as-is.
 */
export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  /** Small, non-secret context only (e.g. { fromRole: 'Viewer', toRole: 'Admin' }). Never store secrets/credentials here. */
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}
