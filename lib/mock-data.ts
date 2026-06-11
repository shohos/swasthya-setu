// Pre-built demo scenarios for the intake simulators.

export interface IntakeScenario {
  id: string;
  label: string;
  labelBn: string;
  expectedLevel: "RED" | "YELLOW" | "GREEN";
  answers: {
    name: string;
    age: string;
    problem: string;
    problemBn: string;
    duration: string;
    durationBn: string;
    other: string;
    otherBn: string;
  };
}

export const VOICE_SCENARIOS: IntakeScenario[] = [
  {
    id: "chest-pain",
    label: "Chest Pain Patient",
    labelBn: "বুকে ব্যথার রোগী",
    expectedLevel: "RED",
    answers: {
      name: "আব্দুল রহিম (Abdul Rahim)",
      age: "৬০ (60)",
      problem: "Severe chest pain spreading to my left arm, sweating a lot",
      problemBn: "বুকে খুব ব্যথা, বাম হাতে ছড়িয়ে পড়ছে, খুব ঘাম হচ্ছে",
      duration: "2 hours",
      durationBn: "২ ঘণ্টা ধরে",
      other: "Hard to breathe, feeling nauseous",
      otherBn: "শ্বাস নিতে কষ্ট হচ্ছে, বমি বমি ভাব",
    },
  },
  {
    id: "fever",
    label: "Fever Patient",
    labelBn: "জ্বরের রোগী",
    expectedLevel: "YELLOW",
    answers: {
      name: "রহিম মিয়া (Rahim Mia)",
      age: "২৫ (25)",
      problem: "High fever with body ache and headache",
      problemBn: "অনেক জ্বর, শরীর ব্যথা, মাথা ব্যথা",
      duration: "3 days",
      durationBn: "৩ দিন ধরে",
      other: "Not eating well, feeling weak",
      otherBn: "খেতে ইচ্ছা করে না, দুর্বল লাগে",
    },
  },
  {
    id: "pregnant",
    label: "Pregnant Woman",
    labelBn: "গর্ভবতী মহিলা",
    expectedLevel: "RED",
    answers: {
      name: "ফাতেমা বেগম (Fatema Begum)",
      age: "৩৮ (38)",
      problem: "8 months pregnant, severe headache and blurry vision",
      problemBn: "৮ মাসের গর্ভবতী, মাথা খুব ব্যথা, চোখে ঝাপসা দেখি",
      duration: "Since yesterday",
      durationBn: "গতকাল থেকে",
      other: "My feet are very swollen",
      otherBn: "পা অনেক ফুলে গেছে",
    },
  },
];

export const SMS_SCENARIOS: IntakeScenario[] = [
  {
    id: "chest-pain-sms",
    label: "Chest Pain Emergency",
    labelBn: "বুকে ব্যথা — জরুরি",
    expectedLevel: "RED",
    answers: {
      name: "Abdul Rahim",
      age: "60",
      problem: "Chest pain",
      problemBn: "বুকে ব্যথা",
      duration: "Today",
      durationBn: "আজ থেকে",
      other: "Sweating, breathless",
      otherBn: "ঘাম, শ্বাসকষ্ট",
    },
  },
  {
    id: "pregnant-sms",
    label: "Pregnant Woman",
    labelBn: "গর্ভবতী মহিলা",
    expectedLevel: "RED",
    answers: {
      name: "Fatema Begum",
      age: "38",
      problem: "Pregnancy problem - headache, blurred vision",
      problemBn: "গর্ভাবস্থায় মাথাব্যথা, চোখে ঝাপসা",
      duration: "1 day",
      durationBn: "১ দিন",
      other: "8 months pregnant, swollen feet",
      otherBn: "৮ মাসের গর্ভ, পা ফোলা",
    },
  },
  {
    id: "child-fever-sms",
    label: "Child with Fever",
    labelBn: "শিশুর জ্বর",
    expectedLevel: "YELLOW",
    answers: {
      name: "Amena Khatun (mother)",
      age: "3 (child)",
      problem: "My child has fever",
      problemBn: "আমার বাচ্চার জ্বর",
      duration: "2-3 days",
      durationBn: "২-৩ দিন",
      other: "Eating less, irritable",
      otherBn: "খাওয়া কম, খিটখিটে",
    },
  },
];

export const BOT_QUESTIONS = [
  { bn: "আপনার নাম কী?", en: "What is your name?" },
  { bn: "আপনার বয়স কত?", en: "How old are you?" },
  { bn: "আপনার প্রধান সমস্যা কী?", en: "What is your main problem?" },
  { bn: "কতদিন ধরে এই সমস্যা?", en: "How many days has this been going on?" },
  { bn: "আর কোনো সমস্যা আছে কি?", en: "Any other symptoms?" },
  { bn: "ধন্যবাদ। আপনার তথ্য নিবন্ধন করা হচ্ছে।", en: "Thank you. Registering your information." },
];

export const RESEARCH_TICKER = [
  "PHC Bangladesh — 8,690 patients validated with AI triage",
  "CHW Digital Health Study — 32,581 people served by digital CHW tools",
  "HemoGlobe — 84% anemia detection accuracy from conjunctiva imaging",
  "WHO SEARO — 1 doctor per 6,579 rural patients in Bangladesh",
  "BDHS 2022 — 40% of women of reproductive age are anemic",
  "DGHS — DHIS2 covers all 64 districts of Bangladesh",
  "a2i — 110M+ mobile connections in rural Bangladesh",
];

export const DEMO_VITALS = {
  anemia: {
    hemoglobin: "8.2 g/dL",
    severity: "Moderate Anemia Detected",
    level: "YELLOW" as const,
    confidence: 81,
    finding: "Conjunctival pallor indicates low hemoglobin",
    recommendation: "Clinical blood test required. Refer to upazila health complex.",
  },
  jaundice: {
    bilirubin: "4.6 mg/dL",
    severity: "Mild-Moderate Icterus Detected",
    level: "YELLOW" as const,
    confidence: 77,
    finding: "Scleral yellowing consistent with elevated bilirubin",
    recommendation: "Liver function test (LFT) required. Refer to upazila health complex.",
  },
};
