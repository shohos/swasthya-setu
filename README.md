# Swasthya Setu · স্বাস্থ্য সেতু

**AI-powered offline-first telehealth platform for rural Bangladesh.**
THE INFINITY AI BUILDFEST 2026 — HealthTech Track (Telehealth Offline System).

Bridging 100M+ rural Bangladeshis to healthcare through three input channels — **Voice (IVR)**, **SMS**, and an **offline-first app** — all feeding one Claude-powered clinical triage pipeline, a doctor dashboard, CV disease screening, a Claude Vision prescription reader, medicine finder, and doctor booking.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/swasthya-setu&env=ANTHROPIC_API_KEY)

---

## Quick start

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run db:setup                   # generate Prisma client, create + seed SQLite
npm run dev                        # http://localhost:3000
```

> **No API key?** Everything still works — all AI endpoints fall back to realistic pre-computed demo responses (`lib/mock-responses.ts`), so the demo never breaks on stage.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | recommended | Real Claude triage, prescription OCR, and chat. Falls back to mock data if missing. |
| `CLAUDE_MODEL` | no | Defaults to `claude-sonnet-4-6`. |
| `DATABASE_URL` | no | Defaults to `file:./swasthya.db` (SQLite). |

## The 3-minute demo script

1. **Demo Hub** (`/demo`) — show the clickable architecture, hit **Full Patient Journey** (auto-runs SMS → Claude RED triage → creates a real case).
2. **SMS Intake** (`/intake/sms`) — run the "Chest Pain Emergency" scenario; watch the live Claude JSON.
3. **Prescription Scanner** (`/screening/prescription`) — "Use Sample Prescription" makes a **real Claude Vision call** on a generated handwritten-style Bangla prescription.
4. **Doctor Dashboard** (`/dashboard`) — the new cases are at the top of the risk-sorted queue; issue an e-prescription, export DHIS2 CSV.

## Architecture

```
Voice (IVR sim) ─┐
SMS (2G sim) ────┼──► /api/triage (Claude) ──► SQLite (Prisma) ──► Doctor Dashboard
CHW App form ────┘          │                                          │
                            └── Bangla SMS back to patient ◄───────────┘
CV screening (anemia/jaundice — mocked TFLite)      Claude Vision (/api/prescription — real)
Medicine finder + Leaflet pharmacy map               Bangla health chatbot (/api/chat — streaming)
```

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Zustand, Recharts, Leaflet
- **AI:** Anthropic Claude (triage JSON, vision prescription OCR, streaming Bangla chat)
- **DB:** SQLite via Prisma (seeded: 10 patients, 10 cases, 8 doctors, 20 medicines, 6 pharmacies)
- **Fonts:** Poppins + Noto Sans Bengali

## Deploying to Vercel

1. Push to GitHub and import in Vercel (framework auto-detected).
2. Set `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables.
3. Deploy. The build runs `prisma db push && prisma db seed` so the SQLite file ships with the bundle; at runtime it is copied to `/tmp` so demo case-creation works on serverless.

> SQLite on Vercel is per-instance and ephemeral — perfect for a demo, not for production. The production path is Postgres (Neon/Supabase): change `datasource` in `prisma/schema.prisma` and `DATABASE_URL`.

## What is simulated vs real

| Real | Simulated |
|---|---|
| Claude triage (`/api/triage`) | Twilio voice/SMS transport (in-browser) |
| Claude Vision prescription OCR | TFLite CV inference (realistic mock outputs, honest disclaimers in UI) |
| Streaming Bangla chatbot | SMS sending, payments (toast confirmations) |
| SQLite case records + live dashboard polling | |
