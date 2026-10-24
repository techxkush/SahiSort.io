import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldQuestion, ShieldAlert } from "lucide-react";

export const STATUS = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    cls: "bg-verified/12 text-verified border-verified/30",
    desc: "The guide clearly supports this recommendation for this material and condition.",
  },
  conditional: {
    label: "Conditional",
    icon: ShieldQuestion,
    cls: "bg-conditional/15 text-foreground border-conditional/40",
    desc: "This depends on a condition or an unanswered question. Check the conditions below.",
  },
  insufficient: {
    label: "Insufficient evidence",
    icon: ShieldAlert,
    cls: "bg-insufficient/12 text-foreground border-insufficient/40",
    desc: "The configured guide doesn't adequately cover this item. Treat any advice as general.",
  },
  not_covered: {
    label: "Not covered",
    icon: ShieldAlert,
    cls: "bg-destructive/15 text-destructive border-destructive/40",
    desc: "Not covered by this guide. Please contact your local authority.",
  },
} as const;

export function StatusBadge({
  status,
  className,
}: {
  status: keyof typeof STATUS;
  className?: string;
}) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        s.cls,
        className,
      )}
    >
      <Icon className="size-3.5" /> {s.label}
    </span>
  );
}
