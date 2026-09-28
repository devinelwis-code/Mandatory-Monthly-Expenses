import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  FileCheck,
  Calendar,
  Receipt,
  Tag,
  Paperclip,
  CheckCircle2,
  Clock,
  Trash2,
  Camera,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { Category, Expense, ExpenseStatus } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  initialData?: Expense | null;
  onOpenCategoryManager: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  onOpenCategoryManager,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [status, setStatus] = useState<ExpenseStatus>('paid');
  const [billProofUrl, setBillProofUrl] = useState<string | undefined>(undefined);
  const [billProofName, setBillProofName] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Live Camera state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setDate(initialData.date);
      setIsRecurring(initialData.isRecurring);
      setStatus(initialData.status);
      setBillProofUrl(initialData.billProofUrl);
      setBillProofName(initialData.billProofName);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setStatus('paid');
      setBillProofUrl(undefined);
      setBillProofName(undefined);
      setNotes('');
    }
  }, [initialData, isOpen, categories]);

  // Clean up camera stream on close
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit. Please choose a smaller bill proof.');
      return;
    }
    setBillProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBillProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Live Camera Activation
  const startLiveCamera = async () => {
    setCameraError(null);
    setIsLiveCameraOpen(true);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error, falling back to camera input:', err);
      // Fallback directly to file camera capture input
      stopLiveCamera();
      cameraInputRef.current?.click();
    }
  };

  const capturePhotoFromLiveStream = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const filename = `bill_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      setBillProofUrl(dataUrl);
      setBillProofName(filename);
      stopLiveCamera();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];

    onSave(
      {
        title: title.trim(),
        amount: parseFloat(amount) || 0,
        categoryId: selectedCategory?.id || 'cat-misc',
        categoryName: selectedCategory?.name || 'Other',
        categoryEmoji: selectedCategory?.emoji || '💡',
        date,
        isRecurring,
        status,
        billProofUrl,
        billProofName,
        notes: notes.trim() || undefined,
      },
      initialData?.id
    );

    stopLiveCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {initialData ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track household bills, utilities, refueling, and receipts in Rs.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. විදුලි බිල / Electricity Bill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (Rs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="2500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category &amp; Emoji *
              </label>
              <button
                type="button"
                onClick={onOpenCategoryManager}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                + Add / Manage Categories
              </button>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} (Budget: Rs. {c.budget.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Date & Status (Clean 2-column balanced row, Due Date removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Status
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    status === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    status === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Recurring bill toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Recurring Monthly Expense
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark this as a regular monthly utility or subscription
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Billing Proof Attachment Section with Drag-and-Drop, Browse, and Camera Capture */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                Billing Proof / Receipt Attachment
              </label>
              <span className="text-[11px] text-slate-400">Optional (leaves blank if none)</span>
            </div>

            {/* Hidden file inputs: standard file browser and camera input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* Live Camera Viewfinder Modal / Panel */}
            {isLiveCameraOpen && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 mb-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 animate-pulse" />
                    Live Camera - Capture Receipt
                  </span>
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl pointer-events-none m-4 flex items-center justify-center">
                    <span className="text-[11px] text-white/70 bg-black/60 px-2 py-1 rounded">
                      Align bill / receipt inside frame
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Use Device Native Camera
                  </button>
                  <button
                    type="button"
                    onClick={capturePhotoFromLiveStream}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Photo
                  </button>
                </div>
              </div>
            )}

            {/* Attached Proof Card or Upload Controls */}
            {billProofName || billProofUrl ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-3 overflow-hidden">
                  {billProofUrl && billProofUrl.startsWith('data:image') ? (
                    <img
                      src={billProofUrl}
                      alt="Receipt Thumbnail"
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                      {billProofName || 'Attached Receipt'}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Ready to save • Verified
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBillProofUrl(undefined);
                    setBillProofName(undefined);
                  }}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Remove attachment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="text-center space-y-1 mb-3">
                  <Upload className="w-5 h-5 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Drag and drop bill receipt here, or choose an option:
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Images (JPG, PNG) or PDF documents up to 8MB
                  </p>
                </div>

                {/* Explicit Browse and Capture Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Browse File</span>
                  </button>

                  <button
                    type="button"
                    onClick={startLiveCamera}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Capture Bill</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes / Account / Meter Reference (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Account number, meter reading, invoice notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
