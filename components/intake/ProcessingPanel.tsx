"use client";

import { TriageResult } from "@/lib/mock-responses";
import RiskBadge from "@/components/shared/RiskBadge";
import LoadingDots from "@/components/shared/LoadingDots";
import { CheckCircle2, CircleDashed, MessageSquareText } from "lucide-react";
import Link from "next/link";

export interface PipelineStep {
  label: string;
  status: "pending" | "active" | "done";
}

export default function ProcessingPanel({
  steps,
  transcript,
  result,
  caseId,
}: {
  steps: PipelineStep[];
  transcript: { speaker: string; text: string }[];
  result: (TriageResult & { caseId?: string | null }) | null;
  caseId?: string | null;
}) {
  return (
    <div className="panel p-4 h-full flex flex-col gap-4">
      <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest">
        System Processing
      </h3>

      {/* Pipeline steps */}
      <div className="space-y-1.5">
        {steps.map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${
              s.status === "active"
                ? "bg-teal-600/10 text-teal-300"
                : s.status === "done"
                  ? "text-slate-300"
                  : "text-slate-600"
            }`}
          >
            {s.status === "done" ? (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            ) : s.status === "active" ? (
              <span className="shrink-0">
                <LoadingDots />
              </span>
            ) : (
              <CircleDashed className="w-4 h-4 shrink-0" />
            )}
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Live transcript */}
      {transcript.length > 0 && (
        <div className="card-surface p-3 max-h-44 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Live Transcript
          </p>
          {transcript.map((t, i) => (
            <p key={i} className="text-xs mb-1.5">
              <span className={t.speaker === "AI" ? "text-teal-400 font-semibold" : "text-blue-300 font-semibold"}>
                {t.speaker}:
              </span>{" "}
              <span className="text-slate-300 font-bangla">{t.text}</span>
            </p>
          ))}
        </div>
      )}

      {/* Structured result */}
      {result && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-semibold text-slate-100">Triage complete:</span>
            <RiskBadge level={result.triageAssessment.level} />
          </div>

          <div className="card-surface p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">
              Structured JSON output (Claude)
            </p>
            <pre className="text-[10px] font-mono text-emerald-300/90 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          <div className="card-surface p-3 border-blue-900">
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1.5 flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5" /> SMS reply to patient
            </p>
            <p className="text-sm font-bangla text-slate-200">{result.outputs.patientSMSBn}</p>
          </div>

          <div className="card-surface p-3 border-teal-900 text-sm">
            <p className="text-teal-300 font-semibold">
              ✅ Case {caseId ? `#${caseId.slice(-6).toUpperCase()}` : "created"}.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Doctor will review within{" "}
              <span className="text-slate-200 font-semibold">
                {result.triageAssessment.timeframeHours} hour
                {result.triageAssessment.timeframeHours === 1 ? "" : "s"}
              </span>{" "}
              ({result.triageAssessment.recommendedAction.replace(/_/g, " ")}).
            </p>
            <Link href="/dashboard" className="btn-primary text-xs inline-block mt-3">
              View in Doctor Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
