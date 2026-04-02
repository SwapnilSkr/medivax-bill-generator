"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillDocument } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";

interface DashboardRecentInvoicesProps {
  bills: BillDocument[];
  onViewAll: () => void;
}

export default function DashboardRecentInvoices({ bills, onViewAll }: DashboardRecentInvoicesProps) {
  const recent = [...bills]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent invoices</h2>
          <p className="text-sm text-muted-foreground">Latest updates in your workspace</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 shrink-0 rounded-lg gap-1.5" onClick={onViewAll}>
          View all
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium text-foreground">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first bill to see activity here.</p>
          <Button asChild className="mt-6 rounded-lg" size="sm">
            <Link href="/generate">New invoice</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Party</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium w-[100px]"> </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((bill) => {
                const total = calculateTotal(bill.items);
                return (
                  <tr
                    key={bill.id}
                    className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/25"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{bill.displayName}</p>
                      <p className="text-xs text-muted-foreground">#{bill.billInfo.billNo}</p>
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-3 text-muted-foreground sm:table-cell">
                      {bill.billInfo.doctorName || "—"}
                    </td>
                    <td className="hidden px-4 py-3 tabular-nums text-muted-foreground md:table-cell">
                      {bill.billInfo.billDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs" asChild>
                        <Link href={`/dashboard?viewBill=${bill.id}`}>Open</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
