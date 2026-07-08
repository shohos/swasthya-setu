"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  X,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  Truck,
  ArrowLeft,
} from "lucide-react";

type Step = "cart" | "checkout" | "done";

export default function CartDrawer() {
  const { t, lang } = useT();
  const cart = useAppStore((s) => s.cart);
  const cartOpen = useAppStore((s) => s.cartOpen);
  const setCartOpen = useAppStore((s) => s.setCartOpen);
  const setQty = useAppStore((s) => s.setQty);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const clearCart = useAppStore((s) => s.clearCart);
  const pushToast = useAppStore((s) => s.pushToast);

  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "bKash",
  });
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;
  const bn = lang === "bn";

  if (!cartOpen) return null;

  function close() {
    setCartOpen(false);
    if (step === "done") {
      setStep("cart");
      setOrderId(null);
    }
  }

  async function placeOrder() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = bn ? "নাম দিন" : "Name required";
    if (!/^\+?\d{10,14}$/.test(form.phone.replace(/[\s-]/g, "")))
      e.phone = bn ? "সঠিক ফোন নম্বর দিন" : "Valid phone required";
    if (!form.address.trim()) e.address = bn ? "ঠিকানা দিন" : "Address required";
    setErrors(e);
    if (Object.keys(e).length > 0 || placing) return;

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            name: c.name,
            strength: c.strength,
            qty: c.qty,
            price: c.price,
          })),
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          paymentMethod: form.payment,
        }),
      });
      const data = await res.json();
      setOrderId(data.order?.id ?? null);
    } catch {
      setOrderId(null);
    }
    setPlacing(false);
    setStep("done");
    clearCart();
    pushToast({
      title: t("cart.orderPlaced"),
      message: t("cart.orderDetail"),
      variant: "success",
    });
  }

  return (
    <div className="fixed inset-0 z-[95] bg-black/60" onClick={close}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-panel border-l border-edge flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-edge">
          {step === "checkout" && (
            <button
              onClick={() => setStep("cart")}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <ShoppingCart className="w-5 h-5 text-teal-400" />
          <h3 className={cn("font-bold text-slate-100", bn && "font-bangla")}>
            {t("cart.title")}
          </h3>
          <button
            onClick={close}
            className="ml-auto text-slate-500 hover:text-slate-300"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART STEP */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 && (
                <p className={cn("text-slate-500 text-sm text-center py-12", bn && "font-bangla")}>
                  {t("cart.empty")}
                </p>
              )}
              {cart.map((c) => (
                <div key={c.id} className="card-surface p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-100 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.dosageForm} · {c.strength} · ৳{c.price}/unit
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(c.id, c.qty - 1)}
                      className="w-6 h-6 rounded bg-card border border-edge text-slate-300 flex items-center justify-center hover:border-teal-600"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm text-slate-100 font-semibold">
                      {c.qty}
                    </span>
                    <button
                      onClick={() => setQty(c.id, c.qty + 1)}
                      className="w-6 h-6 rounded bg-card border border-edge text-slate-300 flex items-center justify-center hover:border-teal-600"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-teal-300 w-14 text-right">
                    ৳{(c.price * c.qty).toFixed(1)}
                  </span>
                  <button
                    onClick={() => removeFromCart(c.id)}
                    className="text-slate-600 hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-edge p-4 space-y-2">
                <Row label={t("cart.subtotal")} value={`৳${subtotal.toFixed(1)}`} bn={bn} />
                <Row
                  label={t("cart.delivery")}
                  value={deliveryFee === 0 ? t("cart.freeDelivery") : `৳${deliveryFee}`}
                  bn={bn}
                  accent={deliveryFee === 0}
                />
                <Row label={t("cart.total")} value={`৳${total.toFixed(1)}`} bn={bn} bold />
                <button
                  onClick={() => setStep("checkout")}
                  className={cn("btn-primary w-full mt-2", bn && "font-bangla")}
                >
                  {t("cart.checkout")} →
                </button>
              </div>
            )}
          </>
        )}

        {/* CHECKOUT STEP */}
        {step === "checkout" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="card-surface p-3 text-sm space-y-1">
              {cart.map((c) => (
                <div key={c.id} className="flex justify-between text-slate-300">
                  <span className="truncate">
                    {c.name} × {c.qty}
                  </span>
                  <span>৳{(c.price * c.qty).toFixed(1)}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-400 border-t border-edge pt-1 mt-1">
                <span className={cn(bn && "font-bangla")}>{t("cart.delivery")}</span>
                <span>{deliveryFee === 0 ? "FREE" : `৳${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-teal-300">
                <span className={cn(bn && "font-bangla")}>{t("cart.total")}</span>
                <span>৳{total.toFixed(1)}</span>
              </div>
            </div>

            <Field
              label={t("cart.name")}
              bn={bn}
              error={errors.name}
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder={bn ? "যেমন: রহিম মিয়া" : "e.g. Rahim Mia"}
            />
            <Field
              label={t("cart.phone")}
              bn={bn}
              error={errors.phone}
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+88017XXXXXXXX"
            />
            <div>
              <label className={cn("text-xs text-slate-400", bn && "font-bangla")}>
                {t("cart.address")}
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="input-dark mt-1 font-bangla"
                placeholder={bn ? "গ্রাম, উপজেলা, জেলা" : "Village, Upazila, District"}
              />
              {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className={cn("text-xs text-slate-400", bn && "font-bangla")}>
                {t("cart.payment")}
              </label>
              <div className="flex gap-2 mt-1.5">
                {["bKash", "Nagad", "Cash on Delivery"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, payment: p })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                      form.payment === p
                        ? "bg-teal-600/20 border-teal-600 text-teal-300"
                        : "bg-card border-edge text-slate-300"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className={cn("btn-primary w-full flex items-center justify-center gap-2", bn && "font-bangla")}
            >
              <Truck className="w-4 h-4" />
              {placing ? "..." : `${t("cart.placeOrder")} — ৳${total.toFixed(1)}`}
            </button>
          </div>
        )}

        {/* DONE STEP */}
        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-teal-400" />
            <h4 className={cn("font-bold text-lg text-slate-100 mt-4", bn && "font-bangla")}>
              {t("cart.orderPlaced")}
            </h4>
            {orderId && (
              <p className="text-xs font-mono text-teal-300 mt-2">
                Order #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
            <p className={cn("text-sm text-slate-400 mt-3 leading-relaxed", bn && "font-bangla")}>
              {t("cart.orderDetail")}
            </p>
            <button onClick={close} className="btn-secondary mt-6 text-sm">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bn,
  bold = false,
  accent = false,
}: {
  label: string;
  value: string;
  bn: boolean;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={cn("text-slate-400", bn && "font-bangla")}>{label}</span>
      <span
        className={cn(
          bold ? "font-bold text-teal-300" : "text-slate-200",
          accent && "text-green-400",
          bn && "font-bangla"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  bn,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  bn: boolean;
}) {
  return (
    <div>
      <label className={cn("text-xs text-slate-400", bn && "font-bangla")}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-dark mt-1"
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
