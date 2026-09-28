import { Expense, Category, Reminder } from '../types';

export function exportExpensesToCSV(expenses: Expense[], filename = 'SpendSheet_Expenses.csv'): void {
  const headers = [
    'ID',
    'Date',
    'Category',
    'Category Emoji',
    'Title/Description',
    'Amount',
    'Status',
    'Due Date',
    'Recurring',
    'Bill Proof Name',
    'Notes',
  ];

  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.date}"`,
    `"${e.categoryName.replace(/"/g, '""')}"`,
    `"${e.categoryEmoji}"`,
    `"${e.title.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    `"${e.status}"`,
    `"${e.dueDate || ''}"`,
    `"${e.isRecurring ? 'Yes' : 'No'}"`,
    `"${(e.billProofName || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFullFinancialJSON(
  expenses: Expense[],
  categories: Category[],
  reminders: Reminder[]
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    spreadsheetId: '1JXrLUxEdcABJsad2GEswL_zBbI1-r-QEuPPAeMsNvQY',
    categories,
    reminders,
    expenses,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SpendSheet_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
