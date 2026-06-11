"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PhoneCall,
  MessageSquareText,
  Smartphone,
  BrainCircuit,
  Eye,
  FileText,
  Pill,
  Stethoscope,
  LayoutDashboard,
  Send,
  Play,
  X,
  Timer,
} from "lucide-react";

const DEMOS = [
  { href: "/intake/sms", title: "SMS Intake Demo", time: "45 sec", icon: MessageSquareText, desc: "Feature-phone chatbot → Claude triage → case created", color: "border-blue-800 hover:border-blue-500 text-blue-400" },
  { href: "/intake/voice", title: "Voice Call Demo", time: "45 sec", icon: PhoneCall, desc: "IVR call simulation with Whisper STT pipeline", color: "border-teal-800 hover:border-teal-500 text-teal-400" },
  { href: "/screening/anemia", title: "Anemia Screening", time: "30 sec", icon: Eye, desc: "Conjunctiva photo → hemoglobin estimate + heatmap", color: "border-teal-800 hover:border-teal-500 text-teal-400" },
  { href: "/screening/prescription", title: "Prescription Scanner", time: "30 sec", icon: FileText, desc: "Real Claude Vision call on a handwritten prescription", color: "border-blue-800 hover:border-blue-500 text-blue-400" },
  { href: "/dashboard", title: "Doctor Dashboard", time: "45 sec", icon: LayoutDashboard, desc: "Risk-sorted queue, e-prescription, DHIS2 export", color: "border-purple-800 hover:border-purple-500 text-purple-400" },
];

const JOURNEY_STEPS = [
  {
    title: "1 · Fatema sends an SMS",
    bn: "৮ মাসের গর্ভবতী, মাথা খুব ব্যথা, চোখে ঝাপসা দেখি",
    desc: "Fatema Begum, 38, eight months pregnant in rural Kishoreganj, texts the 16789 shortcode from a feature phone: severe headache, blurred vision.",
    icon: MessageSquareText,
  },
  {
    title: "2 · AI collects the story",
    bn: "নাম? বয়স? কতদিন ধরে?",
    desc: "The SMS state machine collects name, age, symptoms, and duration in Bangla — no app, no internet, six messages total.",
    icon: Smartphone,
  },
  {
    title: "3 · Claude triages: RED",
    bn: "গর্ভাবস্থার বিপদ চিহ্ন!",
    desc: "Claude recognizes the pre-eclampsia danger pattern — headache + visual changes at 32 weeks — and assigns RED with a clinical rationale.",
    icon: BrainCircuit,
  },
  {
    title: "4 · Case lands on the doctor's queue",
    bn: "",
    desc: "The structured case (EN summary for the doctor, BN advice for the patient) appears at the top of the risk-sorted dashboard. A real case was just created — you'll see it in a moment.",
    icon: LayoutDashboard,
  },
  {
    title: "5 · Doctor acts in one click",
    bn: "",
    desc: "Dr. Nasrin Akter (Gynecologist, Netrokona) reviews, issues an urgent referral, and the e-prescription/referral goes back to Fatema by SMS.",
    icon: Stethoscope,
  },
  {
    title: "6 · Fatema gets care",
    bn: "আজই উপজেলা স্বাস্থ্য কমপ্লেক্সে যান।",
    desc: "Total time from SMS to actionable referral: under 20 minutes — in a district with 1 doctor per 6,000 people. Opening the live dashboard now…",
    icon: Send,
  },
];

const STEP_MS = 9000;

