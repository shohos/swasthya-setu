export interface PatientDTO {
  id: string;
  name: string;
  nameBn: string;
  age: number;
  sex: string;
  phone: string;
  village: string;
  upazila: string;
  district: string;
}

export interface CaseDTO {
  id: string;
  patientId: string;
  patient: PatientDTO;
  channel: "VOICE" | "SMS" | "APP" | string;
  chiefComplaint: string;
  symptoms: string; // JSON array string
  duration: string;
  vitals: string | null; // JSON string
  triageLevel: "RED" | "YELLOW" | "GREEN" | string;
  aiSummaryEn: string;
  aiAdviceBn: string;
  dangerSigns: string; // JSON array string
  rawTranscript: string | null;
  status: string;
  doctorNotes: string | null;
  prescription: string | null;
  referralGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorDTO {
  id: string;
  name: string;
  nameBn: string;
  specialty: string;
  specialtyBn: string;
  facility: string;
  facilityBn: string;
  upazila: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  fee: number;
  available: boolean;
  rating: number;
  teleconsult: boolean;
}

export interface MedicineDTO {
  id: string;
  brandName: string;
  genericName: string;
  genericNameBn: string;
  manufacturer: string;
  category: string;
  dosageForm: string;
  strength: string;
  priceBdt: number;
  genericPrice: number;
  inStock: boolean;
  dgdaApproved: boolean;
}

export interface PharmacyDTO {
  id: string;
  name: string;
  nameBn: string;
  address: string;
  upazila: string;
  phone: string;
  lat: number;
  lng: number;
  open24h: boolean;
  delivery: boolean;
}

export interface AppointmentDTO {
  id: string;
  doctorId: string;
  doctor: DoctorDTO;
  patientName: string;
  patientPhone: string;
  reason: string;
  type: "VIDEO" | "IN_PERSON" | string;
  scheduledAt: string;
  durationMin: number;
  fee: number;
  paymentMethod: string;
  paymentStatus: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
  notes: string | null;
  prescription: string | null; // JSON array
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  items: string; // JSON array
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export function parseJsonArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
