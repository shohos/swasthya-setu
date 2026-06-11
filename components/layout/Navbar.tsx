"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeartPulse, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/demo", label: "Demo Hub" },
  { href: "/intake/sms", label: "SMS" },
  { href: "/intake/voice", label: "Voice" },
  { href: "/screening/anemia", label: "Screening" },
  { href: "/screening/prescription", label: "Prescription" },
  { href: "/medicine", label: "Medicines" },
  { href: "/doctors", label: "Doctors" },
  { href: "/dashboard", label: "Doctor Portal" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-teal-600/20 border border-teal-600">
            <HeartPulse className="w-5 h-5 text-teal-400" />
            <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse-ring" />
          </span>
          <span className="font-bold text-slate-100 leading-tight">
            Swasthya Setu
            <span className="block text-[10px] font-bangla font-medium text-teal-400 -mt-0.5">
              স্বাস্থ্য সেতু
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname === l.href
                  ? "bg-teal-600/20 text-teal-300 border border-teal-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-card"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="lg:hidden ml-auto text-slate-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden bg-panel border-t border-edge px-4 py-2 flex flex-col">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm",
                pathname === l.href ? "text-teal-300 bg-teal-600/10" : "text-slate-300"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
