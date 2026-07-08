# Swasthya Setu · স্বাস্থ্য সেতু

**AI-powered, offline-first telehealth platform for rural Bangladesh — built entirely on free-tier Google AI APIs.**

Bangladesh has one doctor for every ~6,000 rural patients, and every existing telehealth app assumes a smartphone and stable internet — excluding the 100M+ people who need care most. Swasthya Setu ("Health Bridge") closes that gap: patients reach the system through **voice calls, SMS, or an offline-first app**, an AI pipeline triages them in under a minute, and a doctor closes the loop with an e-prescription sent back as a Bangla SMS.

---

## Table of contents

1. [What the platform does](#what-the-platform-does)
2. [Feature map](#feature-map)
3. [AI pipeline details](#ai-pipeline-details)
4. [Architecture](#architecture)
5. [Data model](#data-model)
6. [Tech stack](#tech-stack)
7. [What is live vs simulated](#what-is-live-vs-simulated)
8. [Safety & ethics](#safety--ethics)

---

## What the platform does

**For patients (no smartphone needed):**
- **Call or text 16789** (simulated in-browser) — a Bangla bot collects name, age, symptoms, and duration in six messages
- Receive an instant **Bangla SMS** with triage advice: RED (go to hospital now), YELLOW (see a doctor within 48h), or GREEN (home care instructions)
- **Chat in Bangla** with a Gemini-powered health assistant from any page
- **Order medicines** with cart + checkout (bKash/Nagad/COD), generic-substitution savings, and pharmacy delivery
- **Book doctors** (video or in-person) and manage every consultation in an appointments dashboard

**For health workers (CHW mode):**
- Structured intake form that feeds the same AI triage pipeline
- **Eye-camera screening**: anemia (conjunctival pallor → hemoglobin estimate) and jaundice (scleral yellowing → bilirubin estimate) via on-device color analysis verified by Roboflow's hosted CLIP zero-shot model
- **Prescription scanner**: photograph any handwritten Bangla/English prescription → Roboflow DocTR OCR extracts the text → Gemini explains every medicine in plain Bangla with dosage, warnings, and cheaper DGDA-approved generic alternatives

**For doctors:**
- Risk-sorted case queue (RED first) with the AI's clinical summary in English and the patient's advice in Bangla
- One-click e-prescriptions with live Bangla SMS preview, referral slips, clinical notes
- Live polling — new cases appear with urgent toasts
- **DHIS2 CSV export** for government (DGHS) reporting across all 64 districts

**For everyone:** full **English ⇄ বাংলা UI toggle** in the navbar, persisted across visits.

## Feature map

| Feature | Route | AI |
|---|---|---|
| Landing page (animated stats, ECG, business model) | `/` | — |
| Demo hub (clickable architecture + 90s auto patient journey) | `/demo` | creates a real case |
| Voice IVR intake simulation | `/intake/voice` | Gemini triage |
| SMS chatbot intake simulation | `/intake/sms` | Gemini triage |
| CHW app intake form | `/intake/app` | Gemini triage |
| **Anemia screening** (conjunctiva) | `/screening/anemia` | On-device color index + Roboflow CLIP |
| **Jaundice screening** (sclera) | `/screening/jaundice` | On-device color index + Roboflow CLIP |
| **Prescription scanner** | `/screening/prescription` | Roboflow DocTR OCR → Gemini structuring |
| Bangla health chatbot (floating widget) | everywhere | Gemini — live streaming |
| Medicine finder + **cart & checkout** | `/medicine` | Gemini generic-substitution |
| Pharmacy map (Leaflet, distance filter, delivery) | `/medicine` | — |
| Doctor finder + booking (video/in-person, slots, payment) | `/doctors` | — |
| **Appointments dashboard** (ongoing / upcoming / past + details) | `/appointments` | — |
| Doctor triage dashboard + e-prescription + DHIS2 export | `/dashboard` | — |
| EN ⇄ বাংলা UI toggle | navbar | — |

All three screening tools are cross-linked with tabs at the top of each screening page.

## AI pipeline details

**1. Clinical triage (Gemini, JSON mode)** — patient transcript in → structured JSON out: patient info, chief complaint (EN+BN), symptoms, danger signs, RED/YELLOW/GREEN level with rationale, a doctor summary in clinical English, and a <160-char Bangla SMS for the patient. Cases persist to the doctor dashboard.

**2. Eye screening (on-device color index + Roboflow CLIP)** — the captured eye photo is sampled on-device: the app computes a **conjunctival redness index** `R − (G+B)/2` (anemia → hemoglobin estimate) or a **scleral yellowness index** `(R+G)/2 − B` (jaundice → bilirubin estimate) over the central region, and maps it to clinical reference ranges. Roboflow's hosted **CLIP** model then runs a zero-shot check (e.g. "pale anemic conjunctiva" vs "healthy red conjunctiva") to corroborate, feeding the confidence score. The index and CLIP probability are shown in the result card.

**3. Prescription reading (two-stage)** — Roboflow's hosted **DocTR** OCR model extracts the raw text from the handwritten prescription; Gemini then structures it into medicines with purpose, dosage, frequency, duration, and warnings — all in Bangla — plus safety flags and a readability score. Each medicine is enriched with a cheaper generic alternative from the local DGDA-approved database.

**4. Health chatbot (Gemini, streaming SSE)** — Bangla-first conversational assistant with safety guardrails: no diagnosis, emergency numbers (16263) for serious symptoms.

**Resilience:** every AI call has a keyword-matched fallback response, so no failure mode is user-visible — results are just labeled as demo data.

## Architecture

```
Voice (IVR sim) ─┐
SMS (2G sim) ────┼──► /api/triage (Gemini JSON) ──► SQLite (Prisma) ──► Doctor Dashboard
CHW App form ────┘             │                                            │
                               └── Bangla SMS back to patient ◄─────────────┘

Eye photo ──► /api/screening (on-device color index + Roboflow CLIP zero-shot)
Rx photo ───► /api/prescription (Roboflow DocTR OCR → Gemini structuring → DB generic match)
Chat ───────► /api/chat (Gemini streaming SSE → plain-text re-stream)
Brand name ─► /api/medicines POST (Gemini generic-substitution JSON)
Cart ───────► /api/orders (persisted, delivery fee logic)
Booking ────► /api/appointments (persisted, status lifecycle)
```

## Data model

Prisma + SQLite, seeded with realistic Mymensingh-division data:

| Model | Seeded | Notes |
|---|---|---|
| `Patient` | 10 | name (EN+BN), age, sex, village/upazila/district |
| `Case` | 10 | channel, symptoms, triage level, AI summaries (EN+BN), danger signs, status lifecycle |
| `Doctor` | 8 | specialty (EN+BN), facility, geo, fee, rating, teleconsult |
| `Appointment` | 7 | ongoing/upcoming/past, payment status, notes, prescriptions |
| `Medicine` | 20 | brand + generic prices, DGDA approval, stock |
| `Pharmacy` | 6 | geo-located, 24h + delivery flags |
| `Order` | 1 | cart items JSON, delivery fee, payment method |

## Tech stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **AI:** Google Gemini (`gemini-2.5-flash`, free tier) + Roboflow hosted CV models (CLIP + DocTR, free tier)
- **Database:** SQLite via Prisma v6 (→ Postgres for production)
- **UI:** Tailwind CSS (custom dark theme), Zustand (state: toasts, cart, language), Leaflet (maps), lucide-react (icons)
- **Fonts:** Poppins + Noto Sans Bengali + JetBrains Mono
- **i18n:** lightweight runtime dictionary (`lib/i18n.ts`), persisted language preference

## What is live vs simulated

| Live (real API calls / real persistence) | Simulated (honestly labeled) |
|---|---|
| Gemini streaming chatbot | Twilio voice/SMS transport (runs in-browser) |
| Gemini clinical triage (all three intake channels) | Payment processing (bKash/Nagad/COD mock) |
| Roboflow CLIP eye screening + on-device color index | Video call media (mock call room) |
| Roboflow DocTR OCR + Gemini prescription pipeline | SMS delivery (shown as previews/toasts) |
| Gemini generic-substitution explanations | |
| Orders, appointments, cases persisted in SQLite | |

## Safety & ethics

- **Human-in-the-loop by design** — the AI never closes a clinical loop alone; RED/YELLOW cases always route to a licensed doctor
- Every screening result carries a confidence score and an explicit "screening signal, not a diagnosis" disclaimer
- Prescription output warns users never to change medicines without a doctor
- Fallback data is always labeled as demo output — no fabricated live results
- No PHI leaves the system beyond the minimal symptom text sent to the AI APIs
