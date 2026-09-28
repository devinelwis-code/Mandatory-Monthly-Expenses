import React, { useState } from 'react';
import {
  Search,
  Paperclip,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpDown,
  Tag,
  Plus,
  Eye,
} from 'lucide-react';
import { Category, Expense, ExpenseStatus } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onToggleStatus: (expense: Expense) => void;
  onViewProof: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  selectedMonth,
  onSelectMonth,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onToggleStatus,
  onViewProof,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter expenses
  const filtered = expenses.filter((e) => {
    // Month filter
    if (selectedMonth && !e.date.startsWith(selectedMonth)) return false;

    // Category filter
    if (selectedCategoryId !== 'all' && e.categoryId !== selectedCategoryId) return false;

    // Status filter
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCat = e.categoryName.toLowerCase().includes(q);
      const matchNotes = e.notes ? e.notes.toLowerCase().includes(q) : false;
      const matchAmount = e.amount.toString().includes(q);
      if (!matchTitle && !matchCat && !matchNotes && !matchAmount) return false;
    }

    return true;
  });

  // Sort expenses
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const cmp = a.date.localeCompare(b.date);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sortField === 'title') {
      const cmp = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    return 0;
  });

  const availableMonths = [
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-10', label: 'October 2026' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            Monthly Transactions &amp; Receipts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {sorted.length} item(s) logged • Filtered by category, status, and proof attachment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search / සොයන්න..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Add Expense Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Category Pills & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category horizontal scrolling bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedCategoryId === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Main Expense Table / Mobile Cards */}
      {sorted.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          <Tag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No expenses found for this month
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click below to record your electricity, phone, water, fuel or other bills.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            + Record New Expense
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (screens < md) */}
          <div className="block md:hidden space-y-3">
            {sorted.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-xl flex items-center justify-center shrink-0 shadow-2xs border border-slate-200 dark:border-slate-700">
                      {exp.categoryEmoji}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exp.categoryName} • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      Rs. {exp.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {exp.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {exp.notes}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Status Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(exp)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-transform active:scale-95 cursor-pointer ${
                        exp.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {exp.status === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </button>

                    {/* View Bill Attachment Popup Button */}
                    {(exp.billProofName || exp.billProofUrl) && (
                      <button
                        type="button"
                        onClick={() => onViewProof(exp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 transition-colors shadow-2xs cursor-pointer"
                        title="View attached bill proof in popup window"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>View Bill</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (screens >= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => {
                      if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('date');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Proof Attachment</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => {
                      if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('amount');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sorted.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {exp.date}
                    </td>

                    {/* Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-lg flex items-center justify-center shrink-0">
                          {exp.categoryEmoji}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {exp.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{exp.categoryName}</span>
                            {exp.notes && (
                              <>
                                <span>•</span>
                                <span className="italic max-w-[200px] truncate">{exp.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {exp.isRecurring ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                          🔄 Recurring
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">One-time</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(exp)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase transition-transform active:scale-95 cursor-pointer ${
                          exp.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {exp.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </button>
                    </td>

                    {/* Proof Attachment with popup window trigger */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {exp.billProofName || exp.billProofUrl ? (
                        <button
                          type="button"
                          onClick={() => onViewProof(exp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/80 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                          title="View attached bill proof in popup window"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>View Bill</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">
                          —
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        Rs. {exp.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
