import PatientIntakeForm from "@/components/intake/PatientIntakeForm";
import { Smartphone } from "lucide-react";

export const metadata = { title: "App Intake — Swasthya Setu" };

export default function AppIntakePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-800">
          <Smartphone className="w-6 h-6 text-purple-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">App-Based Intake (CHW Mode)</h1>
          <p className="text-sm text-slate-400">
            Structured intake used by Community Health Workers — same Gemini triage pipeline as
            voice and SMS.
          </p>
        </div>
      </div>
      <PatientIntakeForm />
    </div>
  );
}
