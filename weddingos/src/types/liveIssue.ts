export const LIVE_ISSUE_CATEGORIES = [
  'Guest',
  'Transport',
  'Hotel',
  'Church',
  'Ceremony',
  'Vendor',
  'Catering',
  'Décor',
  'Photography',
  'AV / Music',
  'Attire',
  'Medical',
  'Security',
  'Payment',
  'Weather',
  'Traffic',
  'Lost Item',
  'Other',
] as const;
export type LiveIssueCategory = (typeof LIVE_ISSUE_CATEGORIES)[number];

export const LIVE_ISSUE_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type LiveIssueSeverity = (typeof LIVE_ISSUE_SEVERITIES)[number];

export const LIVE_ISSUE_STATUSES = ['Open', 'Investigating', 'Mitigating', 'Resolved', 'Closed'] as const;
export type LiveIssueStatus = (typeof LIVE_ISSUE_STATUSES)[number];

/** Statuses that count as "still needing attention" for open-duration timers and Command Center alerts. */
export const LIVE_ISSUE_OPEN_STATUSES: LiveIssueStatus[] = ['Open', 'Investigating', 'Mitigating'];

export interface LiveIssue {
  id: string;
  title: string;
  description?: string;
  category: LiveIssueCategory;
  severity: LiveIssueSeverity;
  status: LiveIssueStatus;
  reportedAt: string;
  reportedBy?: string;
  owner?: string;
  backupOwner?: string;
  location?: string;
  relatedRunSheetItemId?: string;
  relatedVendorId?: string;
  relatedGuestId?: string;
  relatedTransportRouteId?: string;
  mitigation?: string;
  resolution?: string;
  resolvedAt?: string;
  followUpRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
