import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastBannerProps {
  message: string;
  variant?: 'success' | 'error';
  onDismiss: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  message,
  variant = 'success',
  onDismiss,
}) => {
  const isSuccess = variant === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-md w-[calc(100%-2rem)] px-4 py-3 rounded-2xl border shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium backdrop-blur-md transition-all ${
        isSuccess
          ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-50'
          : 'bg-rose-950/95 border-rose-500/50 text-rose-50'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
        )}
        <span className="truncate">{message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
