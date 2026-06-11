"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  title: string;
  message?: string;
  variant: "success" | "info" | "urgent";
}

interface AppState {
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set) => ({
  toasts: [],
  pushToast: (t) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 5000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
}));
