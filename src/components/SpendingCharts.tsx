import React, { useState } from 'react';
import { PieChart as PieIcon, BarChart3, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { Category, Expense, MonthlyStats } from '../types';

interface SpendingChartsProps {
  expenses: Expense[];
  categories: Category[];
  selectedMonth: string; // YYYY-MM
  stats: MonthlyStats;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  expenses,
  categories,
  selectedMonth,
  stats,
}) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [chartView, setChartView] = useState<'category' | 'trends' | 'behavior'>('category');

  // Filter current month
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  // Compute Category Spend
  const categoryData = categories
    .map((cat) => {
      const total = currentMonthExpenses
        .filter((e) => e.categoryId === cat.id || e.categoryName === cat.name)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        ...cat,
        spent: total,
        percentage: stats.totalSpent > 0 ? (total / stats.totalSpent) * 100 : 0,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // If no expenses logged yet, show empty or zero preview
  const displayData =
    categoryData.length > 0
      ? categoryData
      : categories.slice(0, 4).map((c) => ({
          ...c,
          spent: 0,
          percentage: 0,
        }));

  // SVG Donut calculation
  let cumulativeAngle = 0;
  const donutSegments = displayData.map((item, index) => {
    const angle = stats.totalSpent > 0 ? (item.percentage / 100) * 360 : 360 / Math.max(displayData.length, 1);
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const rOuter = 80;
    const rInner = 52;
    const cx = 100;
    const cy = 100;

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);

    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData =
      angle >= 359.9
        ? `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.01} ${cy - rOuter} L ${cx - 0.01} ${cy - rInner} A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner} Z`
        : `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      ...item,
      pathData,
      index,
    };
  });

  // Calculate 6-month historical trend
  const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const trendData = monthNames.map((m, i) => {
    const isCurrent = i === monthNames.length - 1;
    const amount = isCurrent ? stats.totalSpent : 0;
    return {
      month: m,
      amount,
      budget: stats.totalBudget,
    };
  });
  const maxTrend = Math.max(...trendData.map((d) => Math.max(d.amount, d.budget)), 1000);

  // Daily spend analysis
  const daysInMonth = 30;
  const dayDistribution = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = (i + 1).toString().padStart(2, '0');
    const dayStr = `${selectedMonth}-${dayNum}`;
    const daySpent = currentMonthExpenses
      .filter((e) => e.date === dayStr)
      .reduce((s, e) => s + e.amount, 0);
    return { day: i + 1, spent: daySpent };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header and Chart View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Spending Trends &amp; Habit Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive breakdown of household categories, billing cycles, and behavioral patterns
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartView('category')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartView === 'category'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            type="button"
            onClick={() => setChartView('trends')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartView === 'trends'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Trend
          </button>
          <button
            type="button"
            onClick={() => setChartView('behavior')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              chartView === 'behavior'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Daily Spend
          </button>
        </div>
      </div>

      {/* View 1: Category Donut Chart & Legend */}
      {chartView === 'category' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart SVG */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 200 200" className="w-56 h-56 transform -rotate-90">
              {stats.totalSpent > 0 ? (
                donutSegments.map((seg) => (
                  <path
                    key={seg.id}
                    d={seg.pathData}
                    fill={seg.color}
                    className="transition-all duration-200 cursor-pointer hover:opacity-85"
                    style={{
                      filter:
                        activeSegment === seg.index ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none',
                      transform:
                        activeSegment === seg.index
                          ? 'scale(1.03) translate(-2px, -2px)'
                          : 'scale(1)',
                      transformOrigin: '100px 100px',
                    }}
                    onMouseEnter={() => setActiveSegment(seg.index)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                ))
              ) : (
                <circle
                  cx="100"
                  cy="100"
                  r="66"
                  strokeWidth="28"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  fill="none"
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeSegment !== null && donutSegments[activeSegment] && stats.totalSpent > 0 ? (
                <>
                  <span className="text-xl">{donutSegments[activeSegment].emoji}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
                    {donutSegments[activeSegment].name}
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    Rs. {donutSegments[activeSegment].spent.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {donutSegments[activeSegment].percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Spent
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    Rs. {stats.totalSpent.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {currentMonthExpenses.length} transactions
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category List & Progress Bars */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Spending by Category ({categories.length})
            </h4>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat, idx) => {
                const spent = currentMonthExpenses
                  .filter((e) => e.categoryId === cat.id || e.categoryName === cat.name)
                  .reduce((sum, e) => sum + e.amount, 0);
                const percentage = stats.totalSpent > 0 ? (spent / stats.totalSpent) * 100 : 0;
                const isHovered = activeSegment === idx;
                const isOverBudget = cat.budget > 0 && spent > cat.budget;
                const budgetProgress =
                  cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;

                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveSegment(idx)}
                    onMouseLeave={() => setActiveSegment(null)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.emoji}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {cat.name}
                        </span>
                        {isOverBudget && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-sm">
                            Exceeded
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Rs. {spent.toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.budget > 0 ? budgetProgress : percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>
                        Budget: Rs. {cat.budget.toFixed(2)}
                      </span>
                      <span>
                        {cat.budget > 0
                          ? `${((spent / cat.budget) * 100).toFixed(0)}% used`
                          : 'No target'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Spending Trend */}
      {chartView === 'trends' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
              Monthly Expenses
              <span className="w-3 h-3 rounded-md bg-slate-300 dark:bg-slate-700 inline-block ml-3"></span>
              Monthly Target Baseline
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Current Spent: Rs. {stats.totalSpent.toFixed(2)}
            </span>
          </div>

          <div className="h-60 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
            {trendData.map((d, index) => {
              const heightPercent = maxTrend > 0 ? (d.amount / maxTrend) * 100 : 0;
              const isCurrent = index === trendData.length - 1;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Rs. {d.amount.toFixed(0)}
                  </div>

                  <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-2xl relative h-full flex items-end overflow-hidden p-1">
                    {/* Budget benchmark line */}
                    {d.budget > 0 && (
                      <div
                        className="absolute w-full border-t-2 border-dashed border-slate-400/40 left-0 z-10"
                        style={{ bottom: `${Math.min((d.budget / maxTrend) * 100, 100)}%` }}
                      />
                    )}
                    {/* Bar fill */}
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                      }`}
                      style={{ height: `${Math.max(heightPercent, d.amount > 0 ? 8 : 4)}%` }}
                    />
                  </div>

                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: Daily Spending Behavior */}
      {chartView === 'behavior' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Monthly Behavior &amp; Pace
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Track recurring bill deadlines and regular household expenditures day-by-day.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Daily Average Spend</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                Rs. {stats.dailyAverage.toFixed(2)}/day
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Daily Spending Distribution (Current Billing Cycle)
            </h4>
            <div className="h-44 flex items-end justify-between gap-1 pt-4 border-b border-slate-200 dark:border-slate-800">
              {dayDistribution.map((d) => {
                const maxDay = Math.max(...dayDistribution.map((i) => i.spent), 500);
                const heightPercent = d.spent > 0 ? (d.spent / maxDay) * 100 : 4;

                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {d.spent > 0 && (
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap z-20">
                        Day {d.day}: Rs. {d.spent.toFixed(2)}
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        d.spent > 0
                          ? 'bg-emerald-500 hover:bg-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-slate-400 mt-1">
                      {d.day % 5 === 0 || d.day === 1 ? d.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
