// Pre-computed fallback responses used when the AI APIs are unavailable
// (missing key, quota exceeded, network failure) so the demo never breaks.

export interface TriageResult {
  patientInfo: { name: string; nameBn: string; age: number; sex: string };
  clinicalData: {
    chiefComplaint: string;
    chiefComplaintBn: string;
    symptoms: string[];
    symptomsBn: string[];
    durationDays: number;
    associatedSymptoms: string[];
  };
  triageAssessment: {
    level: "RED" | "YELLOW" | "GREEN";
    rationale: string;
    dangerSigns: string[];
    recommendedAction: "immediate_emergency" | "clinic_48h" | "home_care";
    timeframeHours: number;
  };
  outputs: {
    doctorSummaryEn: string;
    patientSMSBn: string;
    homeCareBn: string[];
    followUpInstructions: string;
  };
  _fallback?: boolean;
}

const chestPain: TriageResult = {
  patientInfo: { name: "Abdul Rahim", nameBn: "আব্দুল রহিম", age: 60, sex: "M" },
  clinicalData: {
    chiefComplaint: "Chest pain radiating to left arm with sweating",
    chiefComplaintBn: "বুকে ব্যথা, বাম হাতে ছড়াচ্ছে, ঘাম হচ্ছে",
    symptoms: ["chest pain", "left arm radiation", "sweating", "shortness of breath"],
    symptomsBn: ["বুকে ব্যথা", "বাম হাতে ব্যথা", "ঘাম", "শ্বাসকষ্ট"],
    durationDays: 0,
    associatedSymptoms: ["nausea"],
  },
  triageAssessment: {
    level: "RED",
    rationale:
      "Central chest pain with radiation, diaphoresis and dyspnea in a 60-year-old male is concerning for acute coronary syndrome and requires immediate emergency evaluation.",
    dangerSigns: ["Chest pain with radiation", "Diaphoresis", "Dyspnea"],
    recommendedAction: "immediate_emergency",
    timeframeHours: 1,
  },
  outputs: {
    doctorSummaryEn:
      "60M with acute central chest pain radiating to the left arm, with sweating and breathlessness. Pattern concerning for ACS. Immediate referral to emergency facility advised; ECG and troponin needed.",
    patientSMSBn:
      "জরুরি অবস্থা! এখনই নিকটস্থ হাসপাতালে যান। দেরি করবেন না। অ্যাম্বুলেন্স: ১৬২৬৩",
    homeCareBn: [],
    followUpInstructions:
      "Go to the nearest emergency facility immediately. Do not wait for symptoms to improve.",
  },
};

const fever: TriageResult = {
  patientInfo: { name: "Rahim Mia", nameBn: "রহিম মিয়া", age: 25, sex: "M" },
  clinicalData: {
    chiefComplaint: "Fever for 3 days with body ache and headache",
    chiefComplaintBn: "৩ দিন ধরে জ্বর, শরীর ও মাথা ব্যথা",
    symptoms: ["fever", "body ache", "headache", "weakness"],
    symptomsBn: ["জ্বর", "শরীর ব্যথা", "মাথাব্যথা", "দুর্বলতা"],
    durationDays: 3,
    associatedSymptoms: ["reduced appetite"],
  },
  triageAssessment: {
    level: "YELLOW",
    rationale:
      "Fever persisting 3+ days in a dengue/typhoid endemic area warrants clinical review and basic investigations within 48 hours.",
    dangerSigns: [],
    recommendedAction: "clinic_48h",
    timeframeHours: 48,
  },
  outputs: {
    doctorSummaryEn:
      "25M with 3 days of high-grade fever, myalgia and headache. Dengue and typhoid should be considered. Recommend CBC and NS1 antigen; clinical review within 48 hours.",
    patientSMSBn:
      "৩ দিনের জ্বর। ২ দিনের মধ্যে ডাক্তার দেখান। প্রচুর পানি খান। শুধু প্যারাসিটামল নিন।",
    homeCareBn: ["প্রচুর পানি ও তরল খাবার খান", "বিশ্রাম নিন", "জ্বরে প্যারাসিটামল নিন"],
    followUpInstructions:
      "Seek emergency care if bleeding, severe abdominal pain, persistent vomiting, or drowsiness develops.",
  },
};

