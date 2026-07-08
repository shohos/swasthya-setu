"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/screening/anemia",
    label: "Anemia",
    labelBn: "রক্তস্বল্পতা",
    icon: Eye,
    active: "bg-teal-600/20 border-teal-600 text-teal-300",
  },
  {
    href: "/screening/jaundice",
    label: "Jaundice",
    labelBn: "জন্ডিস",
    icon: Droplets,
    active: "bg-amber-600/20 border-amber-600 text-amber-300",
  },
];

export default function ScreeningTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 mb-5 flex-wrap">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "px-4 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors",
            pathname === t.href
              ? t.active
              : "bg-card border-edge text-slate-400 hover:text-slate-200 hover:border-slate-600"
          )}
        >
          <t.icon className="w-4 h-4" />
          {t.label} <span className="font-bangla text-xs opacity-70">{t.labelBn}</span>
        </Link>
      ))}
    </div>
  );
}
