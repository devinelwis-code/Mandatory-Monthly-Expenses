import { Category, Expense, Reminder } from '../types';

// This satisfies App.tsx so it doesn't crash, but we don't actually need it anymore
export const TARGET_SPREADSHEET_ID = '1JXrLUxEdcABJsad2GEswL_zBbI1-r-QEuPPAeMsNvQY';

// Your live Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxjltVko-5Icd6dO2R6R6yJRju_C5e5Z75rkOkQgLnvfunwEXzp3To6_ja2gFu54N4/exec';

export class GoogleSheetsService {
  constructor(token?: string, spreadsheetId?: string) {}

  async initializeSheetsIfMissing(): Promise<void> {
    return Promise.resolve();
  }

  async readExpenses(): Promise<Expense[]> {
    try {
      const res = await fetch(`${WEB_APP_URL}?action=readExpenses`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any, index: number) => ({
        id: item.id || `exp-sheet-${index}`,
        date: item.date || new Date().toISOString().split('T')[0],
        categoryName: item.categoryName || 'Other',
        categoryEmoji: item.categoryEmoji || '💡',
        categoryId: `cat-${(item.categoryName || 'other').toLowerCase().replace(/\s+/g, '-')}`,
        title: item.title || 'Expense',
        amount: parseFloat(item.amount) || 0,
        isRecurring: item.isRecurring === 'Yes' || item.isRecurring === true,
        dueDate: item.dueDate || '',
        status: (item.status?.toLowerCase() === 'paid' ? 'paid' : 'pending') as 'paid' | 'pending',
        billProofName: item.billProofName || undefined,
        notes: item.notes || '',
        createdAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Error reading expenses:', e);
      return [];
    }
  }

  async readCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${WEB_APP_URL}?action=readCategories`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any, index: number) => ({
        id: item.id || `cat-${index}`,
        name: item.name || 'Category',
        emoji: item.emoji || '💡',
        budget: parseFloat(item.budget) || 100,
        color: item.color || '#3b82f6',
      }));
    } catch (e) {
      console.warn('Error reading categories:', e);
      return [];
    }
  }

  async readReminders(): Promise<Reminder[]> {
    try {
      const res = await fetch(`${WEB_APP_URL}?action=readReminders`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any, index: number) => ({
        id: item.id || `rem-${index}`,
        title: item.title || 'Reminder',
        categoryName: item.categoryName || 'Utility',
        categoryEmoji: item.categoryEmoji || '⚡',
        categoryId: `cat-${(item.categoryName || 'utility').toLowerCase().replace(/\s+/g, '-')}`,
        amount: parseFloat(item.amount) || 0,
        dueDay: parseInt(item.dueDay, 10) || 1,
        frequency: item.frequency || 'monthly',
        isPaidThisMonth: item.isPaidThisMonth === 'Yes' || item.isPaidThisMonth === true,
        notes: item.notes || '',
      }));
    } catch (e) {
      console.warn('Error reading reminders:', e);
      return [];
    }
  }

  async syncAll(expenses: Expense[], categories: Category[], reminders: Reminder[]): Promise<void> {
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'syncAll',
          expenses,
          categories,
          reminders
        })
      });
    } catch (e) {
      console.warn('Error syncing data:', e);
    }
  }
}
