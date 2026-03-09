import { MatchStatus } from "@/lib/types";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from "lucide-react";

const config: Record<
  MatchStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partial Match",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: AlertTriangle,
  },
  conflict: {
    label: "Conflict",
    className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    icon: AlertOctagon,
  },
  unmatched: {
    label: "Unmatched",
    className: "bg-red-500/10 text-red-700 border-red-500/20",
    icon: HelpCircle,
  },
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const { label, className, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
