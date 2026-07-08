"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartPulse, Menu, X, ShoppingCart, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useT, DictKey } from "@/lib/i18n";

const LINKS: { href: string; key: DictKey }[] = [
  { href: "/demo", key: "nav.demo" },
  { href: "/intake/sms", key: "nav.sms" },
  { href: "/intake/voice", key: "nav.voice" },
  { href: "/screening/anemia", key: "nav.screening" },
  { href: "/screening/prescription", key: "nav.prescription" },
  { href: "/medicine", key: "nav.medicines" },
  { href: "/doctors", key: "nav.doctors" },
  { href: "/appointments", key: "nav.appointments" },
  { href: "/dashboard", key: "nav.portal" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang } = useT();
  const setLang = useAppStore((s) => s.setLang);
  const hydrateLang = useAppStore((s) => s.hydrateLang);
  const hydrateCart = useAppStore((s) => s.hydrateCart);
  const cart = useAppStore((s) => s.cart);
  const setCartOpen = useAppStore((s) => s.setCartOpen);

  useEffect(() => {
    hydrateLang();
    hydrateCart();
  }, [hydrateLang, hydrateCart]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
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

        <nav className="hidden xl:flex items-center gap-0.5 ml-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap",
                lang === "bn" && "font-bangla",
                pathname === l.href
                  ? "bg-teal-600/20 text-teal-300 border border-teal-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-card"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="ml-auto xl:ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-edge bg-card text-sm text-slate-300 hover:border-teal-600 transition-colors"
          aria-label="Switch language"
          title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
        >
          <Languages className="w-4 h-4 text-teal-400" />
          <span className={cn("font-semibold", lang === "en" && "font-bangla")}>
            {lang === "en" ? "বাং" : "EN"}
          </span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 rounded-lg border border-edge bg-card text-slate-300 hover:border-teal-600 transition-colors"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-500 text-ink text-[10px] font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        <button
          className="xl:hidden text-slate-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="xl:hidden bg-panel border-t border-edge px-4 py-2 flex flex-col">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm",
                lang === "bn" && "font-bangla",
                pathname === l.href ? "text-teal-300 bg-teal-600/10" : "text-slate-300"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
