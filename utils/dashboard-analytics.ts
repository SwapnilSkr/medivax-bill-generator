import type { BillDocument } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";

export type MonthlyPoint = {
  monthKey: string;
  label: string;
  revenue: number;
  billCount: number;
};

export type PaymentModeSlice = {
  name: string;
  value: number;
  fill: string;
};

function billDate(b: BillDocument): Date {
  const d = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as string);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

export function buildMonthlySeries(bills: BillDocument[], monthsBack = 6): MonthlyPoint[] {
  const now = new Date();
  const points: MonthlyPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      monthKey: mk,
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      revenue: 0,
      billCount: 0,
    });
  }

  for (const bill of bills) {
    const d = billDate(bill);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const p = points.find((x) => x.monthKey === mk);
    if (p) {
      p.revenue += calculateTotal(bill.items);
      p.billCount += 1;
    }
  }

  return points;
}

/** Payment mode counts for donut / pie (GST invoices). */
export function buildPaymentModeSeries(bills: BillDocument[]): PaymentModeSlice[] {
  let credit = 0;
  let cash = 0;
  for (const bill of bills) {
    if (bill.billInfo.mode === "CREDIT") credit += 1;
    else cash += 1;
  }
  return [
    { name: "Credit", value: credit, fill: "var(--chart-1)" },
    { name: "Cash / Online", value: cash, fill: "var(--chart-2)" },
  ];
}

export function formatInrLakhs(n: number): string {
  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(2)}L`;
  }
  if (n >= 1000) {
    return `₹${(n / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
