import React from 'react';
import {
  X,
  FileDown,
  Table,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { Category, Expense, Reminder, MonthlyStats } from '../types';
import { generateMonthlyPDFReport } from '../services/pdfReport';
import { exportExpensesToCSV } from '../utils/exportUtils';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  categories: Category[];
  reminders: Reminder[];
  stats: MonthlyStats;
  selectedMonth: string; // YYYY-MM
  userEmail?: string;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  categories,
  reminders,
  stats,
  selectedMonth,
  userEmail,
}) => {
  if (!isOpen) return null;

  const [yearStr, monthNumStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const dateObj = new Date(year, parseInt(monthNumStr, 10) - 1, 1);
  const monthName = dateObj.toLocaleString('default', { month: 'long' });

  // Filter current month expenses
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // Category breakdown calculation
  const categorySpending = categories.map((cat) => {
    const spent = currentMonthExpenses
      .filter((e) => e.categoryId === cat.id || e.categoryName === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = stats.totalSpent > 0 ? (spent / stats.totalSpent) * 100 : 0;
    const utilization = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
    return {
      ...cat,
      spent,
      percentage,
      utilization,
    };
  });

  const handleDownloadPDF = () => {
    generateMonthlyPDFReport({
      monthName,
      year,
      expenses: currentMonthExpenses,
      categories,
      reminders,
      stats,
      currencySymbol: 'Rs. ',
      userEmail,
    });
  };

  const handleExportCSV = () => {
    exportExpensesToCSV(
      currentMonthExpenses,
      `Mandatory_Monthly_Expenses_${monthName}_${year}.csv`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Mandatory Monthly Expenses Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Billing Cycle: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{monthName} {year}</span> • Comprehensive Financial Audit in Rs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Download PDF Report
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Preview */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Total Expenses
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Rs. {stats.totalSpent.toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentMonthExpenses.length} transactions logged
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Target Budget
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Rs. {stats.totalBudget.toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.totalBudget > 0 ? `${((stats.totalSpent / stats.totalBudget) * 100).toFixed(0)}% utilized` : 'No budget set'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              stats.remainingBudget >= 0
                ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200/60 dark:border-teal-800/40'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-800/40'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {stats.remainingBudget >= 0 ? 'Surplus / Savings' : 'Budget Deficit'}
              </span>
              <p className={`text-xl sm:text-2xl font-black mt-1 ${
                stats.remainingBudget >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                Rs. {Math.abs(stats.remainingBudget).toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.remainingBudget >= 0 ? 'Within monthly budget limit' : 'Action recommended!'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                Bill Completion
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats.paidCount} / {stats.paidCount + stats.pendingCount}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {stats.overdueCount > 0 ? `${stats.overdueCount} overdue bill(s)` : 'All deadlines on track'}
              </span>
            </div>
          </div>

          {/* Category Budget Breakdown Table */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              Category Breakdown &amp; Budget Performance
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5">Monthly Budget</th>
                    <th className="pb-2.5">Actual Spent</th>
                    <th className="pb-2.5">Budget Usage</th>
                    <th className="pb-2.5">Share of Spend</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {categorySpending.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <span className="text-base">{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        Rs. {cat.budget.toFixed(2)}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        Rs. {cat.spent.toFixed(2)}
                      </td>
                      <td className="py-2.5">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>{cat.utilization.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cat.utilization > 100
                                  ? 'bg-rose-500'
                                  : cat.utilization > 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(cat.utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 font-medium">
                        {cat.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {cat.budget > 0 && cat.spent > cat.budget ? (
                          <span className="text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                            Over Budget
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Log */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Itemized Records ({currentMonthExpenses.length})
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Proof</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentMonthExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No transactions recorded for this month yet.
                      </td>
                    </tr>
                  ) : (
                    currentMonthExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{exp.date}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {exp.title}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <span>{exp.categoryEmoji}</span>
                            <span>{exp.categoryName}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          {exp.billProofName || exp.billProofUrl ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              📎 Attached
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              exp.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-white">
                          Rs. {exp.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Mandatory Monthly Expenses • Real-time Cloud Sync
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
