import type { Metadata } from "next";
import { Poppins, Noto_Sans_Bengali, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ChatWidget from "@/components/shared/ChatWidget";
import Toaster from "@/components/shared/Toaster";
import CartDrawer from "@/components/medicine/CartDrawer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Swasthya Setu | স্বাস্থ্য সেতু — AI Telehealth for Rural Bangladesh",
  description:
    "AI-powered offline-first telehealth platform bridging 100 million rural Bangladeshis to healthcare via voice, SMS, and app.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${bengali.variable} ${mono.variable} font-sans antialiased bg-ink text-slate-200 min-h-screen`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
        <ChatWidget />
        <CartDrawer />
        <Toaster />
      </body>
    </html>
  );
}
