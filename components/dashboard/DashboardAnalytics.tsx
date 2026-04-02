"use client";

import type { CSSProperties } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import type { BillDocument } from "@/types/bill";
import { buildMonthlySeries, buildPaymentModeSeries, formatInrLakhs } from "@/utils/dashboard-analytics";

interface DashboardAnalyticsProps {
  bills: BillDocument[];
}

const tooltipStyle: CSSProperties = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 12px 40px -12px oklch(0.2 0.05 265 / 0.18)",
};

export default function DashboardAnalytics({ bills }: DashboardAnalyticsProps) {
  const monthly = buildMonthlySeries(bills, 6);
  const paymentSlices = buildPaymentModeSeries(bills);
  const totalPaidCount = paymentSlices.reduce((s, x) => s + x.value, 0);
  const revenueTotal = monthly.reduce((s, m) => s + m.revenue, 0);

  return (
    <section className="mb-8">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Billing analytics</h2>
          <p className="text-sm text-muted-foreground">
            Trailing six months by creation date · {bills.length} invoice{bills.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-1 font-medium tabular-nums text-foreground">
            {formatInrLakhs(revenueTotal)} <span className="font-normal text-muted-foreground">booked</span>
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
            <TrendingUp className="size-4 text-primary" aria-hidden />
            Revenue trend
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" className="stroke-border/60" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  tickFormatter={(v) => formatInrLakhs(Number(v))}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    if (!Number.isFinite(n)) return ["—", "Revenue"];
                    return [
                      `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                      "Revenue",
                    ];
                  }}
                  labelFormatter={(label) => String(label)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#dashRevenueFill)"
                  dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <PieChartIcon className="size-4 text-primary" aria-hidden />
              Volume by month
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" className="stroke-border/60" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => {
                      const n = typeof value === "number" ? value : Number(value);
                      return [Number.isFinite(n) ? n : 0, "Invoices"];
                    }}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar dataKey="billCount" name="Invoices" radius={[6, 6, 0, 0]} fill="var(--chart-3)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="mb-1 text-sm font-medium text-foreground">Payment terms mix</div>
            <p className="mb-3 text-xs text-muted-foreground">Share of invoices by mode</p>
            <div className="relative mx-auto h-[180px] w-full max-w-[220px]">
              {totalPaidCount === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  No invoice data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentSlices}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {paymentSlices.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} stroke="var(--card)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => {
                        const total = paymentSlices.reduce((s, x) => s + x.value, 0);
                        const n = typeof value === "number" ? value : Number(value);
                        const v = Number.isFinite(n) ? n : 0;
                        const pct = total ? Math.round((v / total) * 100) : 0;
                        return [`${v} (${pct}%)`, String(name)];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {totalPaidCount > 0 && (
              <ul className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                {paymentSlices.map((s) => (
                  <li key={s.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.fill }} aria-hidden />
                    <span className="text-foreground">{s.name}</span>
                    <span className="tabular-nums">({s.value})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
