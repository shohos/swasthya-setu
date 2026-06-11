"use client";

import { useState } from "react";
import Link from "next/link";
import RiskBadge from "@/components/shared/RiskBadge";
import { useAppStore } from "@/lib/store";
import { DEMO_VITALS } from "@/lib/mock-data";
import { ChevronDown, FilePlus2, Send, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnemiaResult({ image }: { image: string }) {
  const v = DEMO_VITALS.anemia;
  const pushToast = useAppStore((s) => s.pushToast);
  const [showHow, setShowHow] = useState(false);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* image + heatmap overlay */}
      <div className="relative card-surface overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Captured conjunctiva" className="w-full" />
        {/* GradCAM-style heatmap over the conjunctiva region */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "20%",
            right: "20%",
            top: "58%",
            height: "26%",
            background:
              "radial-gradient(ellipse at center, rgba(255,60,60,0.55) 0%, rgba(255,170,0,0.35) 55%, transparent 75%)",
            mixBlendMode: "screen",
          }}
        />
        <span className="absolute top-2 left-2 text-[10px] bg-ink/80 px-2 py-0.5 rounded text-teal-300 font-mono">
          GradCAM attention: conjunctival region
        </span>
      </div>

      <div className="panel p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-2xl font-bold text-slate-100">
              {v.hemoglobin} <span className="text-sm font-normal text-slate-400">(Estimated)</span>
            </p>
            <p className="text-amber-300 font-semibold">{v.severity}</p>
          </div>
          <RiskBadge level={v.level} />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Model confidence</span>
            <span className="text-teal-300 font-semibold">{v.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-1000"
              style={{ width: `${v.confidence}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Key finding:</span> {v.finding}
        </p>
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Recommendation:</span> {v.recommendation}
        </p>

        <div className="flex gap-2 flex-wrap pt-1">
          <Link href="/intake/app" className="btn-primary text-xs flex items-center gap-1.5">
            <FilePlus2 className="w-3.5 h-3.5" /> Create Case
          </Link>
          <button
            onClick={() => pushToast({ title: "Sent to doctor queue", message: "Screening attached to patient record", variant: "success" })}
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
        ⚠ Screening signal only — not a clinical diagnosis. Accuracy ~84% for moderate-severe
        anemia (HemoGlobe study). Requires laboratory confirmation.
      </p>

      <button
        onClick={() => setShowHow(!showHow)}
        className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1"
      >
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showHow && "rotate-180")} />
        How this works
      </button>
      {showHow && (
        <p className="text-xs text-slate-400 card-surface p-3 leading-relaxed animate-fade-in">
          A MobileNetV3-Small model analyzes color values in the conjunctiva (inner lower eyelid)
          region and compares against trained hemoglobin reference ranges. In production this runs
          as a TFLite model fully on-device — no internet required. This demo shows a
          representative mock output.
        </p>
      )}
    </div>
  );
}
