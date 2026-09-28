import React from 'react';
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from 'lucide-react';
import { MonthlyStats } from '../types';

interface DashboardStatsProps {
  stats: MonthlyStats;
  selectedMonthName: string;
  onOpenReportModal: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  selectedMonthName,
  onOpenReportModal,
}) => {
  const budgetUtilization =
    stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0;
  const isOverBudget = stats.remainingBudget < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Spent */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Spent ({selectedMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Rs. {stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {stats.paidCount}
              </span>{' '}
              bills paid
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Rs. {stats.dailyAverage.toFixed(2)}/day avg
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Budget & Utilization */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Target Budget
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Rs. {stats.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                budgetUtilization > 100
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {budgetUtilization.toFixed(0)}% used
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUtilization > 100
                  ? 'bg-rose-500'
                  : budgetUtilization > 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>
              {isOverBudget
                ? `Exceeded by Rs. ${Math.abs(stats.remainingBudget).toFixed(0)}`
                : `Rs. ${stats.remainingBudget.toFixed(0)} remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Net Savings / Remaining Funds */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isOverBudget ? 'Budget Overrun' : 'Remaining Savings'}
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isOverBudget
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                : 'bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400'
            }`}
          >
            {isOverBudget ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownRight className="w-5 h-5" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-teal-600 dark:text-teal-400'
              }`}
            >
              Rs. {Math.abs(stats.remainingBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Projected month-end:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Rs. {stats.projectedSpend.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Pending / Overdue Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bill Reminders &amp; Audit
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              stats.overdueCount > 0
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400'
            }`}
          >
            {stats.overdueCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.pendingCount}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              pending bills
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {stats.overdueCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ {stats.overdueCount} bill(s) overdue!
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ No overdue payments
              </span>
            )}

            <button
              type="button"
              onClick={onOpenReportModal}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs cursor-pointer"
            >
              View Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
