import { titleCase } from "../utils/formatters";
import { cn } from "../lib/ui";

type StatusBadgeProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-cyan-100 text-cyan-700",
  shipped: "bg-sky-100 text-sky-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = String(status).toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]",
        statusClasses[key] || "bg-mint-100 text-mint-600",
      )}
    >
      {titleCase(status)}
    </span>
  );
}
