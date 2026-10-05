import { Category, Expense, Reminder } from '../types';

export const TARGET_SPREADSHEET_ID = '1JXrLUxEdcABJsad2GEswL_zBbI1-r-QEuPPAeMsNvQY';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxjltVko-5Icd6dO2R6R6yJRju_C5e5Z75rkOkQgLnvfunwEXzp3To6_ja2gFu54N4/exec';

export class GoogleSheetsService {
  constructor(token?: string, spreadsheetId?: string) {}

  async initializeSheetsIfMissing(): Promise<void> {
    return Promise.resolve();
  }

  async readExpenses(): Promise<Expense[]> {
    return []; 
  }

  async readCategories(): Promise<Category[]> {
    return [];
  }

  async readReminders(): Promise<Reminder[]> {
    return [];
  }

  async syncAll(expenses: Expense[], categories: Category[], reminders: Reminder[]): Promise<void> {
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // THIS FIXES THE BROWSER BLOCK
        headers: {
          'Content-Type': 'text/plain',
        },
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
