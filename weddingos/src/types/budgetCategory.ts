export interface BudgetCategory {
  id: string;
  name: string;
  plannedAmount: number;
  contingencyAmount: number;
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
