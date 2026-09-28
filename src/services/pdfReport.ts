import jsPDF from 'jspdf';
import { Category, Expense, Reminder, MonthlyStats } from '../types';

interface GenerateReportOptions {
  monthName: string;
  year: number;
  expenses: Expense[];
  categories: Category[];
  reminders: Reminder[];
  stats: MonthlyStats;
  currencySymbol?: string;
  userEmail?: string;
}

export function generateMonthlyPDFReport({
  monthName,
  year,
  expenses,
  categories,
  reminders,
  stats,
  currencySymbol = 'Rs. ',
  userEmail = 'devinelwis@gmail.com',
}: GenerateReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Primary palette
  const primaryColor = [16, 185, 129]; // Emerald 500
  const darkColor = [15, 23, 42]; // Slate 900
  const grayColor = [100, 116, 139]; // Slate 500
  const lightBg = [248, 250, 252]; // Slate 50

  // 1. Header Banner
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent line
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 36, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mandatory Monthly Expenses - Summary Report', 14, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Billing Cycle: ${monthName} ${year}  |  Account: ${userEmail}  |  Exported: ${new Date().toLocaleDateString()}`,
    14,
    27
  );

  currentY = 46;

  // 2. Summary KPI Metric Cards (4 cards in a row)
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 22;

  const kpis = [
    {
      label: 'TOTAL SPENT',
      value: `${currencySymbol}${stats.totalSpent.toFixed(2)}`,
      color: [16, 185, 129],
    },
    {
      label: 'MONTHLY BUDGET',
      value: `${currencySymbol}${stats.totalBudget.toFixed(2)}`,
      color: [59, 130, 246],
    },
    {
      label: 'REMAINING / SAVINGS',
      value: `${currencySymbol}${stats.remainingBudget.toFixed(2)}`,
      color: stats.remainingBudget >= 0 ? [16, 185, 129] : [239, 68, 68],
    },
    {
      label: 'BILLS COMPLETED',
      value: `${stats.paidCount} of ${stats.paidCount + stats.pendingCount}`,
      color: [139, 92, 246],
    },
  ];

  kpis.forEach((kpi, index) => {
    const x = 14 + index * (cardWidth + 3);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(kpi.label, x + 3.5, currentY + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 3.5, currentY + 16);
  });

  currentY += cardHeight + 10;

  // 3. Category Breakdown Section
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Spending by Category', 14, currentY);

  currentY += 5;

  // Category Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Category', 18, currentY + 5);
  doc.text('Monthly Budget', 80, currentY + 5);
  doc.text('Actual Spent', 115, currentY + 5);
  doc.text('Share %', 150, currentY + 5);
  doc.text('Status', 175, currentY + 5);

  currentY += 8;

  // Compute category spending
  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    catMap.set(e.categoryName, (catMap.get(e.categoryName) || 0) + e.amount);
  });

  categories.forEach((cat) => {
    const spent = catMap.get(cat.name) || 0;
    const share = stats.totalSpent > 0 ? (spent / stats.totalSpent) * 100 : 0;
    const isOver = cat.budget > 0 && spent > cat.budget;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    // ASCII clean category name for standard PDF fonts
    const safeCatName = cat.name.replace(/[^\x20-\x7E]/g, '').trim() || cat.name;
    doc.text(safeCatName, 18, currentY + 4);
    doc.text(`${currencySymbol}${cat.budget.toFixed(2)}`, 80, currentY + 4);
    doc.text(`${currencySymbol}${spent.toFixed(2)}`, 115, currentY + 4);
    doc.text(`${share.toFixed(1)}%`, 150, currentY + 4);

    if (isOver) {
      doc.setTextColor(220, 38, 38);
      doc.text('Over Budget', 175, currentY + 4);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('Within Budget', 175, currentY + 4);
    }

    // Divider line
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);
    currentY += 7;
  });

  currentY += 6;

  // 4. Recurring Payment Deadlines & Reminders
  if (reminders.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Recurring Bill Reminders & Deadlines', 14, currentY);

    currentY += 5;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 7, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);

    doc.text('Bill Name', 18, currentY + 5);
    doc.text('Category', 75, currentY + 5);
    doc.text('Est. Amount', 120, currentY + 5);
    doc.text('Monthly Due Day', 150, currentY + 5);
    doc.text('Month Status', 175, currentY + 5);

    currentY += 8;

    reminders.forEach((rem) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const safeRemTitle = rem.title.replace(/[^\x20-\x7E]/g, '').trim() || rem.title;
      const safeRemCat = rem.categoryName.replace(/[^\x20-\x7E]/g, '').trim() || rem.categoryName;

      doc.text(safeRemTitle, 18, currentY + 4);
      doc.text(safeRemCat, 75, currentY + 4);
      doc.text(`${currencySymbol}${rem.amount.toFixed(2)}`, 120, currentY + 4);
      doc.text(`Every ${rem.dueDay}th`, 150, currentY + 4);

      if (rem.isPaidThisMonth) {
        doc.setTextColor(22, 163, 74);
        doc.text('Paid ✓', 175, currentY + 4);
      } else {
        doc.setTextColor(217, 119, 6);
        doc.text('Pending !', 175, currentY + 4);
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);
      currentY += 7;
    });

    currentY += 6;
  }

  // 5. Itemized Expense Log (Check page height and add page if needed)
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Itemized Transaction Ledger (${expenses.length})`, 14, currentY);

  currentY += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Date', 18, currentY + 5);
  doc.text('Description', 45, currentY + 5);
  doc.text('Category', 105, currentY + 5);
  doc.text('Proof Attached', 145, currentY + 5);
  doc.text('Status', 170, currentY + 5);
  doc.text('Amount', 185, currentY + 5);

  currentY += 8;

  expenses.forEach((exp) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    doc.text(exp.date, 18, currentY + 4);
    const safeExpTitle = exp.title.replace(/[^\x20-\x7E]/g, '').trim() || exp.title;
    const shortTitle = safeExpTitle.length > 28 ? safeExpTitle.substring(0, 25) + '...' : safeExpTitle;
    doc.text(shortTitle, 45, currentY + 4);

    const safeCat = exp.categoryName.replace(/[^\x20-\x7E]/g, '').trim() || exp.categoryName;
    doc.text(safeCat, 105, currentY + 4);
    doc.text(exp.billProofName || exp.billProofUrl ? 'Yes' : 'None', 145, currentY + 4);
    doc.text(exp.status.toUpperCase(), 170, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(`${currencySymbol}${exp.amount.toFixed(2)}`, 185, currentY + 4);

    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);
    currentY += 7;
  });

  // Footer notes on last page
  const totalPages = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Mandatory Monthly Expenses • Real-time Cloud Sync`,
      14,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 32, pageHeight - 8);
  }

  // Save PDF
  doc.save(`Mandatory_Monthly_Expenses_${monthName}_${year}.pdf`);
}
