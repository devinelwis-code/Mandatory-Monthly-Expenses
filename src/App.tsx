/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from './services/firebaseAuth';
import { GoogleSheetsService, TARGET_SPREADSHEET_ID } from './services/googleSheets';
import { DEFAULT_CATEGORIES, INITIAL_EXPENSES, INITIAL_REMINDERS } from './data/defaultData';
import { Category, Expense, Reminder, MonthlyStats, ExpenseStatus } from './types';
import { Navbar } from './components/Navbar';
import { SpendingCharts } from './components/SpendingCharts';
import { RemindersSection } from './components/RemindersSection';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ReminderModal } from './components/ReminderModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SuccessTickModal } from './components/SuccessTickModal';
import {
  FileSpreadsheet,
  Plus,
  Layers,
  FileDown,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { exportFullFinancialJSON } from './utils/exportUtils';

export default function App() {
  // Theme state: dark mode toggle that actually works
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mme_dark_mode');
    if (saved !== null) return saved === 'true';
    return false;
  });

  // Billing cycle month state
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Core Data State - Clean start without old mock data
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mme_categories_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('mme_expenses_v2');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('mme_reminders_v2');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // Google Authentication & Real-time Sheets Sync state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewingProofExpense, setViewingProofExpense] = useState<Expense | null>(null);

  // Success popup message with animated green tick
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({
    isOpen: false,
    expense: null,
  });

  // Destructive Confirmation Modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Apply dark mode immediately to document root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mme_dark_mode', darkMode.toString());
  }, [darkMode]);

  // Persist locally for offline & fast response
  useEffect(() => {
    localStorage.setItem('mme_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mme_expenses_v2', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mme_reminders_v2', JSON.stringify(reminders));
  }, [reminders]);

  // Google Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        if (accessToken) {
          setToken(accessToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Google Sheets Cloud Sync Trigger
  const syncToGoogleSheets = useCallback(
    async (
      currentExpenses = expenses,
      currentCategories = categories,
      currentReminders = reminders
    ) => {
      const activeToken = token || (await getAccessToken());
      if (!activeToken) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        const sheetsService = new GoogleSheetsService(activeToken, TARGET_SPREADSHEET_ID);
        await sheetsService.syncAll(currentExpenses, currentCategories, currentReminders);
        setLastSyncedAt(new Date());
      } catch (err: any) {
        console.error('Failed to sync to Google Sheets:', err);
        setSyncError(err.message || 'Sheet sync issue');
      } finally {
        setIsSyncing(false);
      }
    },
    [token, expenses, categories, reminders]
  );

  // Sync automatically when token changes
  useEffect(() => {
    if (token) {
      syncToGoogleSheets();
    }
  }, [token]);

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res?.accessToken) {
        setToken(res.accessToken);
        setUser(res.user);
        const service = new GoogleSheetsService(res.accessToken, TARGET_SPREADSHEET_ID);
        try {
          const sheetExpenses = await service.readExpenses();
          if (sheetExpenses && sheetExpenses.length > 0) {
            setExpenses(sheetExpenses);
          } else {
            await service.syncAll(expenses, categories, reminders);
          }
          setLastSyncedAt(new Date());
        } catch (e: any) {
          console.warn('Initial sheet pull warning:', e.message);
          await service.syncAll(expenses, categories, reminders);
          setLastSyncedAt(new Date());
        }
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setSyncError(err.message || 'Sign in error');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setAccessToken(null);
  };

  // Compute Statistics for selected month
  const monthlyStats = useMemo<MonthlyStats>(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
    const remainingBudget = totalBudget - totalSpent;

    const paidCount = monthExpenses.filter((e) => e.status === 'paid').length;
    const pendingCount = monthExpenses.filter((e) => e.status === 'pending').length;

    const today = new Date();
    const currentDay = today.getDate();
    const overdueCount = reminders.filter(
      (r) => !r.isPaidThisMonth && r.dueDay < currentDay
    ).length;

    const elapsedDays = Math.max(1, Math.min(currentDay, 30));
    const dailyAverage = totalSpent / elapsedDays;
    const projectedSpend = dailyAverage * 30;
    const savingsRate = totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0;

    const catMap = new Map<string, number>();
    monthExpenses.forEach((e) => {
      catMap.set(e.categoryName, (catMap.get(e.categoryName) || 0) + e.amount);
    });
    let topName = '';
    let topAmt = 0;
    catMap.forEach((amt, name) => {
      if (amt > topAmt) {
        topAmt = amt;
        topName = name;
      }
    });

    return {
      totalSpent,
      totalBudget,
      remainingBudget,
      paidCount,
      pendingCount,
      overdueCount,
      dailyAverage,
      projectedSpend,
      savingsRate,
      topCategoryName: topName,
      topCategoryAmount: topAmt,
    };
  }, [expenses, categories, reminders, selectedMonth]);

  const selectedMonthName = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // Add / Edit Expense handler + triggers Animated Green Tick Popup
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let savedRecord: Expense;
    let updatedExpenses: Expense[];

    if (existingId) {
      savedRecord = {
        ...expenseData,
        id: existingId,
        createdAt: expenses.find((e) => e.id === existingId)?.createdAt || new Date().toISOString(),
      };
      updatedExpenses = expenses.map((e) => (e.id === existingId ? savedRecord : e));
    } else {
      savedRecord = {
        ...expenseData,
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updatedExpenses = [savedRecord, ...expenses];
    }

    setExpenses(updatedExpenses);
    syncToGoogleSheets(updatedExpenses, categories, reminders);

    // Show "your expense is added successfully" popup with animated green tick
    setSuccessModalData({
      isOpen: true,
      expense: savedRecord,
    });
  };

  // Toggle Expense Status (Paid <-> Pending)
  const handleToggleStatus = (expense: Expense) => {
    const newStatus: ExpenseStatus = expense.status === 'paid' ? 'pending' : 'paid';
    const updated: Expense[] = expenses.map((e) =>
      e.id === expense.id ? { ...e, status: newStatus } : e
    );
    setExpenses(updated);
    syncToGoogleSheets(updated, categories, reminders);
  };

  // Delete Expense with destructive confirmation
  const handleDeleteExpense = (expense: Expense) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Expense Record?',
      message: `Are you sure you want to delete "${expense.title}" (Rs. ${expense.amount.toFixed(
        2
      )})? This will remove the record from both your dashboard and the connected Google Sheet.`,
      onConfirm: () => {
        const updated = expenses.filter((e) => e.id !== expense.id);
        setExpenses(updated);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        syncToGoogleSheets(updated, categories, reminders);
      },
    });
  };

  // Add Category
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    const updated = [...categories, created];
    setCategories(updated);
    syncToGoogleSheets(expenses, updated, reminders);
  };

  // Delete Category with confirmation
  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Budget Category?',
      message: `Are you sure you want to delete category "${cat?.emoji} ${cat?.name}"?`,
      onConfirm: () => {
        const updated = categories.filter((c) => c.id !== id);
        setCategories(updated);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        syncToGoogleSheets(expenses, updated, reminders);
      },
    });
  };

  // Add Reminder
  const handleAddReminder = (reminderData: Omit<Reminder, 'id' | 'isPaidThisMonth'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
      isPaidThisMonth: false,
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    syncToGoogleSheets(expenses, categories, updated);
  };

  // Delete Reminder with confirmation
  const handleDeleteReminder = (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Payment Reminder?',
      message: `Are you sure you want to delete reminder "${rem?.title}"?`,
      onConfirm: () => {
        const updated = reminders.filter((r) => r.id !== id);
        setReminders(updated);
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        syncToGoogleSheets(expenses, categories, updated);
      },
    });
  };

  // Mark Reminder Paid & automatically log expense
  const handleMarkReminderPaid = (reminder: Reminder) => {
    const updatedReminders = reminders.map((r) =>
      r.id === reminder.id
        ? {
            ...r,
            isPaidThisMonth: true,
            lastPaidDate: new Date().toISOString().split('T')[0],
          }
        : r
    );
    setReminders(updatedReminders);

    const newExp: Expense = {
      id: `exp-rem-${Date.now()}`,
      title: reminder.title,
      amount: reminder.amount,
      categoryId: reminder.categoryId,
      categoryName: reminder.categoryName,
      categoryEmoji: reminder.categoryEmoji,
      date: new Date().toISOString().split('T')[0],
      isRecurring: true,
      status: 'paid',
      notes: `Recurring mandatory bill settled for ${selectedMonthName}`,
      createdAt: new Date().toISOString(),
    };
    const updatedExpenses = [newExp, ...expenses];
    setExpenses(updatedExpenses);

    // Show animated green tick popup
    setSuccessModalData({
      isOpen: true,
      expense: newExp,
    });

    syncToGoogleSheets(updatedExpenses, categories, updatedReminders);
  };

  // Function to reset all data clean if needed
  const handleResetClean = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Clear All Local Expenses?',
      message: 'This will reset all recorded entries to an empty state.',
      onConfirm: () => {
        setExpenses([]);
        setReminders([]);
        localStorage.removeItem('mme_expenses_v2');
        localStorage.removeItem('mme_reminders_v2');
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        syncToGoogleSheets([], categories, []);
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-['Plus_Jakarta_Sans','Noto_Sans_Sinhala',sans-serif]">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        isSyncing={isSyncing}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenNewExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Container: Balanced Screen View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Banner: Balanced without the removed badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Mandatory Monthly Expenses
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
              {selectedMonthName}
            </span>
          </div>

          {/* Action Buttons: Large Record Button + Direct Google Sheet + Overview Toggle + Categories + PDF */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* LARGE RECORD NEW EXPENSE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Record New Expense</span>
            </button>

            {/* Direct Open Google Sheet Button */}
            <a
              href={`https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-3 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 transition-colors shadow-2xs cursor-pointer"
              title="Open Google Sheet in new tab"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Open Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            </a>

            {/* Manage Categories */}
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors shadow-2xs cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Categories</span>
            </button>

            {/* Monthly PDF Report */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors shadow-2xs cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-emerald-500" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Balanced Screen View: Side-by-Side Charts & Reminders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Spending Trends & Habit Analytics (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SpendingCharts
              expenses={expenses}
              categories={categories}
              selectedMonth={selectedMonth}
              stats={monthlyStats}
            />
          </div>

          {/* Right Column: Recurring Payment Deadlines & Reminders (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <RemindersSection
              reminders={reminders}
              onOpenAddModal={() => setIsReminderModalOpen(true)}
              onMarkPaid={handleMarkReminderPaid}
              onDeleteReminder={handleDeleteReminder}
            />
          </div>
        </div>

        {/* Full-width Transaction Ledger & Receipts Table */}
        <div className="pt-2">
          <ExpenseList
            expenses={expenses}
            categories={categories}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenAddModal={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onToggleStatus={handleToggleStatus}
            onViewProof={(exp) => setViewingProofExpense(exp)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Mandatory Monthly Expenses</span>
            <span>•</span>
            <span>Household Utilities &amp; Reminders in Rs.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition-colors font-semibold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Open Google Sheet ↗
            </a>
            <button
              onClick={() => exportFullFinancialJSON(expenses, categories, reminders)}
              className="hover:text-emerald-500 transition-colors font-medium cursor-pointer"
            >
              Export JSON Backup
            </button>
            <button
              onClick={handleResetClean}
              className="hover:text-rose-500 transition-colors font-medium flex items-center gap-1 cursor-pointer"
              title="Clear stored entries"
            >
              <RotateCcw className="w-3 h-3" />
              Clear All
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        categories={categories}
        initialData={editingExpense}
        onOpenCategoryManager={() => {
          setIsExpenseModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleAddReminder}
        categories={categories}
      />

      {/* Popup Window for Attachment Proof on Home Screen */}
      <ReceiptViewerModal
        expense={viewingProofExpense}
        isOpen={!!viewingProofExpense}
        onClose={() => setViewingProofExpense(null)}
      />

      <MonthlyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        expenses={expenses}
        categories={categories}
        reminders={reminders}
        stats={monthlyStats}
        selectedMonth={selectedMonth}
        userEmail={user?.email || 'devinelwis@gmail.com'}
      />

      {/* Success Popup with Animated Green Tick */}
      <SuccessTickModal
        isOpen={successModalData.isOpen}
        expense={successModalData.expense}
        onClose={() => setSuccessModalData({ isOpen: false, expense: null })}
      />

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
