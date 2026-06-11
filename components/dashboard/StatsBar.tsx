"use client";

import { CaseDTO } from "@/lib/types";
import { Activity, AlertCircle, Clock3, Leaf, Timer } from "lucide-react";

export default function StatsBar({ cases }: { cases: CaseDTO[] }) {
  const red = cases.filter((c) => c.triageLevel === "RED").length;
  const yellow = cases.filter((c) => c.triageLevel === "YELLOW").length;
  const green = cases.filter((c) => c.triageLevel === "GREEN").length;

  const stats = [
    {
      label: "Total Cases Today",
      value: cases.length,
      icon: Activity,
      color: "text-teal-400",
      ring: "",
    },
    {
      label: "Red (Urgent)",
      value: red,
      icon: AlertCircle,
      color: "text-red-400",
      ring: red > 0 ? "animate-pulse border-red-600" : "",
    },
    {
      label: "Yellow (48h)",
      value: yellow,
      icon: Clock3,
      color: "text-amber-400",
      ring: "",
    },
    {
      label: "Green (Home Care)",
      value: green,
      icon: Leaf,
      color: "text-green-400",
      ring: "",
    },
    {
      label: "Avg Response Time",
      value: "18 min",
      icon: Timer,
      color: "text-blue-400",
      ring: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`panel p-4 ${s.ring}`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <s.icon className={`w-4 h-4 ${s.color}`} />
            {s.label}
          </div>
          <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
