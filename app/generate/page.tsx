"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { useBill } from "@/hooks/useBill";
import { getBill, getDraft, saveBill, saveDraft } from "@/lib/firebase";
import { exportToPDF } from "@/utils/pdf";
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
    handleBillInfoChange,
    handleItemChange,
    addItem,
    removeItem,
    loadFromDraft,
    loadFromBill,
    reset,
  } = useBill();

  const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingDraftDisplayName, setEditingDraftDisplayName] = useState("");
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 4000);
  };

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
  });

  const handlePrintClick = async () => {
    await handleSaveBill();
    handlePrint();
  };

  const handleExportPDF = async (): Promise<void> => {
    const input = componentRef.current;
    if (!input) return;
    await handleSaveBill();
    await exportToPDF(input, orientation);
  };

  const getBillDisplayName = () => {
    const no = billInfo.billNo || "Draft";
    const date = billInfo.billDate || new Date().toISOString().split("T")[0];
    return `Bill #${no} - ${date}`;
  };

  const handleSaveBill = async () => {
    try {
      const displayName = getBillDisplayName();
      await saveBill(editingBillId, {
        displayName,
        billInfo,
        items,
        orientation,
        includeGst,
      });
      showMessage("success", "Bill saved! View it in the Dashboard.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save bill";
      showMessage("error", msg);
      console.error("Save bill error:", err);
    }
  };

  const handleSaveDraft = async (displayName: string) => {
    try {
      await saveDraft(editingDraftId, {
        displayName,
        billInfo,
        items,
        orientation,
        includeGst,
      });
      setSaveDraftModalOpen(false);
      showMessage("success", "Draft saved! View it in the Dashboard.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      showMessage("error", msg);
      console.error("Save draft error:", err);
    }
  };

  const currentDraftName = editingDraftDisplayName;

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {saveMessage && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 ${
            saveMessage.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Medivax Pharma Bill Generator</h1>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </div>

      <BillForm
        billInfo={billInfo}
        onChange={handleBillInfoChange}
        includeGst={includeGst}
        onIncludeGstChange={setIncludeGst}
      />

      <ItemsTable
        items={items}
        onItemChange={handleItemChange}
        onAddItem={addItem}
        onRemoveItem={removeItem}
      />

      <BillActions
        items={items}
        orientation={orientation}
        onOrientationChange={setOrientation}
        onPrint={handlePrintClick}
        onExportPDF={handleExportPDF}
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
    </div>
  );
}

export default function BillGenerator() {
  return (
    <Suspense fallback={<div className="container p-4">Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
