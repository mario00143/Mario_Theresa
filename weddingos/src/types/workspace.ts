/** A top-level wedding workspace (Phase 7). One row per wedding a user is planning. */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  groomName: string;
  brideName: string;
  timezone: string;
  currency: string;
  engagementDate?: string;
  weddingDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type NewWorkspaceInput = Pick<Workspace, 'name' | 'groomName' | 'brideName' | 'timezone' | 'currency'> &
  Partial<Pick<Workspace, 'engagementDate' | 'weddingDate' | 'slug'>>;
