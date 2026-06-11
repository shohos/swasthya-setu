"use client";

import { useState } from "react";
import Link from "next/link";
import RiskBadge from "@/components/shared/RiskBadge";
import { useAppStore } from "@/lib/store";
import { DEMO_VITALS } from "@/lib/mock-data";
import { ChevronDown, FilePlus2, Send, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JaundiceResult({ image }: { image: string }) {
  const v = DEMO_VITALS.jaundice;
  const pushToast = useAppStore((s) => s.pushToast);
  const [showHow, setShowHow] = useState(false);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative card-surface overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Captured sclera" className="w-full" />
        {/* heatmap over the sclera */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "12%",
            right: "12%",
            top: "22%",
            height: "40%",
            background:
              "radial-gradient(ellipse at center, rgba(255,200,0,0.5) 0%, rgba(255,140,0,0.3) 55%, transparent 78%)",
            mixBlendMode: "screen",
          }}
        />
        <span className="absolute top-2 left-2 text-[10px] bg-ink/80 px-2 py-0.5 rounded text-amber-300 font-mono">
          GradCAM attention: scleral region
        </span>
      </div>

      <div className="panel p-4 space-y-3 border-amber-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-2xl font-bold text-slate-100">
              {v.bilirubin} <span className="text-sm font-normal text-slate-400">(Estimated)</span>
            </p>
            <p className="text-amber-300 font-semibold">{v.severity}</p>
          </div>
          <RiskBadge level={v.level} />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Model confidence</span>
            <span className="text-amber-300 font-semibold">{v.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
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
        ⚠ Screening signal only — not a clinical diagnosis. Scleral icterus is typically visible
        above ~3 mg/dL bilirubin. Requires liver function test (LFT) confirmation.
      </p>

      <button
        onClick={() => setShowHow(!showHow)}
        className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1"
      >
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showHow && "rotate-180")} />
        How this works
      </button>
      {showHow && (
        <p className="text-xs text-slate-400 card-surface p-3 leading-relaxed animate-fade-in">
          A MobileNetV3-Small model isolates the sclera (white of the eye), measures yellowness in
          calibrated color space, and maps it against bilirubin reference ranges. Runs on-device as
          TFLite in production. This demo shows a representative mock output.
        </p>
      )}
    </div>
  );
}
