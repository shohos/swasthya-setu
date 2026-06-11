"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  urgent: <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />,
};

const BORDERS = {
  success: "border-teal-700",
  info: "border-blue-700",
  urgent: "border-red-600",
};

export default function Toaster() {
  const { toasts, dismissToast } = useAppStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`panel ${BORDERS[t.variant]} p-3 flex items-start gap-3 shadow-xl animate-slide-in-right ${
            t.variant === "urgent" ? "animate-pulse" : ""
          }`}
        >
          {ICONS[t.variant]}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100">{t.title}</p>
            {t.message && <p className="text-xs text-slate-400 mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="ml-auto text-slate-500 hover:text-slate-300"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
