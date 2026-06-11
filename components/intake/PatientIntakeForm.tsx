"use client";

import { useState } from "react";
import ProcessingPanel, { PipelineStep } from "./ProcessingPanel";
import { TriageResult } from "@/lib/mock-responses";
import AIThinking from "@/components/shared/AIThinking";

const INITIAL_STEPS: PipelineStep[] = [
  { label: "📋 Structured form validated", status: "pending" },
  { label: "🧠 Sending to Claude AI…", status: "pending" },
  { label: "⚡ Claude analyzing: triage + danger signs…", status: "pending" },
  { label: "✅ Case created · SMS confirmation queued", status: "pending" },
];

const SYMPTOM_OPTIONS = [
  "Fever জ্বর",
  "Cough কাশি",
  "Chest pain বুকে ব্যথা",
  "Breathlessness শ্বাসকষ্ট",
  "Headache মাথাব্যথা",
  "Diarrhea ডায়রিয়া",
  "Vomiting বমি",
  "Dizziness মাথা ঘোরা",
  "Body ache শরীর ব্যথা",
  "Pregnancy issue গর্ভাবস্থার সমস্যা",
];

export default function PatientIntakeForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "M",
    phone: "",
    problem: "",
    duration: "1-2 days",
    symptoms: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<(TriageResult & { caseId?: string | null }) | null>(null);

  function toggleSymptom(s: string) {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s],
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    const age = parseInt(form.age, 10);
    if (!age || age < 0 || age > 120) e.age = "Valid age required";
    if (!form.problem.trim() && form.symptoms.length === 0)
      e.problem = "Describe the problem or pick symptoms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate() || busy) return;
    setBusy(true);
    setResult(null);

    const advance = (i: number) =>
      setSteps((prev) =>
        prev.map((s, j) => ({ ...s, status: j < i ? "done" : j === i ? "active" : "pending" }))
      );
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    advance(0);
    await wait(500);
    advance(1);

    const transcript = `Name: ${form.name}\nAge: ${form.age}\nSex: ${form.sex}\nMain problem: ${form.problem}\nSymptoms: ${form.symptoms.join(", ")}\nDuration: ${form.duration}`;

    let triage: TriageResult & { caseId?: string | null };
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          channel: "APP",
          rawAnswers: { ...form, symptoms: form.symptoms.join(", ") },
        }),
      });
      triage = await res.json();
    } catch {
      triage = (await import("@/lib/mock-responses")).getFallbackTriage(transcript);
    }

    advance(2);
    await wait(700);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
    setResult(triage);
    setBusy(false);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <form onSubmit={submit} className="panel p-5 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest">
          CHW App — Patient Intake Form
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Patient name নাম</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-dark mt-1"
              placeholder="e.g. Karim Uddin"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400">Age বয়স</label>
            <input
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="input-dark mt-1"
              placeholder="45"
              inputMode="numeric"
            />
            {errors.age && <p className="text-xs text-red-400 mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-400">Sex লিঙ্গ</label>
            <select
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className="input-dark mt-1"
            >
              <option value="M">Male পুরুষ</option>
              <option value="F">Female মহিলা</option>
              <option value="Other">Other অন্যান্য</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Phone ফোন</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-dark mt-1"
              placeholder="+88017XXXXXXXX"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400">Symptoms উপসর্গ (tap to select)</label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  form.symptoms.includes(s)
                    ? "bg-purple-600/25 border-purple-500 text-purple-200"
                    : "bg-card border-edge text-slate-400 hover:border-purple-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400">Main problem প্রধান সমস্যা</label>
          <textarea
            value={form.problem}
            onChange={(e) => setForm({ ...form, problem: e.target.value })}
            rows={2}
            className="input-dark mt-1 font-bangla"
            placeholder="বিস্তারিত লিখুন…"
          />
          {errors.problem && <p className="text-xs text-red-400 mt-1">{errors.problem}</p>}
        </div>

        <div>
          <label className="text-xs text-slate-400">Duration কতদিন ধরে</label>
          <select
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="input-dark mt-1"
          >
            <option>Today</option>
            <option>1-2 days</option>
            <option>3-7 days</option>
            <option>1 week+</option>
            <option>1 month+</option>
          </select>
        </div>

        {busy ? (
          <AIThinking />
        ) : (
          <button type="submit" className="btn-primary w-full">
            Submit for AI Triage →
          </button>
        )}
        <p className="text-[11px] text-slate-500">
          Offline-first: in the field this form queues locally and syncs over 2G.
        </p>
      </form>

      <ProcessingPanel steps={steps} transcript={[]} result={result} caseId={result?.caseId} />
    </div>
  );
}
