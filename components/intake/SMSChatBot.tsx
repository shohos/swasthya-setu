"use client";

import { useEffect, useRef, useState } from "react";
import { SMS_SCENARIOS, IntakeScenario } from "@/lib/mock-data";
import ProcessingPanel, { PipelineStep } from "./ProcessingPanel";
import { TriageResult } from "@/lib/mock-responses";
import { Signal, BatteryMedium } from "lucide-react";

interface Bubble {
  from: "bot" | "patient";
  text: string;
}

type Phase = "start" | "name" | "age" | "problem" | "duration" | "other" | "processing" | "done";

const QUICK_REPLIES: Record<string, string[]> = {
  start: ["অসুস্থ", "HELP"],
  name: ["রহিম", "করিম", "ফাতেমা"],
  age: ["২৫", "৩৮", "৬০"],
  problem: ["জ্বর", "বুকে ব্যথা", "মাথাব্যথা", "অন্যান্য"],
  duration: ["১ দিন", "২-৩ দিন", "১ সপ্তাহ+"],
  other: ["ঘাম ও শ্বাসকষ্ট", "খাওয়া কমে গেছে", "নেই"],
};

const BOT_PROMPTS: Record<string, string> = {
  name: "স্বাস্থ্য সেতুতে স্বাগতম। আপনার নাম কী?",
  age: "বয়স কত?",
  problem: "সমস্যা কী?",
  duration: "কতদিন ধরে?",
  other: "আর কোনো সমস্যা আছে কি?",
  done: "ধন্যবাদ। আপনার কেস রেজিস্ট্রেশন হয়েছে। ডাক্তার শীঘ্রই যোগাযোগ করবেন।",
};

const INITIAL_STEPS: PipelineStep[] = [
  { label: "📨 SMS received via gateway (shortcode 16789)", status: "pending" },
  { label: "🤖 Conversation state machine: collecting answers", status: "pending" },
  { label: "🧠 Sending to Gemini AI…", status: "pending" },
  { label: "⚡ Gemini analyzing: triage + danger signs…", status: "pending" },
  { label: "✅ Case created · reply SMS queued", status: "pending" },
];

const ORDER: Phase[] = ["name", "age", "problem", "duration", "other"];

