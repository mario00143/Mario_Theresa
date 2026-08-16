export const EVENTS = ['Engagement', 'Wedding', 'Both'] as const;
export type EventScope = (typeof EVENTS)[number];

export const TASK_STATUSES = [
  'Not Started',
  'In Progress',
  'Waiting',
  'Blocked',
  'Done',
  'Cancelled',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const WORKSTREAMS = [
  'Governance',
  'Church & Legal',
  'Guests',
  'Invitations',
  'Venue',
  'Catering',
  'Photography & Video',
  'Décor',
  'Travel',
  'Accommodation',
  'Transportation',
  'Attire',
  'Rings & Ceremony Items',
  'Kerala Christian Customs',
  'Vendors',
  'Budget',
  'Family Responsibilities',
  'Wedding Day',
  'Post Wedding',
] as const;
export type Workstream = (typeof WORKSTREAMS)[number];

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  owner?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  event: EventScope;
  workstream: Workstream;
  owner: string;
  approver?: string;
  status: TaskStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  dependencies: string[];
  blockedReason?: string;
  nextAction?: string;
  completionCriteria: string;
  completionNote?: string;
  completionEvidence?: string;
  tags: string[];
  notes?: string;
  subtasks: Subtask[];

  // Optional links into Phase 4 vendor/finance records — never mandatory.
  relatedVendorId?: string;
  relatedBudgetItemId?: string;
  relatedPaymentScheduleId?: string;
  relatedContractId?: string;

  createdAt: string;
  updatedAt: string;
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'dependencies' | 'tags'> &
  Partial<Pick<Task, 'subtasks' | 'dependencies' | 'tags'>>;
