"use client";

import { FileText, FileEdit, IndianRupee, TrendingUp } from "lucide-react";
import type { BillDocument, DraftDocument } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";

interface DashboardStatsProps {
  bills: BillDocument[];
  drafts: DraftDocument[];
}

export default function DashboardStats({ bills, drafts }: DashboardStatsProps) {
  const totalRevenue = bills.reduce((sum, bill) => sum + calculateTotal(bill.items), 0);
  const totalBills = bills.length;
  const totalDrafts = drafts.length;
  const aov = totalBills > 0 ? totalRevenue / totalBills : 0;

  const stats = [
    {
      label: "Invoices issued",
      sub: "Posted to ledger",
      value: totalBills.toLocaleString("en-IN"),
      icon: FileText,
    },
    {
      label: "Booked value",
      sub: "Sum of line totals",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
    },
    {
      label: "Draft pipeline",
      sub: "In progress",
      value: totalDrafts.toLocaleString("en-IN"),
      icon: FileEdit,
    },
    {
      label: "Avg. invoice",
      sub: "Mean ticket size",
      value: `₹${aov.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/6 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
              <p className="mt-2 wrap-break-word text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <stat.icon className="size-5" strokeWidth={1.75} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
