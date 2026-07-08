"use client";

import { useAppStore, Lang } from "./store";

// Lightweight bilingual dictionary for UI chrome.
// Clinical content is already bilingual inline throughout the app.
const DICT = {
  // Navbar
  "nav.demo": { en: "Demo Hub", bn: "ডেমো হাব" },
  "nav.sms": { en: "SMS", bn: "এসএমএস" },
  "nav.voice": { en: "Voice", bn: "ভয়েস" },
  "nav.screening": { en: "Screening", bn: "স্ক্রিনিং" },
  "nav.prescription": { en: "Rx Scan", bn: "প্রেসক্রিপশন" },
  "nav.medicines": { en: "Medicines", bn: "ওষুধ" },
  "nav.doctors": { en: "Doctors", bn: "ডাক্তার" },
  "nav.appointments": { en: "Appointments", bn: "অ্যাপয়েন্টমেন্ট" },
  "nav.portal": { en: "Doctor Portal", bn: "ডাক্তার পোর্টাল" },

  // Footer
  "footer.tagline": {
    en: "Offline-first AI telehealth for rural Bangladesh",
    bn: "গ্রামীণ বাংলাদেশের জন্য অফলাইন-ফার্স্ট AI টেলিহেলথ",
  },

  // Landing
  "hero.subtitle": {
    en: "Bridging 100 Million Rural Bangladeshis to Healthcare",
    bn: "১০ কোটি গ্রামীণ বাংলাদেশিকে স্বাস্থ্যসেবার সাথে যুক্ত করছি",
  },
  "hero.tryDemo": { en: "Try the Demo", bn: "ডেমো দেখুন" },
  "hero.viewDashboard": { en: "View Doctor Dashboard", bn: "ডাক্তার ড্যাশবোর্ড দেখুন" },
  "landing.channels": {
    en: "Three input channels · One AI pipeline",
    bn: "তিনটি চ্যানেল · একটি AI পাইপলাইন",
  },
  "landing.howItWorks": { en: "How it works", bn: "যেভাবে কাজ করে" },
  "landing.modules": { en: "4 Core Modules", bn: "৪টি মূল মডিউল" },

  // Cart / checkout
  "cart.title": { en: "Medicine Cart", bn: "ওষুধের কার্ট" },
  "cart.empty": { en: "Your cart is empty", bn: "আপনার কার্ট খালি" },
  "cart.addToCart": { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  "cart.subtotal": { en: "Subtotal", bn: "মোট মূল্য" },
  "cart.delivery": { en: "Delivery fee", bn: "ডেলিভারি চার্জ" },
  "cart.freeDelivery": { en: "FREE (order over ৳500)", bn: "ফ্রি (৳৫০০+ অর্ডারে)" },
  "cart.total": { en: "Total", bn: "সর্বমোট" },
  "cart.checkout": { en: "Proceed to Checkout", bn: "চেকআউট করুন" },
  "cart.placeOrder": { en: "Place Order", bn: "অর্ডার করুন" },
  "cart.name": { en: "Full name", bn: "পুরো নাম" },
  "cart.phone": { en: "Phone number", bn: "ফোন নম্বর" },
  "cart.address": { en: "Delivery address", bn: "ডেলিভারি ঠিকানা" },
  "cart.payment": { en: "Payment method", bn: "পেমেন্ট মাধ্যম" },
  "cart.orderPlaced": { en: "Order confirmed!", bn: "অর্ডার নিশ্চিত হয়েছে!" },
  "cart.orderDetail": {
    en: "Delivery within 2 hours from the nearest pharmacy. SMS confirmation sent.",
    bn: "নিকটস্থ ফার্মেসি থেকে ২ ঘণ্টার মধ্যে ডেলিভারি। এসএমএস নিশ্চিতকরণ পাঠানো হয়েছে।",
  },

  // Appointments
  "appt.title": { en: "My Appointments", bn: "আমার অ্যাপয়েন্টমেন্ট" },
  "appt.subtitle": {
    en: "Ongoing, upcoming and past consultations — all in one place.",
    bn: "চলমান, আসন্ন ও পূর্বের সব কনসালটেশন এক জায়গায়।",
  },
  "appt.ongoing": { en: "Ongoing", bn: "চলমান" },
  "appt.upcoming": { en: "Upcoming", bn: "আসন্ন" },
  "appt.past": { en: "Past", bn: "পূর্বের" },
  "appt.joinCall": { en: "Join Video Call", bn: "ভিডিও কলে যোগ দিন" },
  "appt.cancel": { en: "Cancel", bn: "বাতিল করুন" },
  "appt.details": { en: "Details", bn: "বিস্তারিত" },
  "appt.notes": { en: "Doctor's notes", bn: "ডাক্তারের নোট" },
  "appt.prescription": { en: "Prescription", bn: "প্রেসক্রিপশন" },
  "appt.none": { en: "No appointments here yet.", bn: "এখানে এখনো কোনো অ্যাপয়েন্টমেন্ট নেই।" },

  // Chat
  "chat.title": { en: "Health Assistant", bn: "স্বাস্থ্য সহকারী" },
  "chat.open": { en: "Chat in Bangla", bn: "চ্যাট করুন" },

  // Common
  "common.loading": { en: "Loading…", bn: "লোড হচ্ছে…" },
  "common.viewAll": { en: "View all", bn: "সব দেখুন" },
} as const;

export type DictKey = keyof typeof DICT;

export function useT() {
  const lang = useAppStore((s) => s.lang);
  const t = (key: DictKey) => DICT[key][lang];
  return { t, lang };
}

export function tFor(lang: Lang, key: DictKey) {
  return DICT[key][lang];
}