export default function DemoHubPage() {
  const router = useRouter();
  const [journey, setJourney] = useState(false);
  const [step, setStep] = useState(0);
  const posted = useRef(false);

  useEffect(() => {
    if (!journey) return;
    setStep(0);
    posted.current = false;
    const t = setInterval(() => {
      setStep((s) => {
        const next = s + 1;
        if (next >= JOURNEY_STEPS.length) {
          clearInterval(t);
          setTimeout(() => router.push("/dashboard"), 1500);
          return s;
        }
        return next;
      });
    }, STEP_MS);
    return () => clearInterval(t);
  }, [journey, router]);

  // At step 3, actually create the case via the real triage API.
  useEffect(() => {
    if (!journey || step < 2 || posted.current) return;
    posted.current = true;
    fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript:
          "Name: Fatema Begum\nAge: 38\nProblem: 8 months pregnant, severe headache, blurred vision, swollen feet\nDuration: 1 day",
        channel: "SMS",
        rawAnswers: {
          name: "Fatema Begum",
          age: "38",
          problem: "Pregnancy danger signs - headache, blurred vision",
          duration: "1 day",
        },
      }),
    }).catch(() => {});
  }, [journey, step]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Demo Hub</h1>
          <p className="text-sm text-slate-400">
            The whole system on one page — click any box in the architecture to jump in.
          </p>
        </div>
        <button
          onClick={() => setJourney(true)}
          className="btn-primary ml-auto flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Full Patient Journey (auto, ~90s)
        </button>
      </div>

      {/* ARCHITECTURE DIAGRAM */}
      <div className="panel p-5 overflow-x-auto">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4">
          System Architecture — live, every box is clickable
        </h2>
        <div className="min-w-[860px] grid grid-cols-5 gap-0 items-stretch">
          <ArchColumn title="Input Channels">
            <ArchBox href="/intake/voice" icon={PhoneCall} label="Voice / IVR" sub="Twilio + Whisper" color="teal" />
            <ArchBox href="/intake/sms" icon={MessageSquareText} label="SMS" sub="2G shortcode" color="blue" />
            <ArchBox href="/intake/app" icon={Smartphone} label="CHW App" sub="offline-first" color="purple" />
          </ArchColumn>

          <FlowArrows count={3} />

          <ArchColumn title="AI Pipeline">
            <ArchBox href="/intake/sms" icon={BrainCircuit} label="Claude Triage" sub="RED / YELLOW / GREEN" color="teal" tall />
            <ArchBox href="/screening/anemia" icon={Eye} label="CV Screening" sub="anemia · jaundice" color="teal" />
          </ArchColumn>

          <FlowArrows count={2} />

          <ArchColumn title="Care Layer">
            <ArchBox href="/dashboard" icon={LayoutDashboard} label="Doctor Portal" sub="risk-sorted queue" color="purple" tall />
            <ArchBox href="/screening/prescription" icon={FileText} label="Rx Reader" sub="Claude Vision" color="blue" />
            <ArchBox href="/medicine" icon={Pill} label="Medicine Finder" sub="generics + delivery" color="amber" />
            <ArchBox href="/doctors" icon={Stethoscope} label="Doctor Booking" sub="video / in-person" color="purple" />
          </ArchColumn>
        </div>
        <div className="min-w-[860px] flex items-center justify-end gap-2 mt-3 text-xs text-slate-500">
          <Send className="w-3.5 h-3.5 text-teal-400" />
          Output: Bangla SMS to patient · DHIS2 export to government · FHIR-ready records
        </div>
      </div>

      {/* DEMO LAUNCHERS */}
      <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mt-8 mb-4">
        Start a demo
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEMOS.map((d) => (
          <Link key={d.title} href={d.href}>
            <div className={`panel p-4 h-full border transition-all hover:-translate-y-0.5 ${d.color.split(" ").slice(0, 2).join(" ")}`}>
              <div className="flex items-center gap-2">
                <d.icon className={`w-5 h-5 ${d.color.split(" ").pop()}`} />
                <p className="font-bold text-slate-100">{d.title}</p>
                <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {d.time}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{d.desc}</p>
            </div>
          </Link>
        ))}
        <button onClick={() => setJourney(true)} className="text-left">
          <div className="panel p-4 h-full border border-teal-700 hover:border-teal-500 transition-all hover:-translate-y-0.5 bg-teal-600/5">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-teal-400" />
              <p className="font-bold text-slate-100">Full Patient Journey</p>
              <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                <Timer className="w-3 h-3" /> ~90 sec
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Auto-runs SMS → triage → dashboard → prescription with narration. Creates a real case.
            </p>
          </div>
        </button>
      </div>

      {/* AUTO-DEMO OVERLAY */}
      {journey && (
        <div className="fixed inset-0 z-[96] bg-ink/95 backdrop-blur flex items-center justify-center p-4">
          <button
            onClick={() => setJourney(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-200"
            aria-label="Exit auto-demo"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="max-w-xl w-full text-center">
            {/* progress */}
            <div className="flex gap-1.5 mb-8 justify-center">
              {JOURNEY_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < step ? "w-8 bg-teal-600" : i === step ? "w-12 bg-teal-400" : "w-8 bg-edge"
                  }`}
                />
              ))}
            </div>

            {(() => {
              const s = JOURNEY_STEPS[step];
              return (
                <div key={step} className="animate-slide-up">
                  <span className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-600/15 border border-teal-600 mb-6">
                    <s.icon className="w-9 h-9 text-teal-400" />
                    <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse-ring" />
                  </span>
                  <h2 className="text-2xl font-bold text-slate-100">{s.title}</h2>
                  {s.bn && (
                    <p className="font-bangla text-lg text-teal-300 mt-3">&ldquo;{s.bn}&rdquo;</p>
                  )}
                  <p className="text-slate-400 mt-4 leading-relaxed">{s.desc}</p>
                </div>
              );
            })()}

            <div className="flex justify-center gap-3 mt-10">
              <button
                onClick={() => setStep((s) => Math.min(s + 1, JOURNEY_STEPS.length - 1))}
                className="btn-secondary text-sm"
              >
                Skip ahead →
              </button>
              <Link href="/dashboard" className="btn-primary text-sm">
                Jump to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center mb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

const BOX_COLORS: Record<string, string> = {
  teal: "border-teal-800 hover:border-teal-500 text-teal-400",
  blue: "border-blue-800 hover:border-blue-500 text-blue-400",
  purple: "border-purple-800 hover:border-purple-500 text-purple-400",
  amber: "border-amber-800 hover:border-amber-500 text-amber-400",
};

function ArchBox({
  href,
  icon: Icon,
  label,
  sub,
  color,
  tall = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  color: string;
  tall?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`card-surface p-3 text-center transition-all hover:-translate-y-0.5 ${BOX_COLORS[color]} ${tall ? "py-5" : ""}`}
      >
        <Icon className="w-5 h-5 mx-auto" />
        <p className="text-xs font-bold text-slate-100 mt-1.5">{label}</p>
        <p className="text-[10px] text-slate-500">{sub}</p>
      </div>
    </Link>
  );
}

function FlowArrows({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="60" height="12" viewBox="0 0 60 12" className="opacity-80">
          <line
            x1="0"
            y1="6"
            x2="48"
            y2="6"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-dash-flow"
          />
          <polygon points="48,1 58,6 48,11" fill="#14b8a6" />
        </svg>
      ))}
    </div>
  );
}
