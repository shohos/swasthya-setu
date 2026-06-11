"use client";

import { useEffect, useRef, useState } from "react";
import { BOT_QUESTIONS, VOICE_SCENARIOS, IntakeScenario } from "@/lib/mock-data";
import ProcessingPanel, { PipelineStep } from "./ProcessingPanel";
import { TriageResult } from "@/lib/mock-responses";
import { Phone, PhoneOff, Mic } from "lucide-react";

type CallState = "idle" | "dialing" | "active" | "processing" | "done";

const INITIAL_STEPS: PipelineStep[] = [
  { label: "🎤 Recording patient audio…", status: "pending" },
  { label: "📝 Whisper STT: transcribing Bangla…", status: "pending" },
  { label: "🧠 Sending to Claude AI…", status: "pending" },
  { label: "⚡ Claude analyzing: extracting symptoms…", status: "pending" },
  { label: "✅ Triage complete", status: "pending" },
];

export default function VoiceBotSimulator() {
  const [state, setState] = useState<CallState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [speaking, setSpeaking] = useState<"AI" | "Patient" | null>(null);
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<(TriageResult & { caseId?: string | null }) | null>(null);
  const [input, setInput] = useState("");
  const [scenario, setScenario] = useState<IntakeScenario | null>(null);
  const answers = useRef<string[]>([]);

  useEffect(() => {
    if (state !== "active") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  function startCall(sc?: IntakeScenario) {
    setScenario(sc ?? null);
    setState("dialing");
    setSeconds(0);
    setQIndex(0);
    setTranscript([]);
    setResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s })));
    answers.current = [];
    setTimeout(() => {
      setState("active");
      askQuestion(0);
    }, 2200);
  }

  function askQuestion(i: number) {
    setSpeaking("AI");
    setQIndex(i);
    setTranscript((t) => [...t, { speaker: "AI", text: BOT_QUESTIONS[i].bn }]);
    setTimeout(() => setSpeaking(null), 1600);
  }

  function scenarioAnswer(i: number): string {
    if (!scenario) return "";
    const a = scenario.answers;
    return [a.name, a.age, a.problemBn, a.durationBn, a.otherBn][i] ?? "";
  }

  function submitAnswer(text: string) {
    if (!text.trim() || state !== "active") return;
    setSpeaking("Patient");
    setTranscript((t) => [...t, { speaker: "Patient", text }]);
    answers.current.push(text);
    setInput("");
    setTimeout(() => {
      setSpeaking(null);
      const next = qIndex + 1;
      if (next < BOT_QUESTIONS.length - 1) {
        askQuestion(next);
      } else {
        // closing message then process
        setTranscript((t) => [...t, { speaker: "AI", text: BOT_QUESTIONS[5].bn }]);
        setState("processing");
        runPipeline();
      }
    }, 900);
  }

  async function runPipeline() {
    const advance = (i: number) =>
      setSteps((prev) =>
        prev.map((s, j) => ({
          ...s,
          status: j < i ? "done" : j === i ? "active" : "pending",
        }))
      );

    advance(0);
    await wait(900);
    advance(1);
    await wait(1100);
    advance(2);

    const labels = ["Name", "Age", "Main problem", "Duration", "Other symptoms"];
    const fullTranscript = answers.current
      .map((a, i) => `${labels[i] ?? "Answer"}: ${a}`)
      .join("\n");

    let triage: TriageResult & { caseId?: string | null };
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fullTranscript,
          channel: "VOICE",
          rawAnswers: Object.fromEntries(labels.map((l, i) => [l, answers.current[i] ?? ""])),
        }),
      });
      triage = await res.json();
    } catch {
      triage = (await import("@/lib/mock-responses")).getFallbackTriage(fullTranscript);
    }

    advance(3);
    await wait(800);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
    setResult(triage);
    setState("done");
  }

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* LEFT: Patient phone */}
      <div className="panel p-5 flex flex-col items-center">
        <h3 className="font-bold text-slate-100 text-sm uppercase tracking-widest self-start mb-4">
          Patient&apos;s Phone
        </h3>

        {/* phone mockup */}
        <div className="w-full max-w-[300px] bg-ink border-2 border-edge rounded-[2rem] p-4 flex flex-col items-center min-h-[420px]">
          <div className="w-16 h-1.5 bg-edge rounded-full mb-4" />

          {state === "idle" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 w-full">
              <p className="text-slate-400 text-sm text-center">
                Call the Swasthya Setu hotline
              </p>
              <p className="text-3xl font-mono text-teal-300">16789</p>
              <button
                onClick={() => startCall()}
                className="btn-primary rounded-full w-16 h-16 flex items-center justify-center"
                aria-label="Start call"
              >
                <Phone className="w-7 h-7" />
              </button>
              <div className="w-full mt-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 text-center mb-2">
                  Or run a pre-built scenario
                </p>
                <div className="flex flex-col gap-1.5">
                  {VOICE_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => startCall(sc)}
                      className="btn-secondary text-xs py-1.5"
                    >
                      {sc.label} <span className="font-bangla text-slate-500">· {sc.labelBn}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {state === "dialing" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <p className="text-slate-300">Calling 16789…</p>
              <Waveform active />
              <p className="text-xs text-slate-500">Connecting to AI health line</p>
            </div>
          )}

          {(state === "active" || state === "processing" || state === "done") && (
            <div className="flex flex-col items-center flex-1 w-full gap-3">
              <div className="flex items-center gap-2 text-xs text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                {state === "active" ? "Call connected" : "Call ended"} ·{" "}
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </div>

              <div className="text-center min-h-[20px] text-[11px] text-slate-500">
                {speaking === "AI" && "🔊 AI Speaking…"}
                {speaking === "Patient" && (
                  <span className="inline-flex items-center gap-1">
                    <Mic className="w-3 h-3 text-blue-400" /> Patient Speaking…
                  </span>
                )}
              </div>
              <Waveform active={speaking !== null} color={speaking === "Patient" ? "#60a5fa" : "#2dd4bf"} />

              {state === "active" && (
                <>
                  <p className="font-bangla text-lg text-slate-100 text-center leading-relaxed px-2">
                    {BOT_QUESTIONS[qIndex].bn}
                  </p>
                  <p className="text-[11px] text-slate-500 text-center -mt-2">
                    {BOT_QUESTIONS[qIndex].en}
                  </p>

                  {scenario ? (
                    <button
                      onClick={() => submitAnswer(scenarioAnswer(qIndex))}
                      className="btn-primary text-sm w-full"
                    >
                      ▶ Patient answers (auto)
                    </button>
                  ) : (
                    <form
                      className="w-full flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitAnswer(input);
                      }}
                    >
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type patient's reply…"
                        className="input-dark text-sm font-bangla"
                        autoFocus
                      />
                      <button type="submit" className="btn-primary px-3 text-sm">
                        Say
                      </button>
                    </form>
                  )}
                </>
              )}

              {state === "processing" && (
                <p className="font-bangla text-base text-slate-300 text-center">
                  ধন্যবাদ। আপনার তথ্য নিবন্ধন করা হচ্ছে…
                </p>
              )}
              {state === "done" && (
                <p className="text-teal-300 text-sm text-center">
                  ✅ Registered. SMS confirmation sent.
                </p>
              )}

              <button
                onClick={() => setState("idle")}
                className="mt-auto bg-red-600/80 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
                aria-label="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: system processing */}
      <ProcessingPanel
        steps={steps}
        transcript={transcript}
        result={result}
        caseId={result?.caseId}
      />
    </div>
  );
}

function Waveform({ active, color = "#2dd4bf" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full transition-all"
          style={{
            backgroundColor: color,
            height: active ? `${6 + ((i * 13) % 22)}px` : "4px",
            opacity: active ? 0.9 : 0.3,
            animation: active ? `pulse 0.${4 + (i % 5)}s ease-in-out infinite alternate` : undefined,
          }}
        />
      ))}
    </div>
  );
}
