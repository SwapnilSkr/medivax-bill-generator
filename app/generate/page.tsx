"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useBill } from "@/hooks/useBill";
import { exportToPDF } from "@/utils/pdf";
import BillForm from "@/components/bill/BillForm";
import ItemsTable from "@/components/bill/ItemsTable";
import BillPreview from "@/components/bill/BillPreview";
import BillActions from "@/components/bill/BillActions";

export default function BillGenerator() {
  const {
    billInfo,
    items,
    orientation,
    setOrientation,
    handleBillInfoChange,
    handleItemChange,
    addItem,
    removeItem,
  } = useBill();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handlePrintClick = () => {
    handlePrint();
  };

  const handleExportPDF = async (): Promise<void> => {
    const input = componentRef.current;
    if (!input) return;
    await exportToPDF(input, orientation);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Medivax Pharma Bill Generator</h1>

      <BillForm billInfo={billInfo} onChange={handleBillInfoChange} />

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
      />

      <BillPreview
        billInfo={billInfo}
        items={items}
        componentRef={componentRef}
      />
    </div>
  );
}
