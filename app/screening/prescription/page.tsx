"use client";

import { useState } from "react";
import AIThinking from "@/components/shared/AIThinking";
import { drawPrescriptionSample, dataUrlToBlob } from "@/components/screening/sample-images";
import { FileText, UploadCloud, Pill, AlertTriangle, BadgePercent } from "lucide-react";

interface GenericAlt {
  genericName: string;
  brandPriceBdt: number;
  genericPriceBdt: number;
  savingsPercent: number;
  dgdaApproved: boolean;
  inStock: boolean;
}

interface Medicine {
  brandName: string;
  genericName: string;
  genericNameBn: string;
  purpose_en: string;
  purpose_bn: string;
  dose_bn: string;
  frequency_bn: string;
  duration_bn: string;
  warnings_bn: string[];
  mustTakeWithFood: boolean;
  genericAlternative?: GenericAlt;
}

interface RxResult {
  doctorName: string | null;
  patientName: string | null;
  date: string | null;
  medicines: Medicine[];
  overallNotes_en: string;
  safetyFlags: string[];
  readabilityScore: number;
  usedFallback?: boolean;
}

export default function PrescriptionScannerPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RxResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function analyzeBlob(blob: Blob, previewUrl: string) {
    setPreview(previewUrl);
    setResult(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", blob, "prescription.jpg");
      const res = await fetch("/api/prescription", { method: "POST", body: fd });
      setResult(await res.json());
    } catch {
      const { FALLBACK_PRESCRIPTION } = await import("@/lib/mock-responses");
      setResult(FALLBACK_PRESCRIPTION as unknown as RxResult);
    }
    setBusy(false);
  }

  function onFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    analyzeBlob(file, url);
  }

  async function useSample() {
    const dataUrl = await drawPrescriptionSample();
    analyzeBlob(dataUrlToBlob(dataUrl), dataUrl);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-800">
          <FileText className="w-6 h-6 text-blue-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Prescription Scanner (Roboflow OCR + Gemini)
          </h1>
          <p className="text-sm text-slate-400">
            Upload any handwritten or printed prescription — Roboflow&apos;s hosted DocTR OCR
            extracts the text, then Gemini explains every medicine in plain Bangla. Live two-stage
            API pipeline.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* LEFT: upload */}
        <div className="panel p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFile(e.dataTransfer.files?.[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-teal-500 bg-teal-600/10" : "border-edge hover:border-teal-700"
            }`}
            onClick={() => document.getElementById("rx-file")?.click()}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-slate-500" />
            <p className="text-sm text-slate-300 mt-3">
              Drag &amp; drop prescription image, or click to upload
            </p>
            <p className="text-xs text-slate-500 mt-1">JPEG / PNG / WebP</p>
            <input
              id="rx-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <button onClick={useSample} className="btn-primary w-full mt-3 text-sm">
            Use Sample Prescription (Bangla, handwritten-style)
          </button>

          {preview && (
            <div className="mt-4 card-surface overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Prescription preview" className="w-full max-h-[420px] object-contain bg-white" />
            </div>
          )}
        </div>

        {/* RIGHT: results */}
        <div className="space-y-3">
          {busy && <AIThinking label="Reading the prescription (Roboflow OCR → Gemini)" />}

          {!busy && !result && (
            <div className="panel p-8 text-center text-slate-500 text-sm">
              Analysis results will appear here.
            </div>
          )}

          {result && (
            <div className="space-y-3 animate-fade-in">
              <div className="panel p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                  Prescription Analysis
                  {result.usedFallback && (
                    <span className="ml-2 text-amber-400 normal-case">(offline demo data)</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Info label="Doctor" value={result.doctorName ?? "Unable to read"} />
                  <Info label="Date" value={result.date ?? "Not visible"} />
                  <Info label="Patient" value={result.patientName ?? "Not specified"} />
                  <Info label="Readability" value={`${result.readabilityScore}/100`} />
                </div>
              </div>

              {result.medicines.map((m, i) => (
                <div key={i} className="panel p-4">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-400" />
                    <p className="font-bold text-slate-100">
                      {"①②③④⑤⑥"[i] ?? `${i + 1}.`} {m.brandName}{" "}
                      <span className="text-slate-400 font-normal">({m.genericName})</span>
                    </p>
                  </div>
                  <div className="mt-2 space-y-1 text-sm font-bangla text-slate-300">
                    <p>
                      <span className="text-slate-500 font-sans text-xs">কাজ:</span> {m.purpose_bn}{" "}
                      <span className="text-slate-500">({m.purpose_en})</span>
                    </p>
                    <p>
                      <span className="text-slate-500 font-sans text-xs">মাত্রা:</span> {m.frequency_bn},{" "}
                      {m.dose_bn} — {m.duration_bn}
                    </p>
                    <p>
                      <span className="text-slate-500 font-sans text-xs">সময়:</span>{" "}
                      {m.mustTakeWithFood ? "খাবার পরে" : "খালি পেটে / খাবারের আগে"}
                    </p>
                    {m.warnings_bn?.map((w) => (
                      <p key={w} className="text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {w}
                      </p>
                    ))}
                  </div>

                  {m.genericAlternative && (
                    <div className="mt-3 card-surface p-2.5 border-teal-900 text-xs flex items-center gap-2 flex-wrap">
                      <BadgePercent className="w-4 h-4 text-teal-400" />
                      <span className="text-slate-300">
                        Generic alternative: <b className="text-teal-300">{m.genericAlternative.genericName}</b>{" "}
                        — ৳{m.genericAlternative.genericPriceBdt}{" "}
                        <span className="text-teal-400 font-semibold">
                          ({m.genericAlternative.savingsPercent}% cheaper than ৳
                          {m.genericAlternative.brandPriceBdt})
                        </span>
                      </span>
                      {m.genericAlternative.dgdaApproved && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-600/20 text-teal-300">
                          DGDA ✓
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="panel p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                  Overall Notes
                </p>
                <p className="text-sm text-slate-300">{result.overallNotes_en}</p>
                {result.safetyFlags?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.safetyFlags.map((f) => (
                      <li key={f} className="text-xs text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="text-[11px] text-slate-500 border border-edge rounded-lg p-2.5 font-bangla">
                ⚠ এটি শুধুমাত্র তথ্যের জন্য। ডাক্তারের পরামর্শ ছাড়া ওষুধ পরিবর্তন বা বন্ধ করবেন না।
                <span className="font-sans block mt-0.5 text-slate-600">
                  This is for information only. Do not change or stop medicines without doctor&apos;s advice.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-slate-200">{value}</p>
    </div>
  );
}
