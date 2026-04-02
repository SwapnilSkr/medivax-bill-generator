"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBills } from "@/hooks/useBills";
import { useDrafts } from "@/hooks/useDrafts";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardRecentInvoices from "@/components/dashboard/DashboardRecentInvoices";
import { BillsTable, DraftsTable } from "@/components/dashboard/DashboardTable";
import BillListView from "@/components/dashboard/BillListView";
import type { BillDocument } from "@/types/bill";
import { cn } from "@/lib/utils";

type DashboardSection = "overview" | "bills" | "drafts";

function sectionFromSearchParams(tab: string | null): DashboardSection {
  if (tab === "drafts") return "drafts";
  if (tab === "bills") return "bills";
  return "overview";
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewBillId = searchParams.get("viewBill");
  const tabParam = searchParams.get("tab");
  const section = sectionFromSearchParams(tabParam);

  const { bills, loading: billsLoading, fetchBill, renameBill, deleteBill } = useBills();
  const { drafts, loading: draftsLoading, renameDraft, deleteDraft } = useDrafts();

  const [viewingBill, setViewingBill] = useState<BillDocument | null>(null);

  const dashboardPath = useCallback(() => {
    const p = new URLSearchParams();
    if (tabParam === "bills") p.set("tab", "bills");
    if (tabParam === "drafts") p.set("tab", "drafts");
    const qs = p.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  }, [tabParam]);

  useEffect(() => {
    if (!viewBillId) {
      setViewingBill(null);
      return;
    }
    const bill = bills.find((b) => b.id === viewBillId);
    if (bill) {
      setViewingBill(bill);
      return;
    }
    fetchBill(viewBillId).then((b) => setViewingBill(b ?? null));
  }, [viewBillId, bills, fetchBill]);

  const loading = billsLoading || draftsLoading;

  const closeModal = () => {
    router.replace(dashboardPath());
  };

  const goToSection = (next: DashboardSection) => {
    if (next === "overview") router.replace("/dashboard");
    else router.replace(`/dashboard?tab=${next}`);
  };

  const titleAndHint =
    section === "overview"
      ? { title: "Operations overview", hint: "KPIs, billing analytics, and latest invoices" }
      : section === "bills"
        ? { title: "Invoices", hint: "Search, edit, and export posted bills" }
        : { title: "Drafts", hint: "Continue work-in-progress before posting" };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-muted/40">
      <DashboardSidebar />

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,oklch(0.93_0.03_250/0.35),transparent)] dark:bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,oklch(0.25_0.04_265/0.4),transparent)]" />

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span>Workspace</span>
                <ChevronRight className="size-3.5 opacity-70" aria-hidden />
                <span className="text-foreground">{titleAndHint.title}</span>
              </nav>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{titleAndHint.title}</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{titleAndHint.hint}</p>
              </div>

              <div className="inline-flex rounded-xl border border-border/80 bg-card/90 p-1 shadow-sm backdrop-blur-sm">
                {(
                  [
                    ["overview", "Overview"],
                    ["bills", `Invoices (${bills.length})`],
                    ["drafts", `Drafts (${drafts.length})`],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => goToSection(key)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      section === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
              <Button variant="outline" size="sm" className="h-9 rounded-lg border-border/80 bg-background/80 shadow-none" disabled>
                Export
              </Button>
              <Button asChild size="sm" className="h-9 rounded-lg shadow-sm">
                <Link href="/generate" className="gap-2">
                  <Plus className="size-4" />
                  New invoice
                </Link>
              </Button>
            </div>
          </div>

          <DashboardStats bills={bills} drafts={drafts} />

          {section === "overview" && (
            <>
              <DashboardAnalytics bills={bills} />
              <DashboardRecentInvoices bills={bills} onViewAll={() => goToSection("bills")} />
            </>
          )}

          {section !== "overview" && (
            <>
              {loading ? (
                <div className="rounded-2xl border border-border/70 bg-card p-12 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Loading records…</p>
                </div>
              ) : section === "bills" ? (
                <BillsTable bills={bills} onRename={renameBill} onDelete={deleteBill} />
              ) : (
                <DraftsTable drafts={drafts} onRename={renameDraft} onDelete={deleteDraft} />
              )}
            </>
          )}
        </div>
      </main>

      {viewingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border/60 bg-card shadow-[0_24px_80px_-20px_rgba(15,23,42,0.45)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-labelledby="view-bill-title"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border/60 bg-card/95 px-5 py-4 backdrop-blur-md">
              <h2 id="view-bill-title" className="text-base font-semibold tracking-tight text-foreground">
                {viewingBill.displayName}
              </h2>
              <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={closeModal}>
                Close
              </Button>
            </div>
            <div className="p-6 md:p-8">
              <BillListView
                billInfo={viewingBill.billInfo}
                items={viewingBill.items}
                showGst={viewingBill.includeGst}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-muted/40">
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
