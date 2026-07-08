"use client";

import { useState } from "react";
import CameraCapture from "@/components/screening/CameraCapture";
import ScreeningResultCard from "@/components/screening/ScreeningResultCard";
import ScreeningTabs from "@/components/screening/ScreeningTabs";
import AIThinking from "@/components/shared/AIThinking";
import { drawEyeSample } from "@/components/screening/sample-images";
import { computeColorIndex } from "@/components/screening/color-index";
import type { ScreeningResult } from "@/lib/vision";
import { Droplets, CheckCircle2, XCircle } from "lucide-react";

export default function JaundiceScreeningPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  async function analyze(dataUrl: string) {
    setImage(dataUrl);
    setResult(null);
    setAnalyzing(true);
    try {
      // On-device color analysis first — runs even fully offline.
      const colorIndex = await computeColorIndex(dataUrl, "jaundice");
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "jaundice", colorIndex }),
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
        <span className="p-2.5 rounded-xl bg-amber-600/15 border border-amber-800">
          <Droplets className="w-6 h-6 text-amber-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Jaundice Screening (Computer Vision)</h1>
          <p className="text-sm text-slate-400">
            Bilirubin estimate from scleral yellowing — on-device color analysis verified by
            Roboflow CLIP zero-shot AI.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-4">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4">
            Instructions
          </h3>
          <ol className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-2.5">
              <Step n={1} /> Ask the patient to look left or right
            </li>
            <li className="flex gap-2.5">
              <Step n={2} /> Focus on the white of the eye (sclera)
            </li>
            <li className="flex gap-2.5">
              <Step n={3} /> Use natural daylight — avoid yellow indoor bulbs
            </li>
          </ol>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="card-surface p-3 border-green-900">
              <ScleraDiagram good />
              <p className="text-green-400 mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
              </p>
              <p className="text-slate-500 mt-0.5">Sclera fills the guide circle</p>
            </div>
            <div className="card-surface p-3 border-red-900">
              <ScleraDiagram />
              <p className="text-red-400 mt-2 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Incorrect
              </p>
              <p className="text-slate-500 mt-0.5">Yellow lighting skews color</p>
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4">
            Camera
          </h3>
          <CameraCapture
            onCapture={analyze}
            onUseSample={() => analyze(drawEyeSample("jaundice"))}
            guideColor="#fbbf24"
          />
          <p className="text-[11px] text-slate-500 mt-3">
            The scleral yellowness index is computed on-device; Roboflow CLIP adds a zero-shot
            icterus check. Without a Roboflow key the on-device index alone is used.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest mb-4 px-1">
            Result
          </h3>
          {analyzing && <AIThinking label="Analyzing scleral icterus" />}
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
    <span className="w-6 h-6 shrink-0 rounded-full bg-amber-600/20 border border-amber-700 text-amber-300 text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

function ScleraDiagram({ good = false }: { good?: boolean }) {
  return (
    <svg viewBox="0 0 100 60" className="w-full h-14">
      <ellipse cx="50" cy="30" rx="36" ry="17" fill={good ? "#f3efe8" : "#e8d48a"} />
      <circle cx={good ? 72 : 50} cy="30" r="9" fill="#4a3526" />
      <circle cx={good ? 72 : 50} cy="30" r="4" fill="#120c08" />
      <circle cx="42" cy="30" r="22" fill="none" stroke={good ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  );
}
