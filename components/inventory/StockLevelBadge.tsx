import { cn } from "@/lib/utils";
import type { StockLevel } from "@/utils/inventory";

const styles: Record<StockLevel, string> = {
  ok: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  low: "bg-amber-500/10 text-amber-800 ring-amber-500/25 dark:text-amber-300",
  out: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
};

const labels: Record<StockLevel, string> = {
  ok: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

interface StockLevelBadgeProps {
  level: StockLevel;
  quantity: number;
  className?: string;
}

export function StockLevelBadge({
  level,
  quantity,
  className,
}: StockLevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[level],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          level === "ok" && "bg-emerald-500",
          level === "low" && "bg-amber-500",
          level === "out" && "bg-red-500",
        )}
        aria-hidden
      />
      {labels[level]} · {quantity}
    </span>
  );
}
