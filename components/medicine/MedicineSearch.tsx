"use client";

import { useEffect, useState } from "react";
import { MedicineDTO } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Search, MapPin, BadgePercent, ShoppingCart } from "lucide-react";
import LoadingDots from "@/components/shared/LoadingDots";

export default function MedicineSearch({ onFindNearby }: { onFindNearby: () => void }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const addToCart = useAppStore((s) => s.addToCart);
  const setCartOpen = useAppStore((s) => s.setCartOpen);
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [genericOnly, setGenericOnly] = useState(false);
  const [meds, setMeds] = useState<MedicineDTO[]>([]);
  const [busy, setBusy] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(`/api/medicines?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setMeds(data.medicines ?? []);
      } catch {
        setMeds([]);
      }
      setBusy(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const shown = genericOnly ? meds.filter((m) => m.genericPrice < m.priceBdt) : meds;

  function add(m: MedicineDTO) {
    addToCart({
      id: m.id,
      name: m.brandName,
      nameBn: m.genericNameBn,
      strength: m.strength,
      dosageForm: m.dosageForm,
      price: m.priceBdt,
    });
    pushToast({
      title: `${m.brandName} ${lang === "bn" ? "কার্টে যোগ হয়েছে" : "added to cart"}`,
      variant: "success",
    });
  }

  return (
    <div className="panel p-5">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ওষুধের নাম লিখুন… (e.g. Napa, Metformin)"
            className="input-dark pl-9 font-bangla"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={genericOnly}
            onChange={(e) => setGenericOnly(e.target.checked)}
            className="accent-teal-500"
          />
          Generic savings only
        </label>
        <button
          onClick={() => setCartOpen(true)}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className={cn(lang === "bn" && "font-bangla")}>{t("cart.title")}</span>
        </button>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {busy && (
          <p className="text-sm text-slate-500 col-span-full py-6 text-center">
            Searching <LoadingDots />
          </p>
        )}
        {!busy && shown.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full py-6 text-center">
            No medicines found for &quot;{q}&quot;.
          </p>
        )}
        {!busy &&
          shown.map((m) => {
            const savings = Math.round(((m.priceBdt - m.genericPrice) / m.priceBdt) * 100);
            return (
              <div key={m.id} className="card-surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{m.brandName}</p>
                    <p className="text-xs text-slate-400">
                      {m.genericName} <span className="font-bangla">({m.genericNameBn})</span> ·{" "}
                      {m.manufacturer}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bangla px-2 py-0.5 rounded-full whitespace-nowrap ${
                      m.inStock
                        ? "bg-green-900/30 border border-green-700 text-green-300"
                        : "bg-red-900/30 border border-red-700 text-red-300"
                    }`}
                  >
                    {m.inStock ? "মজুদ আছে" : "মজুদ নেই"}
                  </span>
                </div>
                <p className="text-lg font-bold text-teal-300 mt-1.5">
                  ৳{m.priceBdt}
                  <span className="text-xs text-slate-500 font-normal ml-1">
                    / {m.dosageForm} ({m.strength})
                  </span>
                </p>

                {expandedId === m.id && (
                  <div className="mt-2 card-surface p-2.5 border-teal-900 text-xs animate-fade-in">
                    <p className="text-teal-300 font-semibold flex items-center gap-1.5">
                      <BadgePercent className="w-3.5 h-3.5" /> Generic: {m.genericName} — ৳
                      {m.genericPrice} <span className="text-teal-400">({savings}% cheaper)</span>
                    </p>
                    <p className="text-slate-400 mt-1">
                      Same active ingredient, DGDA-approved bioequivalent.
                    </p>
                  </div>
                )}

                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  <button
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    <BadgePercent className="w-3 h-3 inline mr-1" />
                    Generic −{savings}%
                  </button>
                  <button
                    onClick={() => add(m)}
                    disabled={!m.inStock}
                    className="btn-primary text-[11px] py-1 px-2.5"
                  >
                    <ShoppingCart className="w-3 h-3 inline mr-1" />
                    <span className={cn(lang === "bn" && "font-bangla")}>{t("cart.addToCart")}</span>
                  </button>
                  <button onClick={onFindNearby} className="btn-secondary text-[11px] py-1 px-2.5">
                    <MapPin className="w-3 h-3 inline mr-1" /> Find Nearby
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
