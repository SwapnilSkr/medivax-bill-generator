"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { useBill } from "@/hooks/useBill";
import {
  deleteDraft,
  getBill,
  getDraft,
  saveBill,
  saveDraft,
  syncInventoryForBill,
  InventoryStockError,
} from "@/lib/firebase";
import { exportToPDF } from "@/utils/pdf";
import { celebrateBillSaved } from "@/utils/confetti";
import { appToast } from "@/lib/app-toast";
import { useInventory } from "@/hooks/useInventory";
import { VaccineFormDialog } from "@/components/inventory/VaccineFormDialog";
import BillForm from "@/components/bill/BillForm";
import ItemsTable from "@/components/bill/ItemsTable";
import BillPreview from "@/components/bill/BillPreview";
import BillActions from "@/components/bill/BillActions";
import SaveDraftModal from "@/components/dashboard/SaveDraftModal";
import { Button } from "@/components/ui/button";

function GenerateContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const billId = searchParams.get("billId");

  const {
    billInfo,
    items,
    orientation,
    setOrientation,
    includeGst,
    setIncludeGst,
    editingBillId,
    editingDraftId,
    setEditingBillId,
    setEditingDraftId,
    handleBillInfoChange,
    handleItemChange,
    addItem,
    removeItem,
    applyInventoryToRow,
    loadFromDraft,
    loadFromBill,
    reset,
    savedInventoryAdjustments,
  } = useBill();

  const {
    items: inventoryItems,
    addItem: addInventoryItem,
  } = useInventory();

  const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
  const [addVaccineOpen, setAddVaccineOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingDraftDisplayName, setEditingDraftDisplayName] = useState("");
  const componentRef = useRef<HTMLDivElement>(null);
  /* Keep latest Firestore ids in refs so saves after create cannot race React state updates. */
  const billIdRef = useRef<string | null>(null);
  const draftIdRef = useRef<string | null>(null);
  const saveBillInFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    billIdRef.current = editingBillId;
  }, [editingBillId]);
  useEffect(() => {
    draftIdRef.current = editingDraftId;
  }, [editingDraftId]);

  useEffect(() => {
    if (draftId) {
      getDraft(draftId).then((draft) => {
        if (draft) {
          loadFromDraft(draft);
          setEditingDraftDisplayName(draft.displayName);
        }
        setLoading(false);
      });
    } else if (billId) {
      getBill(billId).then((bill) => {
        if (bill) loadFromBill(bill);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [draftId, billId, loadFromDraft, loadFromBill]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        size: A4 ${orientation === "landscape" ? "landscape" : "portrait"};
        margin: 5mm;
      }
      html, body {
        width: 100% !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `,
  });

  const handlePrintClick = () => {
    handlePrint();
  };

  const handleExportPDF = async (): Promise<void> => {
    const input = componentRef.current;
    if (!input) return;
    /* Let layout/fonts settle so PDF raster matches the visible bill */
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await exportToPDF(input, orientation);
  };

  const handleExportExcel = async (): Promise<void> => {
    try {
      const { exportBillToExcel } = await import("@/utils/exportBillExcel");
      await exportBillToExcel({
        billInfo,
        items,
        showGst: includeGst,
      });
      appToast("success", "Excel downloaded.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to export Excel";
      appToast("error", msg);
      console.error("Export Excel error:", err);
    }
  };

  const handleExportCsv = async (): Promise<void> => {
    try {
      const { exportBillToCsv } = await import("@/utils/exportBillCsv");
      await exportBillToCsv({
        billInfo,
        items,
        showGst: includeGst,
      });
      appToast("success", "CSV downloaded.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to export CSV";
      appToast("error", msg);
      console.error("Export CSV error:", err);
    }
  };

  const getBillDisplayName = () => {
    const no = billInfo.billNo || "Draft";
    const date = billInfo.billDate || new Date().toISOString().split("T")[0];
    return `Bill #${no} - ${date}`;
  };

  const handleSaveBill = async () => {
    if (saveBillInFlightRef.current) {
      await saveBillInFlightRef.current;
      return;
    }
    const run = async () => {
      try {
        const displayName = getBillDisplayName();
        const draftIdToRemove = draftIdRef.current;

        let inventoryAdjustments = savedInventoryAdjustments;
        try {
          inventoryAdjustments = await syncInventoryForBill(
            items,
            savedInventoryAdjustments,
          );
        } catch (err) {
          if (err instanceof InventoryStockError) {
            const detail = err.issues
              .map(
                (i) =>
                  `${i.name}: billing ${i.requested}, only ${i.available} in stock`,
              )
              .join(" · ");
            appToast("error", `Not enough stock. ${detail}`);
            return;
          }
          throw err;
        }

        const id = await saveBill(billIdRef.current, {
          displayName,
          billInfo,
          items,
          orientation,
          includeGst,
          inventoryAdjustments,
        });
        billIdRef.current = id;
        setEditingBillId(id);
        let draftCleanupFailed = false;
        if (draftIdToRemove) {
          try {
            await deleteDraft(draftIdToRemove);
            draftIdRef.current = null;
            setEditingDraftId(null);
            setEditingDraftDisplayName("");
          } catch (delErr) {
            console.error("Delete draft after bill save:", delErr);
            draftCleanupFailed = true;
          }
        }
        void celebrateBillSaved();
        if (draftCleanupFailed) {
          appToast(
            "error",
            "Bill saved, but the draft could not be removed. Try deleting it from the Dashboard.",
          );
        } else {
          appToast("success", "Bill saved! View it in the Dashboard.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save bill";
        appToast("error", msg);
        console.error("Save bill error:", err);
      } finally {
        saveBillInFlightRef.current = null;
      }
    };
    const p = run();
    saveBillInFlightRef.current = p;
    await p;
  };

  const handleSaveDraft = async (displayName: string) => {
    try {
      const id = await saveDraft(draftIdRef.current, {
        displayName,
        billInfo,
        items,
        orientation,
        includeGst,
      });
      draftIdRef.current = id;
      setEditingDraftId(id);
      setEditingDraftDisplayName(displayName);
      setSaveDraftModalOpen(false);
      appToast("success", "Draft saved! View it in the Dashboard.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      appToast("error", msg);
      console.error("Save draft error:", err);
    }
  };

  const currentDraftName = editingDraftDisplayName;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <GeneratePageHeader />
        <main className="container mx-auto flex-1 p-4">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GeneratePageHeader />
      <main className="container mx-auto flex-1 p-4">
        <BillForm
          billInfo={billInfo}
          onChange={handleBillInfoChange}
          includeGst={includeGst}
          onIncludeGstChange={setIncludeGst}
        />

        <ItemsTable
          items={items}
          includeGst={includeGst}
          inventory={inventoryItems}
          previousInventoryAdjustments={savedInventoryAdjustments}
          onItemChange={handleItemChange}
          onApplyInventory={applyInventoryToRow}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onAddVaccine={() => setAddVaccineOpen(true)}
        />

        <BillActions
          items={items}
          includeGst={includeGst}
          orientation={orientation}
          onOrientationChange={setOrientation}
          onPrint={handlePrintClick}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
          onSaveBill={handleSaveBill}
          onSaveDraft={() => setSaveDraftModalOpen(true)}
          onReset={reset}
          isEditingDraft={!!editingDraftId}
        />

        <BillPreview
          billInfo={billInfo}
          items={items}
          componentRef={componentRef}
          showGst={includeGst}
        />

        <SaveDraftModal
          open={saveDraftModalOpen}
          currentName={currentDraftName}
          isUpdate={!!editingDraftId}
          onClose={() => setSaveDraftModalOpen(false)}
          onSave={handleSaveDraft}
        />

        <VaccineFormDialog
          open={addVaccineOpen}
          onOpenChange={setAddVaccineOpen}
          onSubmit={async (data) => {
            await addInventoryItem(data);
            appToast("success", "Vaccine added. Pick it from Inventory on any row.");
          }}
        />
      </main>
    </div>
  );
}

function GeneratePageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4 md:h-16">
        <h1 className="truncate text-lg font-bold tracking-tight md:text-2xl">
          Medivax Pharma Bill Generator
        </h1>
        <div className="flex shrink-0 gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function BillGenerator() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background">
          <GeneratePageHeader />
          <main className="container mx-auto flex-1 p-4">
            <p>Loading...</p>
          </main>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
