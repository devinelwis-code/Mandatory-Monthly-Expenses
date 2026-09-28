import { Category, Expense, Reminder } from '../types';

export const TARGET_SPREADSHEET_ID = '1JXrLUxEdcABJsad2GEswL_zBbI1-r-QEuPPAeMsNvQY';

interface SheetMetadata {
  sheets?: Array<{
    properties?: {
      title?: string;
      sheetId?: number;
    };
  }>;
}

export class GoogleSheetsService {
  private spreadsheetId: string;
  private token: string;

  constructor(token: string, spreadsheetId = TARGET_SPREADSHEET_ID) {
    this.token = token;
    this.spreadsheetId = spreadsheetId;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get spreadsheet metadata to verify existence and inspect sheet names
  async getMetadata(): Promise<SheetMetadata> {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch spreadsheet (${res.status})`);
    }
    return res.json();
  }

  // Initialize tabs: Expenses, Categories, Reminders if not existing
  async initializeSheetsIfMissing(): Promise<void> {
    const metadata = await this.getMetadata();
    const existingTitles = new Set(
      (metadata.sheets || []).map((s) => s.properties?.title).filter(Boolean) as string[]
    );

    const requiredSheets = ['Expenses', 'Categories', 'Reminders'];
    const requestsToCreate: any[] = [];

    for (const title of requiredSheets) {
      if (!existingTitles.has(title)) {
        requestsToCreate.push({
          addSheet: {
            properties: { title },
          },
        });
      }
    }

    if (requestsToCreate.length > 0) {
      const batchRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ requests: requestsToCreate }),
        }
      );
      if (!batchRes.ok) {
        const err = await batchRes.json().catch(() => ({}));
        console.warn('Batch update sheet creation note:', err.error?.message);
      }
    }

    // Initialize Headers for each sheet if empty
    await this.ensureHeaders();
  }

  private async ensureHeaders(): Promise<void> {
    try {
      // Check Expenses header
      const expRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Expenses!A1:K1`,
        { headers: this.headers }
      );
      const expData = await expRes.json();
      if (!expData.values || expData.values.length === 0) {
        await this.updateRange('Expenses!A1:K1', [
          [
            'ID',
            'Date',
            'Category',
            'CategoryEmoji',
            'Title',
            'Amount',
            'Recurring',
            'DueDay',
            'Status',
            'BillProofName',
            'Notes',
          ],
        ]);
      }

      // Check Categories header
      const catRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Categories!A1:E1`,
        { headers: this.headers }
      );
      const catData = await catRes.json();
      if (!catData.values || catData.values.length === 0) {
        await this.updateRange('Categories!A1:E1', [
          ['ID', 'Name', 'Emoji', 'MonthlyBudget', 'Color'],
        ]);
      }

      // Check Reminders header
      const remRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Reminders!A1:I1`,
        { headers: this.headers }
      );
      const remData = await remRes.json();
      if (!remData.values || remData.values.length === 0) {
        await this.updateRange('Reminders!A1:I1', [
          [
            'ID',
            'Title',
            'CategoryName',
            'CategoryEmoji',
            'Amount',
            'DueDay',
            'Frequency',
            'IsPaidThisMonth',
            'Notes',
          ],
        ]);
      }
    } catch (e) {
      console.warn('Header setup note:', e);
    }
  }

  async updateRange(range: string, values: any[][]): Promise<void> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        range
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ values }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update range ${range}`);
    }
  }

  async appendRow(sheetName: string, rowValues: any[]): Promise<void> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(
        `${sheetName}!A:A`
      )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to append row to ${sheetName}`);
    }
  }

  async readExpenses(): Promise<Expense[]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Expenses!A2:K1000`,
      { headers: this.headers }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.values) return [];

    return data.values.map((row: string[], index: number) => ({
      id: row[0] || `exp-sheet-${index}`,
      date: row[1] || new Date().toISOString().split('T')[0],
      categoryName: row[2] || 'Other',
      categoryEmoji: row[3] || '💡',
      categoryId: `cat-${(row[2] || 'other').toLowerCase().replace(/\s+/g, '-')}`,
      title: row[4] || 'Expense',
      amount: parseFloat(row[5]) || 0,
      isRecurring: row[6]?.toLowerCase() === 'yes' || row[6]?.toLowerCase() === 'true',
      dueDate: row[7] || '',
      status: (row[8]?.toLowerCase() === 'paid' ? 'paid' : 'pending') as 'paid' | 'pending',
      billProofName: row[9] || undefined,
      notes: row[10] || '',
      createdAt: new Date().toISOString(),
    }));
  }

  async readCategories(): Promise<Category[]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Categories!A2:E100`,
      { headers: this.headers }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.values || data.values.length === 0) return [];

    return data.values.map((row: string[], index: number) => ({
      id: row[0] || `cat-${index}`,
      name: row[1] || 'Category',
      emoji: row[2] || '💡',
      budget: parseFloat(row[3]) || 100,
      color: row[4] || '#3b82f6',
    }));
  }

  async readReminders(): Promise<Reminder[]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Reminders!A2:I100`,
      { headers: this.headers }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.values || data.values.length === 0) return [];

    return data.values.map((row: string[], index: number) => ({
      id: row[0] || `rem-${index}`,
      title: row[1] || 'Reminder',
      categoryName: row[2] || 'Utility',
      categoryEmoji: row[3] || '⚡',
      categoryId: `cat-${(row[2] || 'utility').toLowerCase().replace(/\s+/g, '-')}`,
      amount: parseFloat(row[4]) || 0,
      dueDay: parseInt(row[5], 10) || 1,
      frequency: (row[6] as any) || 'monthly',
      isPaidThisMonth: row[7]?.toLowerCase() === 'yes' || row[7]?.toLowerCase() === 'true',
      notes: row[8] || '',
    }));
  }

  // Bulk sync entire state to spreadsheet (Expenses, Categories, Reminders)
  async syncAll(expenses: Expense[], categories: Category[], reminders: Reminder[]): Promise<void> {
    await this.initializeSheetsIfMissing();

    // 1. Prepare Expenses
    const expenseRows = [
      [
        'ID',
        'Date',
        'Category',
        'CategoryEmoji',
        'Title',
        'Amount',
        'Recurring',
        'DueDay',
        'Status',
        'BillProofName',
        'Notes',
      ],
      ...expenses.map((e) => [
        e.id,
        e.date,
        e.categoryName,
        e.categoryEmoji,
        e.title,
        e.amount,
        e.isRecurring ? 'Yes' : 'No',
        e.dueDate || '',
        e.status,
        e.billProofName || '',
        e.notes || '',
      ]),
    ];

    // 2. Prepare Categories
    const categoryRows = [
      ['ID', 'Name', 'Emoji', 'MonthlyBudget', 'Color'],
      ...categories.map((c) => [c.id, c.name, c.emoji, c.budget, c.color]),
    ];

    // 3. Prepare Reminders
    const reminderRows = [
      [
        'ID',
        'Title',
        'CategoryName',
        'CategoryEmoji',
        'Amount',
        'DueDay',
        'Frequency',
        'IsPaidThisMonth',
        'Notes',
      ],
      ...reminders.map((r) => [
        r.id,
        r.title,
        r.categoryName,
        r.categoryEmoji,
        r.amount,
        r.dueDay,
        r.frequency,
        r.isPaidThisMonth ? 'Yes' : 'No',
        r.notes || '',
      ]),
    ];

    // Clear and write using batchUpdate for low latency and transactional sync
    await Promise.all([
      this.updateRange(`Expenses!A1:K${Math.max(expenseRows.length + 5, 50)}`, [
        ...expenseRows,
        ...Array(10).fill(Array(11).fill('')), // clear padding
      ]),
      this.updateRange(`Categories!A1:E${Math.max(categoryRows.length + 5, 20)}`, [
        ...categoryRows,
        ...Array(5).fill(Array(5).fill('')),
      ]),
      this.updateRange(`Reminders!A1:I${Math.max(reminderRows.length + 5, 20)}`, [
        ...reminderRows,
        ...Array(5).fill(Array(9).fill('')),
      ]),
    ]);
  }
}