export default function SMSChatBot() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [phase, setPhase] = useState<Phase>("start");
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<(TriageResult & { caseId?: string | null }) | null>(null);
  const answers = useRef<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [bubbles]);

  function reset() {
    setBubbles([]);
    setPhase("start");
    setResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s })));
    answers.current = {};
  }

  function botSay(text: string, delay = 700) {
    setTimeout(() => setBubbles((b) => [...b, { from: "bot", text }]), delay);
  }

  function send(text: string) {
    const msg = text.trim();
    if (!msg) return;
    setBubbles((b) => [...b, { from: "patient", text: msg }]);
    setInput("");

    if (phase === "start") {
      setSteps((s) => s.map((x, i) => (i === 0 ? { ...x, status: "done" } : i === 1 ? { ...x, status: "active" } : x)));
      botSay(BOT_PROMPTS.name);
      setPhase("name");
      return;
    }

    const idx = ORDER.indexOf(phase);
    if (idx >= 0) {
      answers.current[phase] = msg;
      const next = ORDER[idx + 1];
      if (next) {
        botSay(BOT_PROMPTS[next]);
        setPhase(next);
      } else {
        botSay(BOT_PROMPTS.done);
        setPhase("processing");
        runPipeline();
      }
    }
  }

  async function runScenario(sc: IntakeScenario) {
    reset();
    const a = sc.answers;
    const sequence: [string, Phase][] = [
      ["অসুস্থ", "start"],
      [a.name, "name"],
      [a.age, "age"],
      [a.problemBn, "problem"],
      [a.durationBn, "duration"],
      [a.otherBn, "other"],
    ];
    let delay = 200;
    const local: Record<string, string> = {};
    for (const [text, ph] of sequence) {
      setTimeout(() => {
        setBubbles((b) => [...b, { from: "patient", text }]);
        if (ph !== "start") local[ph] = text;
        const idx = ORDER.indexOf(ph as Phase);
        const next = ph === "start" ? "name" : ORDER[idx + 1];
        if (next) {
          setTimeout(() => setBubbles((b) => [...b, { from: "bot", text: BOT_PROMPTS[next] }]), 500);
        }
      }, delay);
      delay += 1100;
    }
    setTimeout(() => {
      setBubbles((b) => [...b, { from: "bot", text: BOT_PROMPTS.done }]);
      answers.current = local;
      setPhase("processing");
      runPipeline();
    }, delay + 300);
  }

  async function runPipeline() {
    const advance = (i: number) =>
      setSteps((prev) =>
        prev.map((s, j) => ({
          ...s,
          status: j < i ? "done" : j === i ? "active" : "pending",
        }))
      );
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    advance(1);
    await wait(700);
    advance(2);

    const a = answers.current;
    const transcript = `Name: ${a.name ?? ""}\nAge: ${a.age ?? ""}\nProblem: ${a.problem ?? ""}\nDuration: ${a.duration ?? ""}\nOther: ${a.other ?? ""}`;

    let triage: TriageResult & { caseId?: string | null };
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, channel: "SMS", rawAnswers: a }),
      });
      triage = await res.json();
    } catch {
      triage = (await import("@/lib/mock-responses")).getFallbackTriage(transcript);
    }

    advance(3);
    await wait(800);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
    setResult(triage);
    setPhase("done");
    setBubbles((b) => [...b, { from: "bot", text: triage.outputs.patientSMSBn }]);
  }

  const transcript = bubbles.map((b) => ({
    speaker: b.from === "bot" ? "AI" : "Patient",
    text: b.text,
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-slate-500 self-center">Pre-built scenarios:</span>
        {SMS_SCENARIOS.map((sc) => (
          <button key={sc.id} onClick={() => runScenario(sc)} className="btn-secondary text-xs">
            {sc.label}
          </button>
        ))}
        <button onClick={reset} className="btn-secondary text-xs text-slate-500">
          Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Feature phone mockup */}
        <div className="panel p-5 flex flex-col items-center">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest self-start mb-4">
            Feature Phone (2G)
          </h3>
          <div className="w-full max-w-[300px] bg-[#23262b] border-2 border-edge rounded-[1.5rem] p-3 flex flex-col min-h-[460px]">
            {/* status bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pb-2 border-b border-edge">
              <span className="flex items-center gap-1">
                <Signal className="w-3 h-3" /> GP 2G
              </span>
              <span>16789</span>
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>

            {/* SMS thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 space-y-1.5 px-0.5 bg-ink/60 rounded-lg my-2 min-h-[280px] max-h-[300px]">
              {bubbles.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center mt-8 px-4">
                  Send <span className="font-bangla text-slate-300">&quot;অসুস্থ&quot;</span> or
                  &quot;HELP&quot; to 16789 to start
                </p>
              )}
              {bubbles.map((b, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs font-bangla animate-fade-in ${
                    b.from === "bot"
                      ? "bg-teal-600/25 border border-teal-800 text-slate-100"
                      : "ml-auto bg-slate-600/40 border border-slate-600 text-slate-200"
                  }`}
                >
                  {b.text}
                </div>
              ))}
            </div>

            {/* quick replies */}
            {phase !== "processing" && phase !== "done" && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(QUICK_REPLIES[phase] ?? []).map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] font-bangla px-2 py-1 rounded-full bg-card border border-edge text-slate-300 hover:border-teal-600"
                  >
                    [{q}]
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-1.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="বার্তা লিখুন…"
                className="input-dark text-xs font-bangla py-1.5"
                disabled={phase === "processing"}
              />
              <button type="submit" className="btn-primary text-xs px-3" disabled={phase === "processing"}>
                SEND
              </button>
            </form>
          </div>
        </div>

        <ProcessingPanel steps={steps} transcript={transcript} result={result} caseId={result?.caseId} />
      </div>
    </div>
  );
}
