"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppointmentDTO, DoctorDTO } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { haversineKm, cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import BanglaText from "@/components/shared/BanglaText";
import VideoCallModal from "@/components/doctors/VideoCallModal";
import {
  Stethoscope,
  Star,
  Video,
  CalendarPlus,
  X,
  MapPin,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

const USER_LOC = { lat: 24.7471, lng: 90.4203 };
const SPECIALTIES = ["All", "General Physician", "Gynecologist", "Pediatrician", "Internal Medicine", "Emergency Medicine"];
const DISTRICTS = ["All", "Mymensingh", "Netrokona", "Kishoreganj", "Sherpur", "Tangail", "Gazipur"];
const PATIENTS = ["Karim Uddin", "Rohima Begum", "Amena Khatun", "Abdul Rahim", "Fatema Begum", "New Patient"];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "15:00", "15:30", "16:00", "19:00", "19:30", "20:00"];
const REASONS = ["Follow-up", "Fever / infection", "Chronic disease", "Maternal care", "Other"];

const AVATAR_COLORS = ["bg-teal-700", "bg-blue-700", "bg-purple-700", "bg-amber-700", "bg-rose-700", "bg-emerald-700"];

export default function DoctorsPage() {
  const { t, lang } = useT();
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [upcoming, setUpcoming] = useState<AppointmentDTO[]>([]);
  const [specialty, setSpecialty] = useState("All");
  const [district, setDistrict] = useState("All");
  const [tele, setTele] = useState(false);
  const [availToday, setAvailToday] = useState(false);
  const [sort, setSort] = useState<"distance" | "rating" | "fee">("distance");
  const [booking, setBooking] = useState<DoctorDTO | null>(null);
  const [videoCall, setVideoCall] = useState<DoctorDTO | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (specialty !== "All") params.set("specialty", specialty);
    if (district !== "All") params.set("district", district);
    if (tele) params.set("teleconsult", "true");
    if (availToday) params.set("available", "true");
    fetch(`/api/doctors?${params}`)
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors ?? []))
      .catch(() => {});
  }, [specialty, district, tele, availToday]);

  const loadUpcoming = useCallback(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => {
        const list: AppointmentDTO[] = d.appointments ?? [];
        const now = Date.now();
        setUpcoming(
          list
            .filter((a) => a.status === "CONFIRMED" && +new Date(a.scheduledAt) > now)
            .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
            .slice(0, 4)
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  const sorted = useMemo(() => {
    const withDist = doctors.map((d) => ({
      ...d,
      distance: haversineKm(USER_LOC.lat, USER_LOC.lng, d.lat, d.lng),
    }));
    return withDist.sort((a, b) =>
      sort === "distance" ? a.distance - b.distance : sort === "rating" ? b.rating - a.rating : a.fee - b.fee
    );
  }, [doctors, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-800">
          <Stethoscope className="w-6 h-6 text-purple-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Doctor Finder &amp; Appointments</h1>
          <p className="text-sm text-slate-400">
            Verified doctors across Mymensingh division — teleconsult or in-person, transparent fees.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="panel p-3 flex flex-wrap items-center gap-3 text-sm mb-5">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input-dark w-auto text-sm">
          {SPECIALTIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input-dark w-auto text-sm">
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
          <input type="checkbox" checked={tele} onChange={(e) => setTele(e.target.checked)} className="accent-teal-500" />
          Teleconsult
        </label>
        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
          <input type="checkbox" checked={availToday} onChange={(e) => setAvailToday(e.target.checked)} className="accent-teal-500" />
          Available today
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="input-dark w-auto text-sm ml-auto"
        >
          <option value="distance">Sort: Distance</option>
          <option value="rating">Sort: Rating</option>
          <option value="fee">Sort: Fee (low → high)</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* doctor grid */}
        <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.length === 0 && (
            <p className="text-slate-500 text-sm col-span-full panel p-6 text-center">
              No doctors match these filters.
            </p>
          )}
          {sorted.map((d, i) => (
            <div key={d.id} className="panel p-4 flex flex-col hover:border-purple-700 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className={`w-11 h-11 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-bold text-white text-lg`}
                >
                  {d.name.replace("Dr. ", "").charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-100 truncate">{d.name}</p>
                  <BanglaText className="text-xs text-slate-400">{d.nameBn}</BanglaText>
                </div>
              </div>
              <p className="text-sm text-purple-300 mt-2">
                {d.specialty} <BanglaText className="text-slate-500 text-xs">· {d.specialtyBn}</BanglaText>
              </p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{d.facility}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d.distance.toFixed(1)} km
                </span>
                <span className="flex items-center gap-0.5 text-amber-300">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3 h-3 ${j < Math.round(d.rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                  <span className="ml-0.5">({d.rating})</span>
                </span>
                <span className="ml-auto font-bold text-teal-300 text-sm">৳ {d.fee}</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {d.available && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 border border-green-700 text-green-300">
                    Today Available
                  </span>
                )}
                {d.teleconsult && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-700 text-blue-300">
                    Video Call
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
                <button onClick={() => setBooking(d)} className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                  <CalendarPlus className="w-3.5 h-3.5" /> Book
                </button>
                <button
                  onClick={() => setVideoCall(d)}
                  disabled={!d.teleconsult}
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Video Call
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* upcoming sidebar — live from API */}
        <div className="panel p-4 h-fit">
          <h3 className={cn("font-bold text-slate-100 text-sm uppercase tracking-widest mb-3", lang === "bn" && "font-bangla")}>
            {t("appt.upcoming")}
          </h3>
          <div className="space-y-2.5">
            {upcoming.length === 0 && (
              <p className={cn("text-xs text-slate-500", lang === "bn" && "font-bangla")}>{t("appt.none")}</p>
            )}
            {upcoming.map((a) => (
              <div key={a.id} className="card-surface p-3 text-sm">
                <p className="font-semibold text-slate-100">{a.doctor?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(a.scheduledAt).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-700 text-blue-300">
                    {a.type === "VIDEO" ? "Video" : "In-person"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-green-900/30 border-green-700 text-green-300">
                    {a.status === "CONFIRMED" ? "Confirmed" : a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/appointments"
            className={cn(
              "mt-3 text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5",
              lang === "bn" && "font-bangla"
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" /> {t("common.viewAll")} →
          </Link>
        </div>
      </div>

      {booking && (
        <BookingModal doctor={booking} onClose={() => setBooking(null)} onBooked={loadUpcoming} />
      )}
      {videoCall && <VideoCallModal doctorName={videoCall.name} onClose={() => setVideoCall(null)} />}
    </div>
  );
}

function BookingModal({
  doctor,
  onClose,
  onBooked,
}: {
  doctor: DoctorDTO;
  onClose: () => void;
  onBooked: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [slot, setSlot] = useState<string | null>(null);
  const [patient, setPatient] = useState(PATIENTS[0]);
  const [reason, setReason] = useState(REASONS[0]);
  const [type, setType] = useState<"VIDEO" | "IN_PERSON">(doctor.teleconsult ? "VIDEO" : "IN_PERSON");
  const [payment, setPayment] = useState("bKash");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const [day, setDay] = useState(days[0]);

  async function confirm() {
    if (!slot || saving) return;
    setSaving(true);
    const scheduled = new Date(day);
    const [h, m] = slot.split(":").map(Number);
    scheduled.setHours(h, m, 0, 0);

    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName: patient,
          reason,
          type,
          scheduledAt: scheduled.toISOString(),
          paymentMethod: payment,
        }),
      });
    } catch {}
    setSaving(false);
    setConfirmed(true);
    onBooked();
    pushToast({
      title: "Appointment confirmed!",
      message: `${doctor.name} — ${scheduled.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} ${slot}. Reminder SMS will be sent.`,
      variant: "success",
    });
    setTimeout(onClose, 1800);
  }

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="panel w-full max-w-md max-h-[88vh] overflow-y-auto p-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-100">Book Appointment — {doctor.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="text-center py-8 animate-fade-in">
            <CheckCircle2 className="w-14 h-14 text-teal-400 mx-auto" />
            <p className="font-bold text-slate-100 mt-3">Appointment confirmed!</p>
            <p className="text-sm text-slate-400 mt-1">
              It now appears in{" "}
              <Link href="/appointments" className="text-purple-300 underline">
                My Appointments
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Consultation type</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setType("VIDEO")}
                  disabled={!doctor.teleconsult}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs border flex items-center justify-center gap-1.5",
                    type === "VIDEO"
                      ? "bg-blue-600/20 border-blue-600 text-blue-300"
                      : "bg-card border-edge text-slate-300 disabled:opacity-40"
                  )}
                >
                  <Video className="w-3.5 h-3.5" /> Video Call
                </button>
                <button
                  onClick={() => setType("IN_PERSON")}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs border flex items-center justify-center gap-1.5",
                    type === "IN_PERSON"
                      ? "bg-amber-600/20 border-amber-600 text-amber-300"
                      : "bg-card border-edge text-slate-300"
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" /> In-person
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1.5">Date (next 7 days)</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {days.map((d) => (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDay(d)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs border ${
                      day.toDateString() === d.toDateString()
                        ? "bg-teal-600/20 border-teal-600 text-teal-300"
                        : "bg-card border-edge text-slate-300"
                    }`}
                  >
                    {d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Time slot (30 min)</p>
              <div className="grid grid-cols-5 gap-1.5">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`px-1 py-1.5 rounded-lg text-xs border ${
                      slot === s
                        ? "bg-teal-600/20 border-teal-600 text-teal-300"
                        : "bg-card border-edge text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400 mb-1">Patient</p>
                <select value={patient} onChange={(e) => setPatient(e.target.value)} className="input-dark text-sm">
                  {PATIENTS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Reason for visit</p>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-dark text-sm">
                  {REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Payment method</p>
              <div className="flex gap-2">
                {["bKash", "Nagad", "Cash on Arrival"].map((p) => (
                  <label key={p} className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === p}
                      onChange={() => setPayment(p)}
                      className="accent-teal-500"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={confirm} disabled={!slot || saving} className="btn-primary w-full">
              {saving ? "Booking…" : `Confirm — ৳${doctor.fee}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
