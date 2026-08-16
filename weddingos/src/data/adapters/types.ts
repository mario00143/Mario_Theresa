/**
 * The repository interface every Phase-7-native entity (Workspace,
 * UserProfile, WorkspaceMember, WorkspaceInvite, DocumentRecord, AuditLog,
 * DataMigration) is written against. Two implementations exist —
 * localAdapter.ts (localStorage, used in Demo/Local Mode) and
 * supabaseAdapter.ts (Supabase Postgres, used in Production Mode) — and
 * callers never import either directly; see data/repositoryFactory.ts.
 *
 * Pre-existing v1-v6 entities (Task, Guest, Vendor, ...) reach Supabase a
 * different way: their stores are wrapped with lib/supabaseSync.ts instead
 * of being rewritten onto this interface, so their 46 existing repository
 * files and hooks never had to change (section 21: "avoid rewriting all UI
 * modules").
 */
export interface RepositoryAdapter<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(record: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}
