import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { Reminder } from '../types';

interface RemindersSectionProps {
  reminders: Reminder[];
  onOpenAddModal: () => void;
  onMarkPaid: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  onOpenAddModal,
  onMarkPaid,
  onDeleteReminder,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');

  const today = new Date();
  const currentDay = today.getDate();

  // Sort reminders: overdue first, then soonest due date, then paid
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isPaidThisMonth !== b.isPaidThisMonth) {
      return a.isPaidThisMonth ? 1 : -1;
    }
    return a.dueDay - b.dueDay;
  });

  const filteredReminders = sortedReminders.filter((r) => {
    if (filter === 'pending') return !r.isPaidThisMonth;
    if (filter === 'paid') return r.isPaidThisMonth;
    return true;
  });

  const pendingCount = reminders.filter((r) => !r.isPaidThisMonth).length;
  const overdueCount = reminders.filter(
    (r) => !r.isPaidThisMonth && r.dueDay < currentDay
  ).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Payment Dates &amp; Mandatory Deadlines
              </h3>
              {overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {overdueCount} OVERDUE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Never miss power, mobile, water, internet, or gas payment dates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick filter pills */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({reminders.length})
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </button>
        </div>
      </div>

      {/* Reminders List / Grid */}
      {filteredReminders.length === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {filter === 'pending'
              ? 'No pending bill reminders for this cycle.'
              : 'No payment reminders configured yet.'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add recurring deadlines for your monthly electricity, water, internet, or rent bills.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredReminders.map((rem) => {
            const isOverdue = !rem.isPaidThisMonth && rem.dueDay < currentDay;
            const isDueToday = !rem.isPaidThisMonth && rem.dueDay === currentDay;
            const daysRemaining = rem.dueDay - currentDay;

            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  rem.isPaidThisMonth
                    ? 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-200/70 dark:border-slate-800 opacity-80'
                    : isOverdue
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs'
                    : isDueToday
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        {rem.categoryEmoji}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
                          {rem.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {rem.categoryName} • {rem.frequency}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteReminder(rem.id)}
                      className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Deadline & Status Badge */}
                  <div className="flex items-center justify-between my-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">
                        Due: {rem.dueDay}th of month
                      </span>
                    </div>

                    {rem.isPaidThisMonth ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Paid
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        {currentDay - rem.dueDay}d Overdue
                      </span>
                    ) : isDueToday ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full animate-pulse">
                        <Clock className="w-3 h-3" />
                        Due Today!
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Due in {daysRemaining} days
                      </span>
                    )}
                  </div>

                  {rem.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1 mb-2 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md">
                      {rem.notes}
                    </p>
                  )}
                </div>

                {/* Amount & Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Amount
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      Rs. {rem.amount.toFixed(2)}
                    </span>
                  </div>

                  {!rem.isPaidThisMonth ? (
                    <button
                      type="button"
                      onClick={() => onMarkPaid(rem)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Paid
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Settled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
