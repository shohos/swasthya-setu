import { cn } from "@/lib/utils";

export default function BanglaText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("font-bangla", className)}>{children}</span>;
}
