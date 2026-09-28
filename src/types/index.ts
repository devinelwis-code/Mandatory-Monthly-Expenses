export type ExpenseStatus = 'paid' | 'pending';
export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly' | 'one-time';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  budget: number;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  isRecurring: boolean;
  status: ExpenseStatus;
  billProofUrl?: string; // Base64 or URL
  billProofName?: string;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  amount: number;
  dueDay: number; // 1 to 31
  frequency: RecurringFrequency;
  isPaidThisMonth: boolean;
  lastPaidDate?: string;
  notes?: string;
}

export interface MonthlyStats {
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  dailyAverage: number;
  projectedSpend: number;
  savingsRate: number;
  topCategoryName?: string;
  topCategoryAmount?: number;
}

export interface CategorySpendSummary {
  category: Category;
  totalSpent: number;
  budget: number;
  percentageOfTotal: number;
  budgetUtilization: number;
  count: number;
}