const pregnancy: TriageResult = {
  patientInfo: { name: "Fatema Begum", nameBn: "ফাতেমা বেগম", age: 38, sex: "F" },
  clinicalData: {
    chiefComplaint: "8 months pregnant with severe headache and blurred vision",
    chiefComplaintBn: "৮ মাসের গর্ভবতী, তীব্র মাথাব্যথা ও চোখে ঝাপসা দেখা",
    symptoms: ["severe headache", "blurred vision", "swollen feet", "pregnancy 32 weeks"],
    symptomsBn: ["তীব্র মাথাব্যথা", "চোখে ঝাপসা", "পা ফোলা", "৮ মাসের গর্ভ"],
    durationDays: 1,
    associatedSymptoms: ["epigastric discomfort"],
  },
  triageAssessment: {
    level: "RED",
    rationale:
      "Severe headache with visual disturbance and oedema at 32 weeks gestation are danger signs of pre-eclampsia requiring urgent obstetric evaluation today.",
    dangerSigns: ["Severe headache in pregnancy", "Visual changes", "Pedal oedema"],
    recommendedAction: "immediate_emergency",
    timeframeHours: 4,
  },
  outputs: {
    doctorSummaryEn:
      "38F at ~32 weeks with severe headache, visual disturbance and pedal oedema — high suspicion of pre-eclampsia. Urgent BP check and obstetric referral today.",
    patientSMSBn:
      "গর্ভাবস্থার বিপদ চিহ্ন! আজই উপজেলা স্বাস্থ্য কমপ্লেক্সে যান। সাথে কাউকে নিন।",
    homeCareBn: [],
    followUpInstructions:
      "Go to the upazila health complex today. If convulsions or heavy bleeding occur, go to emergency immediately.",
  },
};

const childFever: TriageResult = {
  patientInfo: { name: "Shishu (child of Amena)", nameBn: "শিশু (আমেনার সন্তান)", age: 3, sex: "M" },
  clinicalData: {
    chiefComplaint: "Child with fever and reduced feeding for 2 days",
    chiefComplaintBn: "শিশুর ২ দিন ধরে জ্বর, খাওয়া কমে গেছে",
    symptoms: ["fever", "reduced feeding", "irritability"],
    symptomsBn: ["জ্বর", "খাওয়া কম", "খিটখিটে ভাব"],
    durationDays: 2,
    associatedSymptoms: [],
  },
  triageAssessment: {
    level: "YELLOW",
    rationale:
      "Fever with reduced feeding in a young child requires pediatric assessment within 24-48 hours; watch for danger signs of severe illness.",
    dangerSigns: ["Pediatric — monitor closely"],
    recommendedAction: "clinic_48h",
    timeframeHours: 24,
  },
  outputs: {
    doctorSummaryEn:
      "3-year-old with 2 days of fever and reduced oral intake, no convulsions or fast breathing reported. Pediatric review within 24h; IMCI assessment recommended.",
    patientSMSBn:
      "শিশুকে কাল ডাক্তার দেখান। জ্বরে প্যারাসিটামল সিরাপ দিন। শ্বাস দ্রুত হলে বা খিঁচুনি হলে সাথে সাথে হাসপাতালে নিন।",
    homeCareBn: ["প্যারাসিটামল সিরাপ (ওজন অনুযায়ী)", "বারবার তরল খাবার দিন", "কুসুম গরম পানি দিয়ে গা মুছুন"],
    followUpInstructions:
      "Emergency if fast breathing, convulsions, inability to drink, or lethargy.",
  },
};

const generic: TriageResult = {
  patientInfo: { name: "Patient", nameBn: "রোগী", age: 30, sex: "M" },
  clinicalData: {
    chiefComplaint: "General health complaint",
    chiefComplaintBn: "সাধারণ স্বাস্থ্য সমস্যা",
    symptoms: ["mild symptoms"],
    symptomsBn: ["হালকা উপসর্গ"],
    durationDays: 2,
    associatedSymptoms: [],
  },
  triageAssessment: {
    level: "GREEN",
    rationale: "No danger signs reported. Suitable for home care with safety-netting advice.",
    dangerSigns: [],
    recommendedAction: "home_care",
    timeframeHours: 72,
  },
  outputs: {
    doctorSummaryEn:
      "Adult with mild symptoms and no red flags on structured intake. Home care advice given with clear return precautions.",
    patientSMSBn: "বিশ্রাম নিন, প্রচুর পানি খান। ৩ দিনে ভালো না হলে ডাক্তার দেখান।",
    homeCareBn: ["বিশ্রাম নিন", "প্রচুর পানি খান", "৩ দিনে উন্নতি না হলে ডাক্তার দেখান"],
    followUpInstructions: "See a doctor if symptoms worsen or persist beyond 3 days.",
  },
};

