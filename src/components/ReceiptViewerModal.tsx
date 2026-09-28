import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ExternalLink,
  Receipt,
  Eye,
} from 'lucide-react';
import { Expense } from '../types';

interface ReceiptViewerModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !expense) return null;

  const isImage =
    expense.billProofUrl?.startsWith('data:image') ||
    expense.billProofName?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  const handleDownload = () => {
    if (expense.billProofUrl) {
      const link = document.createElement('a');
      link.href = expense.billProofUrl;
      link.download = expense.billProofName || `receipt_${expense.id}.png`;
      link.click();
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Pop-up Window Container */}
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Window Chrome Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 select-none">
          {/* Mac/Window style decorative buttons + Window Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors"
                title="Close Window"
              />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <button
                type="button"
                onClick={handleResetView}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
                title="Reset Zoom"
              />
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Bill Proof Preview Window
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                • {expense.billProofName || 'Attached Document'}
              </span>
            </div>
          </div>

          {/* Quick window controls */}
          <div className="flex items-center gap-1.5">
            {isImage && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            {expense.billProofUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
                title="Download Proof"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors ml-1 cursor-pointer"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Viewer Area */}
        <div className="p-4 sm:p-6 overflow-auto flex-1 flex flex-col items-center justify-center bg-slate-950/90 dark:bg-slate-950 relative min-h-[320px]">
          {expense.billProofUrl ? (
            isImage ? (
              <div className="w-full flex items-center justify-center overflow-auto max-h-[55vh]">
                <img
                  src={expense.billProofUrl}
                  alt={expense.billProofName || 'Receipt proof'}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-[52vh] w-auto object-contain rounded-xl shadow-lg border border-slate-800"
                />
              </div>
            ) : (
              <div className="py-12 px-6 flex flex-col items-center justify-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 max-w-md w-full">
                <FileText className="w-16 h-16 text-emerald-500 mb-3" />
                <p className="font-bold text-white text-base">
                  {expense.billProofName || 'Attached PDF Document'}
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Document attached to {expense.title}
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download / Open Document
                </button>
              </div>
            )
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">
                Digital Record (No image proof attached)
              </p>
            </div>
          )}
        </div>

        {/* Window Footer: Summary Bar */}
        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              {expense.categoryEmoji}
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {expense.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {expense.categoryName} • Paid on {expense.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Amount
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                Rs. {expense.amount.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
