import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.case.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.pharmacy.deleteMany();

  // ---------- PATIENTS ----------
  const patientsData = [
    { name: "Karim Uddin", nameBn: "করিম উদ্দিন", age: 45, sex: "M", phone: "+8801700000001", village: "Char Kalibari", upazila: "Mymensingh Sadar", district: "Mymensingh" },
    { name: "Rohima Begum", nameBn: "রহিমা বেগম", age: 32, sex: "F", phone: "+8801700000002", village: "Bhabanipur", upazila: "Gazipur Sadar", district: "Gazipur" },
    { name: "Amena Khatun", nameBn: "আমেনা খাতুন", age: 28, sex: "F", phone: "+8801700000003", village: "Karatia", upazila: "Tangail Sadar", district: "Tangail" },
    { name: "Abdul Rahim", nameBn: "আব্দুল রহিম", age: 60, sex: "M", phone: "+8801700000004", village: "Mougati", upazila: "Netrokona Sadar", district: "Netrokona" },
    { name: "Fatema Begum", nameBn: "ফাতেমা বেগম", age: 38, sex: "F", phone: "+8801700000005", village: "Jashodal", upazila: "Kishoreganj Sadar", district: "Kishoreganj" },
    { name: "Rahim Mia", nameBn: "রহিম মিয়া", age: 25, sex: "M", phone: "+8801700000006", village: "Dapunia", upazila: "Mymensingh Sadar", district: "Mymensingh" },
    { name: "Kulsum Akter", nameBn: "কুলসুম আক্তার", age: 42, sex: "F", phone: "+8801700000007", village: "Gazirkhamar", upazila: "Sherpur Sadar", district: "Sherpur" },
    { name: "Tomal Hossain", nameBn: "তমাল হোসেন", age: 19, sex: "M", phone: "+8801700000008", village: "Akua", upazila: "Mymensingh Sadar", district: "Mymensingh" },
    { name: "Nasrin Sultana", nameBn: "নাসরিন সুলতানা", age: 33, sex: "F", phone: "+8801700000009", village: "Thakurakona", upazila: "Netrokona Sadar", district: "Netrokona" },
    { name: "Babul Mia", nameBn: "বাবুল মিয়া", age: 55, sex: "M", phone: "+8801700000010", village: "Dhara", upazila: "Haluaghat", district: "Mymensingh" },
  ];
  const patients: { id: string }[] = [];
  for (const p of patientsData) {
    patients.push(await prisma.patient.create({ data: p }));
  }

  // ---------- CASES ----------
  const now = Date.now();
  const min = 60 * 1000;
  const casesData = [
    {
      patientId: patients[3].id, channel: "VOICE", chiefComplaint: "Severe chest pain radiating to left arm",
      symptoms: JSON.stringify(["chest pain", "sweating", "shortness of breath", "left arm pain"]),
      duration: "2 hours", vitals: JSON.stringify({ bp: "150/95", pulse: 104, spo2: 93 }),
      triageLevel: "RED",
      aiSummaryEn: "60M with 2h of central chest pain radiating to the left arm, diaphoresis and dyspnea. Pattern is concerning for acute coronary syndrome. Immediate emergency referral advised.",
      aiAdviceBn: "আপনার অবস্থা জরুরি। এখনই নিকটস্থ হাসপাতালে যান। দেরি করবেন না। অ্যাম্বুলেন্সের জন্য ১৬২৬৩ নম্বরে কল করুন।",
      dangerSigns: JSON.stringify(["Chest pain with radiation", "Diaphoresis", "SpO2 93%"]),
      rawTranscript: "রোগী: আমার বুকে খুব ব্যথা, বাম হাতে ছড়িয়ে পড়ছে। ঘাম হচ্ছে, শ্বাস নিতে কষ্ট হচ্ছে। দুই ঘণ্টা ধরে।",
      status: "PENDING", createdAt: new Date(now - 12 * min),
    },
    {
      patientId: patients[4].id, channel: "SMS", chiefComplaint: "Pregnancy - severe headache with blurred vision, 8 months",
      symptoms: JSON.stringify(["severe headache", "blurred vision", "swollen feet", "8 months pregnant"]),
      duration: "1 day", vitals: JSON.stringify({ bp: "160/110" }),
      triageLevel: "RED",
      aiSummaryEn: "38F G3P2 at ~32 weeks with severe headache, visual disturbance and pedal oedema; BP 160/110. High suspicion of pre-eclampsia. Needs urgent obstetric evaluation today.",
      aiAdviceBn: "এটি গর্ভাবস্থার বিপদ চিহ্ন। আজই উপজেলা স্বাস্থ্য কমপ্লেক্সে যান। সাথে কাউকে নিয়ে যাবেন।",
      dangerSigns: JSON.stringify(["Severe headache in pregnancy", "Visual changes", "BP 160/110"]),
      rawTranscript: "মাথা খুব ব্যথা। চোখে ঝাপসা দেখি। পা ফুলে গেছে। ৮ মাসের গর্ভবতী।",
      status: "PENDING", createdAt: new Date(now - 25 * min),
    },
    {
      patientId: patients[5].id, channel: "SMS", chiefComplaint: "Fever for 3 days with body ache",
      symptoms: JSON.stringify(["fever", "body ache", "headache", "weakness"]),
      duration: "3 days", vitals: JSON.stringify({ temp: "102.4°F" }),
      triageLevel: "YELLOW",
      aiSummaryEn: "25M with 3 days of high-grade fever, myalgia and headache. Dengue and typhoid are endemic considerations. Recommend CBC/NS1 and clinical review within 48 hours.",
      aiAdviceBn: "৩ দিনের জ্বর। ৪৮ ঘণ্টার মধ্যে ডাক্তার দেখান। প্রচুর পানি ও তরল খান। প্যারাসিটামল ছাড়া অন্য ব্যথার ওষুধ খাবেন না।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: "তিন দিন ধরে জ্বর। শরীর ব্যথা। মাথা ব্যথা।",
      status: "PENDING", createdAt: new Date(now - 45 * min),
    },
    {
      patientId: patients[6].id, channel: "APP", chiefComplaint: "Diabetes - blood sugar staying high despite medication",
      symptoms: JSON.stringify(["high blood sugar", "increased thirst", "frequent urination", "fatigue"]),
      duration: "2 weeks", vitals: JSON.stringify({ rbs: "16.8 mmol/L", weight: "68 kg" }),
      triageLevel: "YELLOW",
      aiSummaryEn: "42F known T2DM on metformin with RBS 16.8 mmol/L, polyuria and polydipsia for 2 weeks. Suggests poor glycaemic control; medication review and HbA1c needed within 48h.",
      aiAdviceBn: "আপনার ডায়াবেটিস নিয়ন্ত্রণে নেই। ২ দিনের মধ্যে ডাক্তার দেখান। ওষুধ বন্ধ করবেন না। মিষ্টি ও ভাত কম খান।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: null,
      status: "PENDING", createdAt: new Date(now - 70 * min),
    },
    {
      patientId: patients[8].id, channel: "APP", chiefComplaint: "Anemia follow-up - dizziness and fatigue continuing",
      symptoms: JSON.stringify(["dizziness", "fatigue", "pale skin", "breathlessness on exertion"]),
      duration: "3 weeks", vitals: JSON.stringify({ hb: "8.2 g/dL (CV estimate)" }),
      triageLevel: "YELLOW",
      aiSummaryEn: "33F with persistent fatigue and dizziness; CV screening estimates Hb 8.2 g/dL (moderate anemia). Laboratory confirmation and iron therapy review recommended within 48h.",
      aiAdviceBn: "রক্তস্বল্পতার লক্ষণ আছে। ২ দিনের মধ্যে রক্ত পরীক্ষা করান। আয়রন ট্যাবলেট চালিয়ে যান। শাক-সবজি, ডিম, কলিজা খান।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: null,
      status: "PENDING", createdAt: new Date(now - 95 * min),
    },
    {
      patientId: patients[9].id, channel: "VOICE", chiefComplaint: "Chronic cough for 3 weeks, worse at night",
      symptoms: JSON.stringify(["persistent cough", "night sweats", "weight loss", "low appetite"]),
      duration: "3 weeks", vitals: null,
      triageLevel: "YELLOW",
      aiSummaryEn: "55M smoker with 3-week productive cough, night sweats and weight loss. TB must be excluded — refer for sputum testing (GeneXpert) at upazila level within 48 hours.",
      aiAdviceBn: "৩ সপ্তাহের কাশি অবহেলা করবেন না। যক্ষ্মা পরীক্ষা (কফ পরীক্ষা) করান — এটি বিনামূল্যে হয়। ২ দিনের মধ্যে স্বাস্থ্য কমপ্লেক্সে যান।",
      dangerSigns: JSON.stringify(["Cough >2 weeks", "Weight loss", "Night sweats"]),
      rawTranscript: "রোগী: তিন সপ্তাহ ধরে কাশি। রাতে ঘাম হয়। ওজন কমে যাচ্ছে।",
      status: "PENDING", createdAt: new Date(now - 130 * min),
    },
    {
      patientId: patients[7].id, channel: "SMS", chiefComplaint: "Mild cold and runny nose",
      symptoms: JSON.stringify(["runny nose", "sneezing", "mild sore throat"]),
      duration: "2 days", vitals: null,
      triageLevel: "GREEN",
      aiSummaryEn: "19M with 2 days of coryzal symptoms, no fever or red flags. Consistent with viral URI; home care appropriate with safety-netting advice.",
      aiAdviceBn: "সাধারণ সর্দি। গরম পানি ও লেবু-মধু খান, বিশ্রাম নিন। ৩ দিনে ভালো না হলে বা জ্বর এলে ডাক্তার দেখান।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: "সর্দি লেগেছে। নাক দিয়ে পানি পড়ে।",
      status: "REVIEWED", doctorNotes: "Viral URI. Home care advice reinforced. No antibiotics needed.",
      createdAt: new Date(now - 180 * min),
    },
    {
      patientId: patients[0].id, channel: "VOICE", chiefComplaint: "Acidity and stomach burning after meals",
      symptoms: JSON.stringify(["epigastric burning", "acidity", "bloating"]),
      duration: "1 week", vitals: null,
      triageLevel: "GREEN",
      aiSummaryEn: "45M with 1 week of post-prandial epigastric burning, no alarm features (no weight loss, melena, dysphagia). Likely dyspepsia/GERD; lifestyle advice and antacid trial.",
      aiAdviceBn: "খাবার পরে বুক জ্বালা। ঝাল-ভাজা কম খান, রাতে খাওয়ার পর সাথে সাথে শোবেন না। সমস্যা চলতে থাকলে ডাক্তার দেখান।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: "রোগী: খাওয়ার পরে পেট জ্বালাপোড়া করে।",
      status: "PENDING", createdAt: new Date(now - 210 * min),
    },
    {
      patientId: patients[2].id, channel: "SMS", chiefComplaint: "Child (3y) with watery diarrhea since morning",
      symptoms: JSON.stringify(["watery stools 6x", "reduced feeding", "no blood in stool"]),
      duration: "1 day", vitals: null,
      triageLevel: "YELLOW",
      aiSummaryEn: "Mother reporting 3-year-old with acute watery diarrhea (6 episodes), reduced oral intake, no blood. Start ORS + zinc immediately; review within 24-48h, sooner if lethargy or sunken eyes.",
      aiAdviceBn: "শিশুকে প্রতিবার পায়খানার পর ওরস্যালাইন দিন। জিংক ট্যাবলেট ১০ দিন। শিশু নেতিয়ে পড়লে বা চোখ বসে গেলে সাথে সাথে হাসপাতালে নিন।",
      dangerSigns: JSON.stringify(["Pediatric dehydration risk"]),
      rawTranscript: "আমার বাচ্চার সকাল থেকে পাতলা পায়খানা। ৬ বার হয়েছে।",
      status: "PENDING", createdAt: new Date(now - 55 * min),
    },
    {
      patientId: patients[1].id, channel: "APP", chiefComplaint: "Knee pain when climbing stairs",
      symptoms: JSON.stringify(["knee pain", "stiffness in morning", "no swelling"]),
      duration: "2 months", vitals: null,
      triageLevel: "GREEN",
      aiSummaryEn: "32F with 2 months of mechanical knee pain, no inflammatory signs. Likely early degenerative/overuse pattern; home exercises and weight management advice, routine review.",
      aiAdviceBn: "হাঁটুর ব্যথার জন্য গরম সেঁক দিন। ভারী জিনিস তোলা কমান। ব্যথা বাড়লে বা ফুলে গেলে ডাক্তার দেখান।",
      dangerSigns: JSON.stringify([]),
      rawTranscript: null,
      status: "RESOLVED", doctorNotes: "Advised quadriceps strengthening. Paracetamol PRN.",
      createdAt: new Date(now - 300 * min),
    },
  ];
  for (const c of casesData) {
    await prisma.case.create({ data: c });
  }

  // ---------- DOCTORS ----------
  const doctorsData = [
    { name: "Dr. Rahman Hossain", nameBn: "ডা. রহমান হোসেন", specialty: "General Physician", specialtyBn: "জেনারেল ফিজিশিয়ান", facility: "Mymensingh Medical College Hospital", facilityBn: "ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল", upazila: "Mymensingh Sadar", district: "Mymensingh", lat: 24.7563, lng: 90.4034, phone: "+8801800000001", fee: 200, available: true, rating: 4.6, teleconsult: true },
    { name: "Dr. Nasrin Akter", nameBn: "ডা. নাসরিন আক্তার", specialty: "Gynecologist", specialtyBn: "স্ত্রীরোগ বিশেষজ্ঞ", facility: "Netrokona Upazila Health Complex", facilityBn: "নেত্রকোনা উপজেলা স্বাস্থ্য কমপ্লেক্স", upazila: "Netrokona Sadar", district: "Netrokona", lat: 24.8709, lng: 90.7279, phone: "+8801800000002", fee: 300, available: true, rating: 4.8, teleconsult: true },
    { name: "Dr. Kamal Ahmed", nameBn: "ডা. কামাল আহমেদ", specialty: "Pediatrician", specialtyBn: "শিশু বিশেষজ্ঞ", facility: "Kishoreganj District Hospital", facilityBn: "কিশোরগঞ্জ জেলা হাসপাতাল", upazila: "Kishoreganj Sadar", district: "Kishoreganj", lat: 24.4449, lng: 90.7766, phone: "+8801800000003", fee: 250, available: true, rating: 4.5, teleconsult: true },
    { name: "Dr. Sultana Begum", nameBn: "ডা. সুলতানা বেগম", specialty: "Internal Medicine", specialtyBn: "মেডিসিন বিশেষজ্ঞ", facility: "Mymensingh General Hospital", facilityBn: "ময়মনসিংহ জেনারেল হাসপাতাল", upazila: "Mymensingh Sadar", district: "Mymensingh", lat: 24.7430, lng: 90.4100, phone: "+8801800000004", fee: 400, available: false, rating: 4.7, teleconsult: true },
    { name: "Dr. Rafiq Islam", nameBn: "ডা. রফিক ইসলাম", specialty: "Emergency Medicine", specialtyBn: "জরুরি চিকিৎসা", facility: "Sherpur Upazila Health Complex", facilityBn: "শেরপুর উপজেলা স্বাস্থ্য কমপ্লেক্স", upazila: "Sherpur Sadar", district: "Sherpur", lat: 25.0205, lng: 90.0153, phone: "+8801800000005", fee: 150, available: true, rating: 4.3, teleconsult: true },
    { name: "Dr. Farhana Yasmin", nameBn: "ডা. ফারহানা ইয়াসমিন", specialty: "General Physician", specialtyBn: "জেনারেল ফিজিশিয়ান", facility: "Haluaghat Upazila Health Complex", facilityBn: "হালুয়াঘাট উপজেলা স্বাস্থ্য কমপ্লেক্স", upazila: "Haluaghat", district: "Mymensingh", lat: 25.1295, lng: 90.3489, phone: "+8801800000006", fee: 150, available: true, rating: 4.1, teleconsult: true },
    { name: "Dr. Mahbub Alam", nameBn: "ডা. মাহবুব আলম", specialty: "Internal Medicine", specialtyBn: "মেডিসিন বিশেষজ্ঞ", facility: "Tangail District Hospital", facilityBn: "টাঙ্গাইল জেলা হাসপাতাল", upazila: "Tangail Sadar", district: "Tangail", lat: 24.2513, lng: 89.9167, phone: "+8801800000007", fee: 350, available: true, rating: 4.4, teleconsult: false },
    { name: "Dr. Shirin Sharmin", nameBn: "ডা. শিরিন শারমিন", specialty: "Gynecologist", specialtyBn: "স্ত্রীরোগ বিশেষজ্ঞ", facility: "Gazipur Sadar Hospital", facilityBn: "গাজীপুর সদর হাসপাতাল", upazila: "Gazipur Sadar", district: "Gazipur", lat: 23.9999, lng: 90.4203, phone: "+8801800000008", fee: 300, available: true, rating: 4.6, teleconsult: true },
  ];
  for (const d of doctorsData) {
    await prisma.doctor.create({ data: d });
  }

  // ---------- MEDICINES ----------
  const medicinesData = [
    { brandName: "Napa 500mg", genericName: "Paracetamol", genericNameBn: "প্যারাসিটামল", manufacturer: "Beximco", category: "Analgesic/Antipyretic", dosageForm: "tablet", strength: "500mg", priceBdt: 0.8, genericPrice: 0.4, inStock: true },
    { brandName: "Ace 500mg", genericName: "Paracetamol", genericNameBn: "প্যারাসিটামল", manufacturer: "Square", category: "Analgesic/Antipyretic", dosageForm: "tablet", strength: "500mg", priceBdt: 0.8, genericPrice: 0.4, inStock: true },
    { brandName: "Azith 500mg", genericName: "Azithromycin", genericNameBn: "অ্যাজিথ্রোমাইসিন", manufacturer: "Beximco", category: "Antibiotic", dosageForm: "tablet", strength: "500mg", priceBdt: 45, genericPrice: 30, inStock: true },
    { brandName: "Comet 500mg", genericName: "Metformin", genericNameBn: "মেটফরমিন", manufacturer: "ACI", category: "Antidiabetic", dosageForm: "tablet", strength: "500mg", priceBdt: 3, genericPrice: 2, inStock: true },
    { brandName: "Amdocal 5mg", genericName: "Amlodipine", genericNameBn: "অ্যামলোডিপিন", manufacturer: "Opsonin", category: "Antihypertensive", dosageForm: "tablet", strength: "5mg", priceBdt: 5, genericPrice: 3, inStock: true },
    { brandName: "Orsaline-N", genericName: "Oral Rehydration Salts", genericNameBn: "ওরস্যালাইন", manufacturer: "SMC", category: "Rehydration", dosageForm: "powder", strength: "1 sachet", priceBdt: 8, genericPrice: 6, inStock: true },
    { brandName: "Zinc-B 20mg", genericName: "Zinc Sulphate", genericNameBn: "জিংক সালফেট", manufacturer: "Square", category: "Supplement", dosageForm: "tablet", strength: "20mg", priceBdt: 2, genericPrice: 1.5, inStock: true },
    { brandName: "Folison 5mg", genericName: "Folic Acid", genericNameBn: "ফলিক এসিড", manufacturer: "ACI", category: "Supplement", dosageForm: "tablet", strength: "5mg", priceBdt: 1, genericPrice: 0.7, inStock: true },
    { brandName: "Feofol", genericName: "Iron + Folic Acid", genericNameBn: "আয়রন + ফলিক এসিড", manufacturer: "Opsonin", category: "Supplement", dosageForm: "capsule", strength: "150mg+0.5mg", priceBdt: 1.5, genericPrice: 1, inStock: true },
    { brandName: "Seclo 20mg", genericName: "Omeprazole", genericNameBn: "ওমিপ্রাজল", manufacturer: "Square", category: "Antacid/PPI", dosageForm: "capsule", strength: "20mg", priceBdt: 6, genericPrice: 3.5, inStock: true },
    { brandName: "Moxacil 250mg", genericName: "Amoxicillin", genericNameBn: "অ্যামোক্সিসিলিন", manufacturer: "Beximco", category: "Antibiotic", dosageForm: "capsule", strength: "250mg", priceBdt: 8, genericPrice: 5, inStock: true },
    { brandName: "Histacin 4mg", genericName: "Chlorpheniramine", genericNameBn: "ক্লোরফেনিরামিন", manufacturer: "Jayson", category: "Antihistamine", dosageForm: "tablet", strength: "4mg", priceBdt: 0.5, genericPrice: 0.35, inStock: true },
    { brandName: "Salbutamol Inhaler", genericName: "Salbutamol", genericNameBn: "সালবিউটামল", manufacturer: "Beximco", category: "Bronchodilator", dosageForm: "inhaler", strength: "100mcg", priceBdt: 180, genericPrice: 150, inStock: true },
    { brandName: "Flagyl 400mg", genericName: "Metronidazole", genericNameBn: "মেট্রোনিডাজল", manufacturer: "Sanofi", category: "Antibiotic/Antiprotozoal", dosageForm: "tablet", strength: "400mg", priceBdt: 2.5, genericPrice: 1.5, inStock: true },
    { brandName: "Alatrol 10mg", genericName: "Cetirizine", genericNameBn: "সেটিরিজিন", manufacturer: "Square", category: "Antihistamine", dosageForm: "tablet", strength: "10mg", priceBdt: 3, genericPrice: 1.8, inStock: true },
    { brandName: "Losectil 20mg", genericName: "Esomeprazole", genericNameBn: "ইসোমিপ্রাজল", manufacturer: "Eskayef", category: "Antacid/PPI", dosageForm: "capsule", strength: "20mg", priceBdt: 7, genericPrice: 4, inStock: false },
    { brandName: "Cef-3 400mg", genericName: "Cefixime", genericNameBn: "সেফিক্সিম", manufacturer: "Square", category: "Antibiotic", dosageForm: "capsule", strength: "400mg", priceBdt: 50, genericPrice: 35, inStock: true },
    { brandName: "Tetrasol Eye Drop", genericName: "Tetrahydrozoline", genericNameBn: "টেট্রাহাইড্রোজোলিন", manufacturer: "Opsonin", category: "Ophthalmic", dosageForm: "drops", strength: "0.05%", priceBdt: 35, genericPrice: 25, inStock: true },
    { brandName: "Deslor 5mg", genericName: "Desloratadine", genericNameBn: "ডেসলোরাটাডিন", manufacturer: "Renata", category: "Antihistamine", dosageForm: "tablet", strength: "5mg", priceBdt: 4, genericPrice: 2.5, inStock: true },
    { brandName: "Maxpro 20mg", genericName: "Esomeprazole", genericNameBn: "ইসোমিপ্রাজল", manufacturer: "Renata", category: "Antacid/PPI", dosageForm: "tablet", strength: "20mg", priceBdt: 8, genericPrice: 4, inStock: true },
  ];
  for (const m of medicinesData) {
    await prisma.medicine.create({ data: m });
  }

  // ---------- PHARMACIES ----------
  const pharmaciesData = [
    { name: "Lazz Pharma", nameBn: "লাজ ফার্মা", address: "Charpara Mor, Mymensingh", upazila: "Mymensingh Sadar", phone: "+8801900000001", lat: 24.7539, lng: 90.4073, open24h: true, delivery: true },
    { name: "Seba Pharmacy", nameBn: "সেবা ফার্মেসি", address: "Ganginar Par, Mymensingh", upazila: "Mymensingh Sadar", phone: "+8801900000002", lat: 24.7494, lng: 90.4150, open24h: false, delivery: true },
    { name: "Janata Medical Hall", nameBn: "জনতা মেডিকেল হল", address: "Station Road, Mymensingh", upazila: "Mymensingh Sadar", phone: "+8801900000003", lat: 24.7411, lng: 90.4262, open24h: false, delivery: false },
    { name: "Modern Pharmacy", nameBn: "মডার্ন ফার্মেসি", address: "Bridge Mor, Mymensingh", upazila: "Mymensingh Sadar", phone: "+8801900000004", lat: 24.7359, lng: 90.4321, open24h: true, delivery: true },
    { name: "Gramin Oushod Ghor", nameBn: "গ্রামীণ ঔষধ ঘর", address: "Dapunia Bazar", upazila: "Mymensingh Sadar", phone: "+8801900000005", lat: 24.7702, lng: 90.3911, open24h: false, delivery: true },
    { name: "Sasthya Seba Pharmacy", nameBn: "স্বাস্থ্য সেবা ফার্মেসি", address: "Akua Bypass, Mymensingh", upazila: "Mymensingh Sadar", phone: "+8801900000006", lat: 24.7613, lng: 90.3978, open24h: false, delivery: false },
  ];
  for (const ph of pharmaciesData) {
    await prisma.pharmacy.create({ data: ph });
  }

  console.log("Seed complete: 10 patients, 10 cases, 8 doctors, 20 medicines, 6 pharmacies");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
