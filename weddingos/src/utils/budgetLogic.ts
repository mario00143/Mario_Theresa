import type { BudgetCategory, BudgetItem } from '@/types';

/**
 * Latest Forecast for a single item: prefer committedAmount, then
 * negotiatedAmount, then latestEstimate, then fall back to originalBudget.
 * This is the one calculation the spec pins down exactly (section 13) —
 * every category/overview total below is built by summing this per item.
 */
export function computeItemForecast(item: BudgetItem): number {
  return item.committedAmount ?? item.negotiatedAmount ?? item.latestEstimate ?? item.originalBudget;
}

export interface BudgetTotals {
  originalBudget: number;
  latestForecast: number;
  committed: number;
  actual: number;
  /** Latest Forecast - Original Budget. Positive = over budget, negative = under budget. */
  variance: number;
  variancePercent: number;
  /** Original Budget not yet locked into a committed amount. */
  uncommittedBudget: number;
}

export function computeBudgetTotals(items: BudgetItem[]): BudgetTotals {
  const originalBudget = items.reduce((sum, i) => sum + i.originalBudget, 0);
  const latestForecast = items.reduce((sum, i) => sum + computeItemForecast(i), 0);
  const committed = items.reduce((sum, i) => sum + (i.committedAmount ?? 0), 0);
  const actual = items.reduce((sum, i) => sum + (i.actualAmount ?? 0), 0);
  const variance = latestForecast - originalBudget;

  return {
    originalBudget,
    latestForecast,
    committed,
    actual,
    variance,
    variancePercent: originalBudget > 0 ? (variance / originalBudget) * 100 : 0,
    uncommittedBudget: originalBudget - committed,
  };
}

export interface CategoryBudgetSummary extends BudgetTotals {
  category: BudgetCategory;
  /** Forecast overrunning the category's plan, capped by its contingency buffer. */
  contingencyUsed: number;
  contingencyRemaining: number;
  /** Forecast exceeds plan by 10% or more (or whatever threshold is passed in). */
  isOverThreshold: boolean;
}

export function computeCategorySummary(
  category: BudgetCategory,
  items: BudgetItem[],
  varianceWarningPercent: number,
): CategoryBudgetSummary {
  const categoryItems = items.filter((i) => i.categoryId === category.id);
  const totals = computeBudgetTotals(categoryItems);
  const overPlan = Math.max(0, totals.latestForecast - category.plannedAmount);
  const contingencyUsed = Math.min(overPlan, category.contingencyAmount);
  const planVariancePercent = category.plannedAmount > 0 ? (overPlan / category.plannedAmount) * 100 : overPlan > 0 ? Infinity : 0;

  return {
    ...totals,
    category,
    contingencyUsed,
    contingencyRemaining: category.contingencyAmount - contingencyUsed,
    isOverThreshold: planVariancePercent >= varianceWarningPercent,
  };
}

export interface BudgetOverview extends BudgetTotals {
  categories: CategoryBudgetSummary[];
  contingencyRemaining: number;
  approvedCommitted: number;
  unapprovedCommitted: number;
}

export function computeBudgetOverview(categories: BudgetCategory[], items: BudgetItem[], varianceWarningPercent: number): BudgetOverview {
  const totals = computeBudgetTotals(items);
  const categorySummaries = categories.map((c) => computeCategorySummary(c, items, varianceWarningPercent));
  const approvedCommitted = items
    .filter((i) => i.approvalStatus === 'Approved')
    .reduce((sum, i) => sum + (i.committedAmount ?? 0), 0);
  const unapprovedCommitted = items
    .filter((i) => i.approvalStatus !== 'Approved')
    .reduce((sum, i) => sum + (i.committedAmount ?? 0), 0);

  return {
    ...totals,
    categories: categorySummaries,
    contingencyRemaining: categorySummaries.reduce((sum, c) => sum + c.contingencyRemaining, 0),
    approvedCommitted,
    unapprovedCommitted,
  };
}

/** Budget items whose category has no plan on file but which already carry a committed/actual amount. */
export function findUnbudgetedCommitments(categories: BudgetCategory[], items: BudgetItem[]): BudgetItem[] {
  const categoryIds = new Set(categories.filter((c) => c.plannedAmount > 0).map((c) => c.id));
  return items.filter((i) => !categoryIds.has(i.categoryId) && ((i.committedAmount ?? 0) > 0 || (i.actualAmount ?? 0) > 0));
}
