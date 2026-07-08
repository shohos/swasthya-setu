"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import { RESEARCH_TICKER } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  PhoneCall,
  MessageSquareText,
  Smartphone,
  Eye,
  FileText,
  Pill,
  Video,
  HeartPulse,
  ArrowRight,
  Mic,
  BrainCircuit,
  Stethoscope,
  Send,
} from "lucide-react";

function Counter({ target, duration = 1800 }: { target: string; duration?: number }) {
  // Animates the numeric portion of strings like "1:6,000", "40%", "100M+"
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const numMatch = target.match(/[\d,]+/g);
    if (!numMatch) {
      setDisplay(target);
      return;
    }
    const last = numMatch[numMatch.length - 1];
    const main = parseInt(last.replace(/,/g, ""), 10);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(main * eased);
      setDisplay(target.replace(last, value.toLocaleString()));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <span>{display}</span>;
}

const CHANNELS = [
  {
    href: "/intake/voice",
    icon: PhoneCall,
    title: "Voice Call",
    titleBn: "ভয়েস কল",
    desc: "Any phone, any carrier, zero internet. IVR + Whisper STT in Bangla.",
    accent: "group-hover:border-teal-500 group-hover:shadow-teal-900/40",
    iconColor: "text-teal-400 bg-teal-600/15 border-teal-800",
  },
  {
    href: "/intake/sms",
    icon: MessageSquareText,
    title: "SMS",
    titleBn: "এসএমএস",
    desc: "Feature phone, 2G, Bangla text. Structured chatbot over plain SMS.",
    accent: "group-hover:border-blue-500 group-hover:shadow-blue-900/40",
    iconColor: "text-blue-400 bg-blue-600/15 border-blue-800",
  },
  {
    href: "/intake/app",
    icon: Smartphone,
    title: "Mobile App",
    titleBn: "মোবাইল অ্যাপ",
    desc: "Offline-first app for CHWs. Syncs when 2G appears.",
    accent: "group-hover:border-purple-500 group-hover:shadow-purple-900/40",
    iconColor: "text-purple-400 bg-purple-600/15 border-purple-800",
  },
];

const STEPS = [
  { icon: PhoneCall, title: "Patient Calls/Texts", detail: "Toll-free IVR or SMS shortcode — works on a ৳1,500 feature phone." },
  { icon: Mic, title: "AI Collects Symptoms", detail: "Whisper speech-to-text in Bangla; structured question flow." },
  { icon: BrainCircuit, title: "AI Triages", detail: "RED / YELLOW / GREEN risk with danger-sign detection." },
  { icon: Stethoscope, title: "Doctor Reviews", detail: "Risk-sorted queue; e-prescription in one click." },
  { icon: Send, title: "Patient Gets Care", detail: "Bangla SMS with advice, prescription, and referral." },
];

const MODULES = [
  {
    href: "/screening/anemia",
    icon: Eye,
    title: "CV Screening",
    desc: "Anemia & jaundice detected from eye photos — on-device color analysis + Roboflow CLIP.",
    color: "border-teal-800 hover:border-teal-500",
    iconC: "text-teal-400",
  },
  {
    href: "/screening/prescription",
    icon: FileText,
    title: "Prescription Reader",
    desc: "Handwritten Bangla prescriptions decoded by Vision OCR + Gemini.",
    color: "border-blue-800 hover:border-blue-500",
    iconC: "text-blue-400",
  },
  {
    href: "/medicine",
    icon: Pill,
    title: "Medicine Finder",
    desc: "Find, compare generics, and order medicines locally.",
    color: "border-amber-800 hover:border-amber-500",
    iconC: "text-amber-400",
  },
  {
    href: "/doctors",
    icon: Video,
    title: "Doctor Booking",
    desc: "Video consult or in-person appointment with upfront fees.",
    color: "border-purple-800 hover:border-purple-500",
    iconC: "text-purple-400",
  },
];

