import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        };

        const bgStyles = {
          success: "bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40",
          error: "bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40",
          warning: "bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/40",
          info: "bg-slate-900/95 border-indigo-500/40 text-indigo-100 shadow-indigo-950/40"
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 animate-fade-in transition-all ${
              bgStyles[toast.type]
            }`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <p className="text-xs font-bold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
