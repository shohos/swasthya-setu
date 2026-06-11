"use client";

import { useEffect, useState } from "react";
import { CaseDTO, MedicineDTO } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { X, Plus, Trash2, Send } from "lucide-react";

interface RxLine {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const FREQ_BN: Record<string, string> = {
  "1+0+0": "সকালে ১টি",
  "1+0+1": "সকালে ও রাতে ১টি করে",
  "1+1+1": "দিনে ৩ বার ১টি করে",
  "0+0+1": "রাতে ১টি",
};

export default function PrescriptionModal({
  c,
  onClose,
  onIssued,
}: {
  c: CaseDTO;
  onClose: () => void;
  onIssued: (rx: RxLine[]) => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [allMeds, setAllMeds] = useState<MedicineDTO[]>([]);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<RxLine[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/medicines")
      .then((r) => r.json())
      .then((d) => setAllMeds(d.medicines ?? []))
      .catch(() => {});
  }, []);

  const matches = query
    ? allMeds
        .filter(
          (m) =>
            m.brandName.toLowerCase().includes(query.toLowerCase()) ||
            m.genericName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  function addLine(med: MedicineDTO) {
    setLines([
      ...lines,
      { medicine: `${med.brandName} (${med.genericName})`, dosage: "1 tablet", frequency: "1+1+1", duration: "5 days" },
    ]);
    setQuery("");
  }

  async function issue() {
    if (lines.length === 0) return;
    setSending(true);
    try {
      await fetch("/api/cases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, prescription: lines, status: "REVIEWED" }),
      });
    } catch {}
    setSending(false);
    pushToast({
      title: "Prescription SMS sent",
      message: `Sent to ${c.patient?.phone ?? "+880170..."} in Bangla`,
      variant: "success",
    });
    onIssued(lines);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="panel w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-100">Issue e-Prescription</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-3">
          Patient: <span className="text-slate-200 font-semibold">{c.patient?.name}</span> (
          {c.patient?.age}
          {c.patient?.sex}) — {c.chiefComplaint.slice(0, 50)}
        </p>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine (e.g. Napa, Metformin)..."
            className="input-dark"
          />
          {matches.length > 0 && (
            <div className="absolute top-full inset-x-0 mt-1 card-surface z-10 overflow-hidden">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addLine(m)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-teal-600/10 flex justify-between"
                >
                  <span>
                    {m.brandName} <span className="text-slate-500">({m.genericName})</span>
                  </span>
                  <span className="text-teal-400">৳{m.priceBdt}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="card-surface p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">
                  {i + 1}. {l.medicine}
                </p>
                <button
                  onClick={() => setLines(lines.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <input
                  value={l.dosage}
                  onChange={(e) =>
                    setLines(lines.map((x, j) => (j === i ? { ...x, dosage: e.target.value } : x)))
                  }
                  className="input-dark text-xs"
                  placeholder="Dosage"
                />
                <select
                  value={l.frequency}
                  onChange={(e) =>
                    setLines(lines.map((x, j) => (j === i ? { ...x, frequency: e.target.value } : x)))
                  }
                  className="input-dark text-xs"
                >
                  {Object.keys(FREQ_BN).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <input
                  value={l.duration}
                  onChange={(e) =>
                    setLines(lines.map((x, j) => (j === i ? { ...x, duration: e.target.value } : x)))
                  }
                  className="input-dark text-xs"
                  placeholder="Duration"
                />
              </div>
            </div>
          ))}
          {lines.length === 0 && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Search above to add medicines
            </p>
          )}
        </div>

        {lines.length > 0 && (
          <div className="mt-4 card-surface p-3 border-teal-800">
            <p className="text-xs text-teal-400 font-semibold mb-1.5">
              SMS PREVIEW (Bangla) — sent to patient
            </p>
            <p className="text-sm font-bangla text-slate-200 leading-relaxed">
              প্রেসক্রিপশন ({c.patient?.nameBn ?? c.patient?.name}):{" "}
              {lines
                .map(
                  (l, i) =>
                    `${i + 1}) ${l.medicine.split(" (")[0]} — ${FREQ_BN[l.frequency] ?? l.frequency}, ${l.duration}`
                )
                .join(" ")}{" "}
              । খাবার পরে খাবেন। সমস্যা হলে ১৬২৬৩ নম্বরে কল করুন।
            </p>
          </div>
        )}

        <button onClick={issue} disabled={lines.length === 0 || sending} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {sending ? "Sending..." : "Send via SMS"}
        </button>
      </div>
    </div>
  );
}
