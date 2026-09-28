import { Category, Expense, Reminder } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-elec', name: 'විදුලි බිල (Electricity)', emoji: '⚡', budget: 5000, color: '#f59e0b' },
  { id: 'cat-water', name: 'ජල බිල (Water Bill)', emoji: '💧', budget: 1500, color: '#06b6d4' },
  { id: 'cat-phone', name: 'දුරකථන බිල (Phone / Mobile)', emoji: '📱', budget: 3000, color: '#3b82f6' },
  { id: 'cat-gas', name: 'ඉන්ධන / ගෑස් (Gas / Fuel)', emoji: '⛽', budget: 12000, color: '#ef4444' },
  { id: 'cat-rent', name: 'නිවාස කුලිය (House Rent)', emoji: '🏠', budget: 35000, color: '#8b5cf6' },
  { id: 'cat-internet', name: 'අන්තර්ජාලය (Internet / WiFi)', emoji: '🌐', budget: 3500, color: '#10b981' },
  { id: 'cat-groceries', name: 'ආහාර පාන (Groceries & Food)', emoji: '🛒', budget: 25000, color: '#84cc16' },
  { id: 'cat-insurance', name: 'රක්ෂණ (Insurance & Health)', emoji: '🛡️', budget: 6000, color: '#6366f1' },
  { id: 'cat-medical', name: 'වෛද්‍ය වියදම් (Medical & Pharma)', emoji: '💊', budget: 4000, color: '#ec4899' },
  { id: 'cat-misc', name: 'වෙනත් වියදම් (Other Expenses)', emoji: '💡', budget: 5000, color: '#64748b' },
];

// Removed all default raw mock data as requested
export const INITIAL_EXPENSES: Expense[] = [];

// Removed all default raw mock reminders as requested
export const INITIAL_REMINDERS: Reminder[] = [];
