export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatBdt(amount: number): string {
  return `৳${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const TRIAGE_STYLES: Record<string, { badge: string; border: string; dot: string; label: string }> = {
  RED: {
    badge: "bg-red-900/30 border border-red-500 text-red-400",
    border: "border-l-red-500",
    dot: "bg-red-500",
    label: "URGENT",
  },
  YELLOW: {
    badge: "bg-amber-900/30 border border-amber-500 text-amber-400",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    label: "48 HOURS",
  },
  GREEN: {
    badge: "bg-green-900/30 border border-green-500 text-green-400",
    border: "border-l-green-500",
    dot: "bg-green-500",
    label: "HOME CARE",
  },
};

export const CHANNEL_STYLES: Record<string, string> = {
  VOICE: "bg-teal-900/40 text-teal-300 border border-teal-700",
  SMS: "bg-blue-900/40 text-blue-300 border border-blue-700",
  APP: "bg-purple-900/40 text-purple-300 border border-purple-700",
};
