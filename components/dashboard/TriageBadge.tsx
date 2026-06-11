import RiskBadge from "@/components/shared/RiskBadge";

export default function TriageBadge({ level }: { level: string }) {
  return <RiskBadge level={level} />;
}
