"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  MessageSquareText,
  Smartphone,
  Eye,
  Droplets,
  FileText,
  Pill,
  Stethoscope,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/intake/voice", label: "Voice Intake", icon: PhoneCall },
  { href: "/intake/sms", label: "SMS Intake", icon: MessageSquareText },
  { href: "/intake/app", label: "App Intake", icon: Smartphone },
  { href: "/screening/anemia", label: "Anemia Screening", icon: Eye },
  { href: "/screening/jaundice", label: "Jaundice Screening", icon: Droplets },
  { href: "/screening/prescription", label: "Prescription Scanner", icon: FileText },
  { href: "/medicine", label: "Medicine Finder", icon: Pill },
  { href: "/doctors", label: "Doctor Booking", icon: Stethoscope },
  { href: "/dashboard", label: "Doctor Dashboard", icon: LayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <nav className="panel p-2 sticky top-20 flex flex-col gap-0.5">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === item.href
                ? "bg-teal-600/20 text-teal-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-card"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
