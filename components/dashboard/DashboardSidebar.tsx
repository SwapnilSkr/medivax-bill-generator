"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, FileText, FileEdit, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Overview", href: "/dashboard", match: "overview" as const },
  { label: "Invoices", href: "/dashboard?tab=bills", match: "bills" as const },
  { label: "Drafts", href: "/dashboard?tab=drafts", match: "drafts" as const },
];

function currentSection(searchParams: URLSearchParams): "overview" | "bills" | "drafts" {
  const t = searchParams.get("tab");
  if (t === "drafts") return "drafts";
  if (t === "bills") return "bills";
  return "overview";
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = currentSection(searchParams);
  const onDashboard = pathname === "/dashboard";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/60 bg-slate-950 text-slate-100">
      <div className="shrink-0 border-b border-white/10 px-4 py-5">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src="/assets/MedivaxLogo.jpeg"
            alt="Medivax Pharma"
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-xl object-contain ring-1 ring-white/15"
            priority
          />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-white">Medivax Pharma</h1>
            <p className="truncate text-xs text-slate-400">Billing workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3">
        <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Navigate
        </p>
        {mainNav.map((item) => {
          const active = onDashboard && section === item.match;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              {item.match === "overview" && <LayoutDashboard className="size-4 shrink-0 opacity-90" />}
              {item.match === "bills" && <FileText className="size-4 shrink-0 opacity-90" />}
              {item.match === "drafts" && <FileEdit className="size-4 shrink-0 opacity-90" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-white/10 bg-slate-950 p-3">
        <Link
          href="/generate"
          className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-slate-100"
        >
          <Plus className="size-4 shrink-0" />
          New invoice
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
        >
          <Home className="size-4 shrink-0" />
          Marketing site
        </Link>
      </div>
    </aside>
  );
}
