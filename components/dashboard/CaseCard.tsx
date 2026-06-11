"use client";

import { CaseDTO } from "@/lib/types";
import { TRIAGE_STYLES, CHANNEL_STYLES, timeAgo, cn } from "@/lib/utils";
import TriageBadge from "./TriageBadge";

export default function CaseCard({
  c,
  selected,
  onSelect,
}: {
  c: CaseDTO;
  selected: boolean;
  onSelect: (c: CaseDTO) => void;
}) {
  const style = TRIAGE_STYLES[c.triageLevel] ?? TRIAGE_STYLES.GREEN;
  return (
    <button
      onClick={() => onSelect(c)}
      className={cn(
        "w-full text-left card-surface border-l-4 p-3 transition-all hover:border-teal-700",
        style.border,
        selected && "ring-1 ring-teal-500 bg-teal-600/5"
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-slate-100">
          {c.patient?.name ?? "Unknown"}
          <span className="text-slate-400 font-normal ml-1.5 text-sm">
            {c.patient?.age}
            {c.patient?.sex}
          </span>
        </span>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            CHANNEL_STYLES[c.channel] ?? CHANNEL_STYLES.APP
          )}
        >
          {c.channel}
        </span>
        <span className="ml-auto text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
      </div>
      <p className="text-sm text-slate-300 mt-1.5 line-clamp-1">
        {c.chiefComplaint.slice(0, 60)}
        {c.chiefComplaint.length > 60 ? "…" : ""}
      </p>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.aiSummaryEn}</p>
      <div className="flex items-center gap-2 mt-2">
        <TriageBadge level={c.triageLevel} />
        {c.status !== "PENDING" && (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-card border border-edge text-slate-400">
            {c.status}
          </span>
        )}
      </div>
    </button>
  );
}
