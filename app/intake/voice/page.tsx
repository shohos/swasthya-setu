import VoiceBotSimulator from "@/components/intake/VoiceBotSimulator";
import { PhoneCall } from "lucide-react";

export const metadata = { title: "Voice Call Intake — Swasthya Setu" };

export default function VoiceIntakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-teal-600/15 border border-teal-800">
          <PhoneCall className="w-6 h-6 text-teal-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Voice Call Intake (IVR Simulation)</h1>
          <p className="text-sm text-slate-400">
            Works on any phone with zero internet. In production this runs on Twilio Voice + Whisper
            STT — simulated here in-browser.
          </p>
        </div>
      </div>
      <VoiceBotSimulator />
    </div>
  );
}
