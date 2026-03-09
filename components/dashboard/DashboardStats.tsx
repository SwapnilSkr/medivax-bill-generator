"use client";

import { FileText, FileEdit, DollarSign, Clock } from "lucide-react";
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

  const stats = [
    {
      label: "Total Bills",
      value: totalBills,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Drafts",
      value: totalDrafts,
      icon: FileEdit,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pending",
      value: drafts.length,
      icon: Clock,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
