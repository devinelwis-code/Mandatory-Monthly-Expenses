import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Expense } from '../types';

interface SuccessTickModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export const SuccessTickModal: React.FC<SuccessTickModalProps> = ({
  isOpen,
  expense,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/30 dark:border-emerald-500/40 p-6 text-center animate-success-pop relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Green Tick Icon */}
        <div className="my-2 flex justify-center">
          <div className="w-20 h-20 relative flex items-center justify-center">
            <svg
              className="w-20 h-20"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer circle */}
              <circle
                className="animate-checkmark-circle stroke-emerald-500"
                cx="26"
                cy="26"
                r="24"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Green check path */}
              <path
                className="animate-checkmark-check stroke-emerald-500"
                d="M14.5 27.5L22 35L37.5 18"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Title message */}
        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-3 tracking-tight">
          Your expense is added successfully
        </h3>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
          ✓ Recorded &amp; Saved
        </p>

        {/* Expense snippet if available */}
        {expense && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Expense:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                {expense.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {expense.categoryEmoji} {expense.categoryName}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
              <span className="text-slate-600 dark:text-slate-400">Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                Rs. {expense.amount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
