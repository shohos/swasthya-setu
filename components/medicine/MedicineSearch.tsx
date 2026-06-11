"use client";

import { useEffect, useState } from "react";
import { MedicineDTO } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Search, Truck, MapPin, BadgePercent, BellRing } from "lucide-react";
import LoadingDots from "@/components/shared/LoadingDots";

export default function MedicineSearch({ onFindNearby }: { onFindNearby: () => void }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [q, setQ] = useState("");
  const [genericOnly, setGenericOnly] = useState(false);
  const [meds, setMeds] = useState<MedicineDTO[]>([]);
  const [busy, setBusy] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reminderFor, setReminderFor] = useState<MedicineDTO | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
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
    return () => clearTimeout(t);
  }, [q]);

  const shown = genericOnly
    ? meds.filter((m) => m.genericPrice < m.priceBdt)
    : meds;

  function order(m: MedicineDTO) {
    pushToast({
      title: "Order placed for delivery",
      message: `${m.brandName} — delivery within 2 hours from nearest pharmacy`,
      variant: "success",
    });
    setReminderFor(m);
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
                      {m.genericPrice}{" "}
                      <span className="text-teal-400">({savings}% cheaper)</span>
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
                    onClick={() => order(m)}
                    disabled={!m.inStock}
                    className="btn-primary text-[11px] py-1 px-2.5"
                  >
                    <Truck className="w-3 h-3 inline mr-1" /> Order Delivery
                  </button>
                  <button onClick={onFindNearby} className="btn-secondary text-[11px] py-1 px-2.5">
                    <MapPin className="w-3 h-3 inline mr-1" /> Find Nearby
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* medicine reminder mock */}
      {reminderFor && (
        <div className="mt-4 card-surface p-4 border-teal-900 animate-slide-up">
          <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-teal-400" /> Set up medication reminder for{" "}
            {reminderFor.brandName}?
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <select className="input-dark text-xs" defaultValue="3x daily">
              <option>1x daily</option>
              <option>2x daily</option>
              <option>3x daily</option>
            </select>
            <input type="date" className="input-dark text-xs" defaultValue={new Date().toISOString().slice(0, 10)} />
            <button
              onClick={() => {
                pushToast({
                  title: "Reminder scheduled",
                  message: "You will receive SMS at 8:00, 14:00, 20:00 daily",
                  variant: "success",
                });
                setReminderFor(null);
              }}
              className="btn-primary text-xs"
            >
              Send via SMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