export default function LandingPage() {
  const { t, lang } = useT();
  const bn = lang === "bn";
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-10 text-center relative">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-600/15 border border-teal-600 mb-6">
            <HeartPulse className="w-10 h-10 text-teal-400" />
            <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse-ring" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            SWASTHYA SETU
          </h1>
          <p className="font-bangla text-2xl sm:text-3xl text-slate-300 mt-2">স্বাস্থ্য সেতু</p>
          <p className={cn("text-lg sm:text-xl text-slate-400 mt-4 max-w-2xl mx-auto", bn && "font-bangla")}>
            {t("hero.subtitle")}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
            <Stat value="1:6,000" label="Doctor-to-patient ratio in rural BD" />
            <Stat value="40%" label="Women with undetected anemia" />
            <Stat value="100M+" label="Underserved rural patients" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/demo" className={cn("btn-primary text-base px-6 py-3 inline-flex items-center justify-center gap-2", bn && "font-bangla")}>
              {t("hero.tryDemo")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className={cn("btn-secondary text-base px-6 py-3 inline-flex items-center justify-center gap-2", bn && "font-bangla")}>
              {t("hero.viewDashboard")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ECG line */}
        <svg viewBox="0 0 1200 80" className="w-full h-16 mt-4" preserveAspectRatio="none">
          <path
            d="M0,40 L150,40 L170,40 L185,12 L200,68 L215,40 L260,40 L420,40 L440,40 L455,8 L470,72 L485,40 L530,40 L700,40 L720,40 L735,15 L750,65 L765,40 L820,40 L980,40 L1000,40 L1015,10 L1030,70 L1045,40 L1100,40 L1200,40"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeDasharray="1200"
            className="animate-ecg"
            style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.6))" }}
          />
        </svg>
      </section>

      {/* THREE CHANNELS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className={cn("text-center text-sm uppercase tracking-widest text-slate-500 font-bold mb-6", bn && "font-bangla tracking-normal")}>
          {t("landing.channels")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CHANNELS.map((c) => (
            <Link key={c.href} href={c.href} className="group">
              <div
                className={`panel p-6 h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl ${c.accent}`}
              >
                <span className={`inline-flex p-3 rounded-xl border ${c.iconColor}`}>
                  <c.icon className="w-6 h-6" />
                </span>
                <h3 className="font-bold text-lg text-slate-100 mt-4">
                  {c.title} <span className="font-bangla text-sm text-slate-400">{c.titleBn}</span>
                </h3>
                <p className="text-sm text-slate-400 mt-2">{c.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-teal-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch demo <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className={cn("text-2xl font-bold text-slate-100 text-center mb-8", bn && "font-bangla")}>
          {t("landing.howItWorks")}
        </h2>
        <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-3 snap-x">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="group relative panel p-4 min-w-[220px] md:min-w-0 snap-start hover:border-teal-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-teal-600/20 border border-teal-700 text-teal-300 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <s.icon className="w-5 h-5 text-teal-400" />
                {i < STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 ml-auto hidden md:block" />
                )}
              </div>
              <h3 className="font-semibold text-slate-100 mt-3 text-sm">{s.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className={cn("text-2xl font-bold text-slate-100 text-center mb-2", bn && "font-bangla")}>
          {t("landing.modules")}
        </h2>
        <p className="text-center text-sm text-slate-400 mb-8">
          Each module works offline-first and feeds the same patient record.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href}>
              <div className={`panel p-5 h-full border transition-all hover:-translate-y-0.5 ${m.color}`}>
                <m.icon className={`w-7 h-7 ${m.iconC}`} />
                <h3 className="font-bold text-slate-100 mt-3">{m.title}</h3>
                <p className="text-sm text-slate-400 mt-1.5">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BUSINESS MODEL STRIP */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="panel p-5 grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-teal-400 font-bold text-xs uppercase tracking-wide">Revenue Model</p>
            <p className="text-slate-300 mt-1">
              ৳150–400 consult fees (doctor-set) + 8% pharmacy delivery commission
            </p>
          </div>
          <div>
            <p className="text-teal-400 font-bold text-xs uppercase tracking-wide">Government Path</p>
            <p className="text-slate-300 mt-1">
              DHIS2 export aligns with DGHS reporting; CHW workflow fits the a2i digital health strategy
            </p>
          </div>
          <div>
            <p className="text-teal-400 font-bold text-xs uppercase tracking-wide">Scale Ready</p>
            <p className="text-slate-300 mt-1">
              FHIR-ready case records; modular channels — IVR scales via Twilio or local telco USSD
            </p>
          </div>
        </div>
      </section>

      {/* RESEARCH TICKER */}
      <section className="border-y border-edge bg-panel py-3 overflow-hidden">
        <div className="flex w-max animate-ticker gap-12">
          {[...RESEARCH_TICKER, ...RESEARCH_TICKER].map((r, i) => (
            <span key={i} className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> {r}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="panel p-4">
      <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">
        <Counter target={value} />
      </p>
      <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
