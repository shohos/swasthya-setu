"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { PhoneOff, X } from "lucide-react";

export default function VideoCallModal({
  doctorName,
  patientName = "Nasrin Sultana, 33F",
  onClose,
}: {
  doctorName: string;
  patientName?: string;
  onClose: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const c = setTimeout(() => setConnected(true), 2500);
    return () => clearTimeout(c);
  }, []);
  useEffect(() => {
    if (!connected || ended) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [connected, ended]);

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="panel w-full max-w-2xl max-h-[88vh] overflow-y-auto p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-100">Video Consult — {doctorName}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!ended ? (
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative bg-ink rounded-xl border border-edge aspect-video flex items-center justify-center overflow-hidden">
              {!connected ? (
                <div className="text-center">
                  <p className="text-slate-300">Connecting to {doctorName}…</p>
                  <div className="mt-3 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <span className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-4xl font-bold text-white">
                    {doctorName.replace("Dr. ", "").charAt(0)}
                  </span>
                  <span className="absolute top-3 left-3 text-xs bg-ink/80 px-2 py-1 rounded text-teal-300">
                    ● LIVE · {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                    {String(seconds % 60).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-3 right-3 w-20 h-14 bg-card border border-edge rounded-lg flex items-center justify-center text-[10px] text-slate-500">
                    You
                  </span>
                </>
              )}
            </div>

            <div className="card-surface p-3 text-xs space-y-2.5 overflow-y-auto max-h-[300px]">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Patient Info
              </p>
              <p className="text-slate-200 font-semibold text-sm">{patientName}</p>
              <div>
                <p className="text-slate-500">CV Screening</p>
                <p className="text-amber-300">Hb 8.2 g/dL (est.) — Moderate anemia, 81% conf.</p>
              </div>
              <div>
                <p className="text-slate-500">Symptom history</p>
                <p className="text-slate-300">Dizziness, fatigue, pale skin — 3 weeks</p>
              </div>
              <div>
                <p className="text-slate-500">Triage</p>
                <p className="text-amber-300 font-semibold">YELLOW — clinic within 48h</p>
              </div>
              <div>
                <p className="text-slate-500">Current medication</p>
                <p className="text-slate-300">Feofol (Iron + Folic) 1×daily</p>
              </div>
            </div>

            <button
              onClick={() => setEnded(true)}
              className="md:col-span-3 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="font-bold text-slate-100">Call ended ({seconds}s)</p>
            <p className="text-sm text-slate-400 mt-1">Issue e-prescription for this patient?</p>
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => {
                  pushToast({
                    title: "Prescription SMS sent",
                    message: "Prescription and follow-up advice sent to patient in Bangla",
                    variant: "success",
                  });
                  onClose();
                }}
                className="btn-primary text-sm"
              >
                Issue e-Prescription
              </button>
              <button onClick={onClose} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
