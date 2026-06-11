import { TRIAGE_STYLES, cn } from "@/lib/utils";

export default function RiskBadge({
  level,
  className,
  showLabel = true,
}: {
  level: string;
  className?: string;
  showLabel?: boolean;
}) {
  const style = TRIAGE_STYLES[level] ?? TRIAGE_STYLES.GREEN;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide",
        style.badge,
        level === "RED" && "animate-pulse",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {level}
      {showLabel && <span className="font-medium opacity-75">· {style.label}</span>}
    </span>
  );
}
