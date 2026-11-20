import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare readonly props: ErrorBoundaryProps;

  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kendala tak terduga saat memuat halaman.',
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#060c1c] text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c162e] space-y-4 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-serif">Terjadi Kendala Sementara</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                {this.state.message.slice(0, 220)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
