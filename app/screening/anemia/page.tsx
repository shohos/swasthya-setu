"use client";

import { useState } from "react";
import CameraCapture from "@/components/screening/CameraCapture";
import ScreeningResultCard from "@/components/screening/ScreeningResultCard";
import ScreeningTabs from "@/components/screening/ScreeningTabs";
import AIThinking from "@/components/shared/AIThinking";
import { drawEyeSample } from "@/components/screening/sample-images";
import { computeColorIndex } from "@/components/screening/color-index";
import type { ScreeningResult } from "@/lib/vision";
import { Eye, CheckCircle2, XCircle } from "lucide-react";

export default function AnemiaScreeningPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  async function analyze(dataUrl: string) {
    setImage(dataUrl);
    setResult(null);
    setAnalyzing(true);
    try {
      // On-device color analysis first — runs even fully offline.
      const colorIndex = await computeColorIndex(dataUrl, "anemia");
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "anemia", colorIndex }),
      });
      setResult(await res.json());
    } catch {
      setResult(null);
    }
    setAnalyzing(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <ScreeningTabs />
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-teal-600/15 border border-teal-800">
          <Eye className="w-6 h-6 text-teal-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Anemia Screening (Computer Vision)</h1>
          <p className="text-sm text-slate-400">
            Hemoglobin estimate from conjunctival pallor — on-device color analysis verified by
            Roboflow CLIP zero-shot AI.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Instructions */}
        <div className="panel p-4">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4">
            Instructions
          </h3>
          <ol className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-2.5">
              <Step n={1} /> Gently pull down the lower eyelid
            </li>
            <li className="flex gap-2.5">
              <Step n={2} /> Position camera ~15&nbsp;cm from the eye
            </li>
            <li className="flex gap-2.5">
              <Step n={3} /> Ensure good, even lighting (daylight is best)
            </li>
          </ol>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="card-surface p-3 border-green-900">
              <EyeDiagram good />
              <p className="text-green-400 mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
              </p>
              <p className="text-slate-500 mt-0.5">Conjunctiva visible, centered</p>
            </div>
            <div className="card-surface p-3 border-red-900">
              <EyeDiagram />
              <p className="text-red-400 mt-2 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Incorrect
              </p>
              <p className="text-slate-500 mt-0.5">Eyelid not pulled, off-center</p>
            </div>
          </div>
        </div>

        {/* Camera */}
        <div className="panel p-4">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4">
            Camera
          </h3>
          <CameraCapture
            onCapture={analyze}
            onUseSample={() => analyze(drawEyeSample("anemia"))}
          />
          <p className="text-[11px] text-slate-500 mt-3">
            The conjunctival redness index is computed on-device; Roboflow CLIP adds a zero-shot
            pallor check. Without a Roboflow key the on-device index alone is used.
          </p>
        </div>

        {/* Result */}
        <div>
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4 px-1">
            Result
          </h3>
          {analyzing && <AIThinking label="Analyzing conjunctival pallor" />}
          {!analyzing && !result && (
            <div className="panel p-6 text-center text-slate-500 text-sm">
              Capture or load a sample image to run screening.
            </div>
          )}
          {!analyzing && result && image && <ScreeningResultCard image={image} result={result} />}
        </div>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 shrink-0 rounded-full bg-teal-600/20 border border-teal-700 text-teal-300 text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

function EyeDiagram({ good = false }: { good?: boolean }) {
  return (
    <svg viewBox="0 0 100 60" className="w-full h-14">
      <ellipse cx="50" cy="26" rx="34" ry="16" fill="#f3efe8" />
      <circle cx="50" cy="25" r="9" fill="#4a3526" />
      <circle cx="50" cy="25" r="4" fill="#120c08" />
      {good ? (
        <path d="M18,38 Q50,58 82,38 Q50,46 18,38" fill="#d98c84" />
      ) : (
        <path d="M16,30 Q50,46 84,30" fill="none" stroke="#8a6248" strokeWidth="3" />
      )}
      <circle cx="50" cy="30" r="26" fill="none" stroke={good ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  );
}
