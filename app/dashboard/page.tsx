"use client";

import { useState, useEffect, Suspense, useCallback, useRef, useMemo } from "react";
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
import DashboardInventory from "@/components/dashboard/DashboardInventory";
import { ViewBillDialog } from "@/components/dashboard/ViewBillDialog";
import { useInventory } from "@/hooks/useInventory";
import type { BillDocument } from "@/types/bill";
import { cn } from "@/lib/utils";
import { defaultDashboardDateFilter } from "@/lib/dashboardMonthFilter";
import { filterBillsForToolbar, filterDraftsForToolbar } from "@/lib/dashboardTableFilters";
import { appToastError } from "@/lib/app-toast";
import { buildDashboardUrl } from "@/lib/dashboardUrl";

type DashboardSection = "overview" | "bills" | "drafts" | "inventory";

function sectionFromSearchParams(tab: string | null): DashboardSection {
  if (tab === "drafts") return "drafts";
  if (tab === "bills") return "bills";
  if (tab === "inventory") return "inventory";
  return "overview";
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewBillId = searchParams.get("viewBill");
  const tabParam = searchParams.get("tab");
  const section = sectionFromSearchParams(tabParam);

  const {
    bills,
    loading: billsLoading,
    error: billsError,
    fetchBill,
    renameBill,
    deleteBill,
  } = useBills();
  const {
    drafts,
    loading: draftsLoading,
    error: draftsError,
    renameDraft,
    deleteDraft,
  } = useDrafts();
  const {
    items: inventoryItems,
    loading: inventoryLoading,
    error: inventoryError,
    addItem: addInventoryItem,
    updateItem: updateInventoryItem,
    removeItem: removeInventoryItem,
    adjustStock,
  } = useInventory();

  const [viewingBill, setViewingBill] = useState<BillDocument | null>(null);
  const wasBillInLiveListRef = useRef(false);
  const lastListErrorToastRef = useRef<string | null>(null);

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState(defaultDashboardDateFilter);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftDateFilter, setDraftDateFilter] = useState(defaultDashboardDateFilter);

  const scopedBills = useMemo(
    () => filterBillsForToolbar(bills, invoiceDateFilter, invoiceSearch),
    [bills, invoiceDateFilter, invoiceSearch],
  );
  const scopedDrafts = useMemo(
    () => filterDraftsForToolbar(drafts, draftDateFilter, draftSearch),
    [drafts, draftDateFilter, draftSearch],
  );

  const dashboardPath = useCallback(() => {
    return buildDashboardUrl(searchParams, { viewBill: null });
  }, [searchParams]);

  const openViewBill = useCallback(
    (id: string) => {
      /* Defer navigation until after the actions menu closes (avoids dismiss-on-open). */
      queueMicrotask(() => {
        router.push(buildDashboardUrl(searchParams, { viewBill: id }));
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    wasBillInLiveListRef.current = false;
  }, [viewBillId]);

  useEffect(() => {
    if (!viewBillId) {
      setViewingBill(null);
      return;
    }
    const fromList = bills.find((b) => b.id === viewBillId);
    if (fromList) {
      wasBillInLiveListRef.current = true;
      setViewingBill(fromList);
      return;
    }
    if (wasBillInLiveListRef.current && !billsLoading) {
      wasBillInLiveListRef.current = false;
      setViewingBill(null);
    }
  }, [viewBillId, bills, billsLoading]);

  /* Fetch once per viewBillId when the id is not in the live list yet.
   * Omitting `bills` avoids re-running getDoc on every snapshot update (exhaustive-deps). */
  useEffect(() => {
    if (!viewBillId) return;
    if (bills.some((b) => b.id === viewBillId)) return;

    let cancelled = false;
    void fetchBill(viewBillId).then((b) => {
      if (cancelled) return;
      setViewingBill(b ?? null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bills intentionally omitted; see comment above
  }, [viewBillId, fetchBill]);

  const loading = billsLoading || draftsLoading;
  const listError =
    [billsError, draftsError, inventoryError].filter(Boolean).join(" · ") || null;

  useEffect(() => {
    if (!listError) {
      lastListErrorToastRef.current = null;
      return;
    }
    if (listError === lastListErrorToastRef.current) return;
    lastListErrorToastRef.current = listError;
    appToastError("Could not load live data", listError);
  }, [listError]);

  const closeViewBill = useCallback(() => {
    setViewingBill(null);
    router.replace(dashboardPath());
  }, [router, dashboardPath]);

  const handleViewBillOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeViewBill();
    },
    [closeViewBill],
  );

  const goToSection = (next: DashboardSection) => {
    if (next === "overview") router.replace("/dashboard");
    else router.replace(`/dashboard?tab=${next}`);
  };

  const titleAndHint =
    section === "overview"
      ? { title: "Operations overview", hint: "KPIs, billing analytics, and latest invoices" }
      : section === "bills"
        ? { title: "Invoices", hint: "Search, edit, and export posted bills" }
        : section === "drafts"
          ? { title: "Drafts", hint: "Continue work-in-progress before posting" }
          : { title: "Vaccine inventory", hint: "Track stock, pricing, and availability for billing" };

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
                    ["bills", `Invoices (${scopedBills.length})`],
                    ["drafts", `Drafts (${scopedDrafts.length})`],
                    ["inventory", `Inventory (${inventoryItems.length})`],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => goToSection(key)}
                    className={cn(
                      "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors",
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

          {section !== "inventory" && (
            <DashboardStats bills={scopedBills} drafts={scopedDrafts} />
          )}

          {section === "overview" && (
            <>
              <DashboardAnalytics bills={scopedBills} />
              <DashboardRecentInvoices
                bills={scopedBills}
                onViewAll={() => goToSection("bills")}
                onViewBill={openViewBill}
              />
            </>
          )}

          {section === "inventory" && (
            <DashboardInventory
              items={inventoryItems}
              loading={inventoryLoading}
              onAdd={addInventoryItem}
              onUpdate={updateInventoryItem}
              onDelete={removeInventoryItem}
              onAdjustStock={adjustStock}
            />
          )}

          {section !== "overview" && section !== "inventory" && (
            <>
              {loading ? (
                <div className="rounded-2xl border border-border/70 bg-card p-12 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">Loading records…</p>
                </div>
              ) : section === "bills" ? (
                <BillsTable
                  bills={bills}
                  search={invoiceSearch}
                  onSearchChange={setInvoiceSearch}
                  dateFilter={invoiceDateFilter}
                  onDateFilterChange={setInvoiceDateFilter}
                  onRename={renameBill}
                  onDelete={deleteBill}
                  onViewBill={openViewBill}
                />
              ) : (
                <DraftsTable
                  drafts={drafts}
                  search={draftSearch}
                  onSearchChange={setDraftSearch}
                  dateFilter={draftDateFilter}
                  onDateFilterChange={setDraftDateFilter}
                  onRename={renameDraft}
                  onDelete={deleteDraft}
                />
              )}
            </>
          )}
        </div>
      </main>

      <ViewBillDialog
        open={Boolean(viewBillId)}
        bill={viewingBill}
        loading={Boolean(viewBillId) && !viewingBill}
        onOpenChange={handleViewBillOpenChange}
      />
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
