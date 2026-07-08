"use client";

import { HeartPulse, Code2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Footer() {
  const { t, lang } = useT();
  return (
    <footer className="border-t border-edge bg-panel mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-teal-400" />
          <span className="font-semibold text-slate-200">Swasthya Setu</span>
          <span className="font-bangla">স্বাস্থ্য সেতু</span>
        </div>
        <span className="hidden md:inline text-edge">|</span>
        <span className={cn(lang === "bn" && "font-bangla")}>{t("footer.tagline")}</span>
        <span className="md:ml-auto inline-flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 inline-flex items-center gap-1"
          >
            <Code2 className="w-4 h-4" /> GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
