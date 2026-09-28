import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Check, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const POPULAR_EMOJIS = [
  '⚡', // Electricity
  '💧', // Water
  '📱', // Phone
  '⛽', // Gas
  '🏠', // Rent
  '🌐', // Internet
  '🛒', // Groceries
  '🛡️', // Insurance
  '💊', // Medical
  '🚗', // Vehicle
  '🍽️', // Dining
  '🎓', // Education
  '📺', // Streaming
  '🐾', // Pets
  '☕', // Coffee
  '🏋️', // Fitness
  '💼', // Office
  '💡', // Misc
  '🎁', // Gifts
  '👔', // Clothing
  '🔧', // Maintenance
];

const PRESET_COLORS = [
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
  '#64748b', // slate
  '#f97316', // orange
  '#14b8a6', // teal
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💡');
  const [budget, setBudget] = useState('5000');
  const [color, setColor] = useState('#10b981');
  const [customEmojiInput, setCustomEmojiInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      emoji: customEmojiInput.trim() || emoji,
      budget: parseFloat(budget) || 0,
      color,
    });

    // Reset form
    setName('');
    setCustomEmojiInput('');
    setBudget('5000');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Budget Categories &amp; Emojis / කාණ්ඩ සහ අයවැය
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize monthly spending targets and Sinhala/English categories in Rs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Create Category Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Add New Budget Category / නව කාණ්ඩයක්
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Name (Sinhala or English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. වාහන නඩත්තු (Vehicle Maintenance)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Monthly Budget Limit (Rs.) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Emoji Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Visual Emoji Badge
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Selected: <span className="text-base">{customEmojiInput || emoji}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {POPULAR_EMOJIS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEmoji(item);
                      setCustomEmojiInput('');
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                      emoji === item && !customEmojiInput
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Or type any emoji"
                  value={customEmojiInput}
                  onChange={(e) => setCustomEmojiInput(e.target.value)}
                  className="w-48 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chart &amp; Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Configured Categories ({categories.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      {cat.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {cat.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Budget: Rs. {cat.budget.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    title="Delete category"
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