/** Choose the closest fallback triage based on keywords in the transcript. */
export function getFallbackTriage(transcript: string): TriageResult {
  const t = transcript.toLowerCase();
  let result: TriageResult;
  if (t.includes("chest") || t.includes("বুকে") || t.includes("heart")) result = chestPain;
  else if (t.includes("pregnan") || t.includes("গর্ভ") || t.includes("মাথাব্যথা") && t.includes("ঝাপসা")) result = pregnancy;
  else if ((t.includes("child") || t.includes("শিশু") || t.includes("বাচ্চা")) && (t.includes("fever") || t.includes("জ্বর"))) result = childFever;
  else if (t.includes("fever") || t.includes("জ্বর")) result = fever;
  else result = generic;
  return { ...result, _fallback: true };
}

export const FALLBACK_PRESCRIPTION = {
  doctorName: "Dr. Rahman Hossain, MBBS",
  patientName: "Karim Uddin",
  date: "2026-06-08",
  medicines: [
    {
      brandName: "Napa 500mg",
      genericName: "Paracetamol",
      genericNameBn: "প্যারাসিটামল",
      purpose_en: "For fever and pain",
      purpose_bn: "জ্বর ও ব্যথা কমায়",
      dose_bn: "১টি ট্যাবলেট",
      frequency_bn: "দিনে ৩ বার",
      duration_bn: "৫ দিন",
      warnings_bn: ["দিনে ৮টির বেশি খাবেন না", "লিভারের সমস্যা থাকলে ডাক্তারকে জানান"],
      mustTakeWithFood: true,
    },
    {
      brandName: "Seclo 20mg",
      genericName: "Omeprazole",
      genericNameBn: "ওমিপ্রাজল",
      purpose_en: "Reduces stomach acid",
      purpose_bn: "পেটের অ্যাসিড কমায়",
      dose_bn: "১টি ক্যাপসুল",
      frequency_bn: "দিনে ১ বার, সকালে",
      duration_bn: "১৪ দিন",
      warnings_bn: ["খালি পেটে খান, খাবারের ৩০ মিনিট আগে"],
      mustTakeWithFood: false,
    },
    {
      brandName: "Zinc-B 20mg",
      genericName: "Zinc Sulphate",
      genericNameBn: "জিংক সালফেট",
      purpose_en: "Immunity and recovery support",
      purpose_bn: "রোগ প্রতিরোধ ক্ষমতা বাড়ায়",
      dose_bn: "১টি ট্যাবলেট",
      frequency_bn: "দিনে ১ বার",
      duration_bn: "১০ দিন",
      warnings_bn: [],
      mustTakeWithFood: true,
    },
  ],
  overallNotes_en:
    "Standard regimen for febrile illness with gastric protection. No drug interactions detected. Follow up if fever persists beyond 3 days.",
  safetyFlags: ["Confirm no paracetamol from other combination products"],
  expiryWarning: false,
  readabilityScore: 78,
  _fallback: true,
};

export const FALLBACK_CHAT_REPLY =
  "দুঃখিত, এই মুহূর্তে AI সংযোগ পাওয়া যাচ্ছে না। জরুরি প্রয়োজনে ১৬২৬৩ নম্বরে কল করুন অথবা নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্সে যান। (AI offline — for emergencies call 16263.)";

export const FALLBACK_GENERIC_SUB = {
  brandName: "Napa 500mg",
  genericName: "Paracetamol",
  explanation_en:
    "Generic paracetamol contains the exact same active ingredient (paracetamol 500mg) as Napa. DGDA-approved generics must demonstrate bioequivalence — the same absorption and effect in the body — so the therapeutic outcome is identical.",
  explanation_bn:
    "জেনেরিক প্যারাসিটামলে নাপার মতোই একই সক্রিয় উপাদান (প্যারাসিটামল ৫০০মিগ্রা) আছে। ঔষধ প্রশাসন অনুমোদিত জেনেরিক ওষুধ একইভাবে কাজ করে।",
  safetyNote_bn: "ওষুধ বদলানোর আগে ফার্মাসিস্ট বা ডাক্তারের সাথে কথা বলুন।",
  _fallback: true,
};
