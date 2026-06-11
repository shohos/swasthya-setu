import { BrainCircuit } from "lucide-react";
import LoadingDots from "./LoadingDots";

export default function AIThinking({ label = "Claude is analyzing" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 card-surface px-4 py-3 animate-fade-in">
      <div className="relative">
        <BrainCircuit className="w-6 h-6 text-teal-400" />
        <span className="absolute inset-0 rounded-full bg-teal-500/30 animate-pulse-ring" />
      </div>
      <span className="text-sm text-slate-300">{label}</span>
      <LoadingDots />
    </div>
  );
}
