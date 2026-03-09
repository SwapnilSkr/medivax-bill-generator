"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBills } from "@/hooks/useBills";
import { useDrafts } from "@/hooks/useDrafts";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { BillsTable, DraftsTable } from "@/components/dashboard/DashboardTable";
import BillListView from "@/components/dashboard/BillListView";
import type { BillDocument } from "@/types/bill";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewBillId = searchParams.get("viewBill");
  const tabParam = searchParams.get("tab");

  const { bills, loading: billsLoading, fetchBill, renameBill, deleteBill } =
    useBills();
  const { drafts, loading: draftsLoading, renameDraft, deleteDraft } =
    useDrafts();

  const [activeTab, setActiveTab] = useState<"bills" | "drafts">(
    tabParam === "drafts" ? "drafts" : "bills"
  );
  const [viewingBill, setViewingBill] = useState<BillDocument | null>(null);

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

  useEffect(() => {
    if (tabParam === "drafts") {
      setActiveTab("drafts");
    } else if (tabParam === "bills") {
      setActiveTab("bills");
    }
  }, [tabParam]);

  const loading = billsLoading || draftsLoading;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {activeTab === "bills" ? "Bills" : "Drafts"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your bills and drafts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Link href="/generate">
                <Button size="sm">
                  <Plus className="size-4 mr-2" />
                  New Bill
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats bills={bills} drafts={drafts} />

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-white rounded-lg p-1 border shadow-sm w-fit">
            <button
              onClick={() => {
                setActiveTab("bills");
                router.replace("/dashboard?tab=bills");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "bills"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Bills ({bills.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("drafts");
                router.replace("/dashboard?tab=drafts");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "drafts"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Drafts ({drafts.length})
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : activeTab === "bills" ? (
            <BillsTable bills={bills} onRename={renameBill} onDelete={deleteBill} />
          ) : (
            <DraftsTable drafts={drafts} onRename={renameDraft} onDelete={deleteDraft} />
          )}
        </div>
      </main>

      {/* View Bill Modal */}
      {viewingBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => router.replace("/dashboard")}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-background">
              <h2 className="text-lg font-semibold">{viewingBill.displayName}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.replace("/dashboard")}
              >
                Close
              </Button>
            </div>
            <div className="p-6">
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
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
