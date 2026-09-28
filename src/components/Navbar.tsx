import React from 'react';
import {
  Sun,
  Moon,
  FileSpreadsheet,
  ExternalLink,
  FileDown,
  LogOut,
  CalendarClock,
  Plus,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { TARGET_SPREADSHEET_ID } from '../services/googleSheets';

interface NavbarProps {
  user: User | null;
  isSyncing: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenNewExpense: () => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isSyncing,
  darkMode,
  onToggleDarkMode,
  onSignIn,
  onSignOut,
  onOpenNewExpense,
  onOpenReportModal,
}) => {
  const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${TARGET_SPREADSHEET_ID}/edit`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Logo & Title: Mandatory Monthly Expenses */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <CalendarClock className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Mandatory Monthly Expenses
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Household Budget &amp; Bill Deadlines • Rs. Currency
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Open Google Sheet Button */}
          <a
            href={googleSheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs"
            title="Directly open connected Google Sheet in a new tab"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Open Google Sheet</span>
            <ExternalLink className="w-3 h-3 text-emerald-500" />
          </a>

          {/* Dark / Light Mode Switch Button (Verified Working) */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="hidden md:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span className="hidden md:inline">Dark Mode</span>
              </>
            )}
          </button>

          {/* Monthly Report PDF Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-500" />
            <span>Monthly PDF</span>
          </button>

          {/* Google Sign-in / User Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  className="w-8 h-8 rounded-full border border-emerald-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.displayName || 'Google User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <div className="gsi-material-button-icon shrink-0">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
              <span className="whitespace-nowrap">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
