"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  title: string;
  message?: string;
  variant: "success" | "info" | "urgent";
}

export type Lang = "en" | "bn";

export interface CartItem {
  id: string;
  name: string;
  nameBn?: string;
  strength: string;
  dosageForm: string;
  price: number;
  qty: number;
}

interface AppState {
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;

  // Language
  lang: Lang;
  setLang: (l: Lang) => void;
  hydrateLang: () => void;

  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  hydrateCart: () => void;
}

let toastId = 0;

function persistCart(cart: CartItem[]) {
  try {
    localStorage.setItem("ss-cart", JSON.stringify(cart));
  } catch {}
}

export const useAppStore = create<AppState>((set, get) => ({
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

  // ---- Language ----
  lang: "en",
  setLang: (l) => {
    set({ lang: l });
    try {
      localStorage.setItem("ss-lang", l);
    } catch {}
  },
  hydrateLang: () => {
    try {
      const saved = localStorage.getItem("ss-lang");
      if (saved === "bn" || saved === "en") set({ lang: saved });
    } catch {}
  },

  // ---- Cart ----
  cart: [],
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  addToCart: (item) => {
    const cart = [...get().cart];
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    set({ cart });
    persistCart(cart);
  },
  removeFromCart: (id) => {
    const cart = get().cart.filter((c) => c.id !== id);
    set({ cart });
    persistCart(cart);
  },
  setQty: (id, qty) => {
    const cart = get()
      .cart.map((c) => (c.id === id ? { ...c, qty: Math.max(0, qty) } : c))
      .filter((c) => c.qty > 0);
    set({ cart });
    persistCart(cart);
  },
  clearCart: () => {
    set({ cart: [] });
    persistCart([]);
  },
  hydrateCart: () => {
    try {
      const saved = localStorage.getItem("ss-cart");
      if (saved) {
        const cart = JSON.parse(saved);
        if (Array.isArray(cart)) set({ cart });
      }
    } catch {}
  },
}));
