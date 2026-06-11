"use client";

import { useState } from "react";
import AIThinking from "@/components/shared/AIThinking";
import { Sparkles, ShieldCheck } from "lucide-react";

interface SubResult {
  brandName: string;
  genericName: string;
  explanation_en: string;
  explanation_bn: string;
  safetyNote_bn: string;
  usedFallback?: boolean;
  db: {
    brandName: string;
    genericName: string;
    strength: string;
    brandPriceBdt: number;
    genericPriceBdt: number;
    savingsPercent: number;
    dgdaApproved: boolean;
    manufacturer: string;
  } | null;
}

export default function GenericSubstitution() {
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubResult | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: brand }),
      });
      setResult(await res.json());
    } catch {}
    setBusy(false);
  }

  return (
    <div className="panel p-5">
      <h3 className="font-bold text-slate-100 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-teal-400" /> Generic Substitution AI
      </h3>
      <p className="text-xs text-slate-400 mt-1">
        Claude explains why the generic equivalent is medically identical — and how much you save.
      </p>

      <form onSubmit={check} className="flex gap-2 mt-3">
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Enter brand name (e.g. Napa, Seclo, Amdocal)…"
          className="input-dark"
        />
        <button type="submit" className="btn-primary text-sm whitespace-nowrap" disabled={busy}>
          Check
        </button>
      </form>

      {busy && (
        <div className="mt-4">
          <AIThinking label="Claude is checking bioequivalence" />
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {result.db && (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="card-surface p-3">
                <p className="text-[10px] uppercase text-slate-500">Brand</p>
                <p className="font-bold text-slate-100">৳{result.db.brandPriceBdt}</p>
                <p className="text-xs text-slate-400">{result.db.brandName}</p>
              </div>
              <div className="card-surface p-3 border-teal-800">
                <p className="text-[10px] uppercase text-teal-400">Generic</p>
                <p className="font-bold text-teal-300">৳{result.db.genericPriceBdt}</p>
                <p className="text-xs text-slate-400">{result.db.genericName}</p>
              </div>
              <div className="card-surface p-3 border-green-900">
                <p className="text-[10px] uppercase text-green-400">You save</p>
                <p className="font-bold text-green-300">{result.db.savingsPercent}%</p>
                <p className="text-xs text-slate-400">per unit</p>
              </div>
            </div>
          )}

          <div className="card-surface p-3 text-sm space-y-2">
            <p className="text-slate-300">{result.explanation_en}</p>
            <p className="font-bangla text-slate-200 border-t border-edge pt-2">
              {result.explanation_bn}
            </p>
            <p className="font-bangla text-amber-300 text-xs">{result.safetyNote_bn}</p>
          </div>

          {result.db?.dgdaApproved && (
            <p className="text-xs text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> DGDA approved — Directorate General of Drug
              Administration, Bangladesh
            </p>
          )}
        </div>
      )}
    </div>
  );
}
