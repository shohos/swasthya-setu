"use client";

import { useState } from "react";
import { CaseDTO } from "@/lib/types";
import CaseCard from "./CaseCard";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "ALL", label: "All Cases" },
  { id: "RED", label: "Urgent (RED)" },
  { id: "YELLOW", label: "Review (YELLOW)" },
  { id: "RESOLVED", label: "Resolved" },
] as const;

export default function PatientQueue({
  cases,
  selected,
  onSelect,
}: {
  cases: CaseDTO[];
  selected: CaseDTO | null;
  onSelect: (c: CaseDTO) => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("ALL");

  const filtered = cases.filter((c) => {
    if (tab === "ALL") return true;
    if (tab === "RESOLVED") return c.status === "RESOLVED";
    return c.triageLevel === tab && c.status !== "RESOLVED";
  });

  return (
    <div className="panel p-3 flex flex-col min-h-[400px]">
      <div className="flex gap-1 flex-wrap mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              tab === t.id
                ? "bg-teal-600/20 text-teal-300 border border-teal-700"
                : "text-slate-400 hover:bg-card border border-transparent"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-slate-500">
              {t.id === "ALL"
                ? cases.length
                : t.id === "RESOLVED"
                  ? cases.filter((c) => c.status === "RESOLVED").length
                  : cases.filter((c) => c.triageLevel === t.id && c.status !== "RESOLVED").length}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[65vh] pr-1">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No cases in this view.</p>
        )}
        {filtered.map((c) => (
          <CaseCard key={c.id} c={c} selected={selected?.id === c.id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
