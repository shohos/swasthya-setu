"use client";

import { useState } from "react";
import Link from "next/link";
import RiskBadge from "@/components/shared/RiskBadge";
import { useAppStore } from "@/lib/store";
import type { ScreeningResult } from "@/lib/vision";
import { ChevronDown, FilePlus2, Send, Printer, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME = {
  anemia: {
    accent: "text-teal-300",
    bar: "from-teal-600 to-teal-400",
    hover: "hover:text-teal-300",
    heatmap: {
      left: "20%",
      right: "20%",
      top: "58%",
      height: "26%",
      background:
        "radial-gradient(ellipse at center, rgba(255,60,60,0.55) 0%, rgba(255,170,0,0.35) 55%, transparent 75%)",
    },
    heatmapLabel: "Attention: conjunctival region",
    heatmapColor: "text-teal-300",
    disclaimer:
      "⚠ Screening signal only — not a clinical diagnosis. Color-space heuristics estimate hemoglobin from conjunctival pallor; requires laboratory confirmation (CBC).",
    how: "A conjunctival redness index — R − (G+B)/2 averaged over the central region — is computed on-device from the captured image, then mapped against pallor reference ranges to estimate hemoglobin. Roboflow's hosted CLIP model adds a zero-shot check (pale-anemic vs healthy-red conjunctiva) to corroborate the reading. Both run on Roboflow's free tier.",
  },
  jaundice: {
    accent: "text-amber-300",
    bar: "from-amber-600 to-amber-400",
    hover: "hover:text-amber-300",
    heatmap: {
      left: "12%",
      right: "12%",
      top: "22%",
      height: "40%",
      background:
        "radial-gradient(ellipse at center, rgba(255,200,0,0.5) 0%, rgba(255,140,0,0.3) 55%, transparent 78%)",
    },
    heatmapLabel: "Attention: scleral region",
    heatmapColor: "text-amber-300",
    disclaimer:
      "⚠ Screening signal only — not a clinical diagnosis. Scleral icterus is typically visible above ~3 mg/dL bilirubin; requires liver function test (LFT) confirmation.",
    how: "A scleral yellowness index — (R+G)/2 − B averaged over the central region — is computed on-device from the captured image, then mapped against icterus reference ranges to estimate bilirubin. Roboflow's hosted CLIP model adds a zero-shot check (yellow-jaundiced vs white-healthy sclera) to corroborate the reading. Both run on Roboflow's free tier.",
  },
} as const;

export default function ScreeningResultCard({
  image,
  result,
}: {
  image: string;
  result: ScreeningResult;
}) {
  const theme = THEME[result.type];
  const pushToast = useAppStore((s) => s.pushToast);
  const [showHow, setShowHow] = useState(false);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* image + attention overlay */}
      <div className="relative card-surface overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`Captured ${result.type} screening image`} className="w-full" />
        <div
          className="absolute pointer-events-none"
          style={{ ...theme.heatmap, mixBlendMode: "screen" }}
        />
        <span
          className={`absolute top-2 left-2 text-[10px] bg-ink/80 px-2 py-0.5 rounded font-mono ${theme.heatmapColor}`}
        >
          {theme.heatmapLabel}
        </span>
      </div>

      <div className="panel p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-2xl font-bold text-slate-100">
              {result.estimate}{" "}
              <span className="text-sm font-normal text-slate-400">(Estimated)</span>
            </p>
            <p className="text-amber-300 font-semibold">{result.severity}</p>
          </div>
          <RiskBadge level={result.level} />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Model confidence</span>
            <span className={`${theme.accent} font-semibold`}>{result.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-1000`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Key finding:</span> {result.finding}
        </p>
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Recommendation:</span> {result.recommendation}
        </p>

        {/* Live vs fallback source badge */}
        <p
          className={cn(
            "text-[11px] flex items-center gap-1.5",
            result.usedFallback ? "text-amber-400" : "text-teal-400"
          )}
        >
          {result.usedFallback ? (
            <CloudOff className="w-3.5 h-3.5" />
          ) : (
            <Cloud className="w-3.5 h-3.5" />
          )}
          {result.method}
          {!result.usedFallback && (
            <span className="text-slate-500">
              · index {result.metrics.index}
              {result.metrics.clipProbability !== null &&
                ` · CLIP ${Math.round(result.metrics.clipProbability * 100)}%`}
            </span>
          )}
        </p>

        <div className="flex gap-2 flex-wrap pt-1">
          <Link href="/intake/app" className="btn-primary text-xs flex items-center gap-1.5">
            <FilePlus2 className="w-3.5 h-3.5" /> Create Case
          </Link>
          <button
            onClick={() =>
              pushToast({
                title: "Sent to doctor queue",
                message: "Screening attached to patient record",
                variant: "success",
              })
            }
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send to Doctor
          </button>
          <button
            onClick={() => pushToast({ title: "Report queued for printing", variant: "info" })}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed border border-edge rounded-lg p-2.5">
        {theme.disclaimer}
      </p>

      <button
        onClick={() => setShowHow(!showHow)}
        className={`text-xs text-slate-400 ${theme.hover} flex items-center gap-1`}
      >
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showHow && "rotate-180")} />
        How this works
      </button>
      {showHow && (
        <p className="text-xs text-slate-400 card-surface p-3 leading-relaxed animate-fade-in">
          {theme.how}
        </p>
      )}
    </div>
  );
}
