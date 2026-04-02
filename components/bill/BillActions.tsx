import { ItemType } from "@/types/bill";
import {
  calculateGstBreakdown,
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
  numberToWords,
  amountInWordsInr,
} from "@/utils/bill";
import { Button } from "@/components/ui/button";

interface BillActionsProps {
  items: ItemType[];
  includeGst?: boolean;
  orientation: "portrait" | "landscape";
  onOrientationChange: (orientation: "portrait" | "landscape") => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onSaveBill: () => void | Promise<void>;
  onSaveDraft: () => void;
  onReset?: () => void;
  isEditingDraft?: boolean;
}

export default function BillActions({
  items,
  includeGst = true,
  orientation,
  onOrientationChange,
  onPrint,
  onExportPDF,
  onSaveBill,
  onSaveDraft,
  onReset,
  isEditingDraft,
}: BillActionsProps) {
  const taxableTotal = calculateTotal(items);
  const gst = includeGst ? calculateGstBreakdown(items) : null;
  const totalItems = getActiveItemCount(items);
  const totalQuantity = calculateTotalItems(items);

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <p>
          <strong>Total Items:</strong> {totalItems}
        </p>
        <p>
          <strong>Total Quantity:</strong> {totalQuantity}
        </p>
        {includeGst && gst ? (
          <>
            <p>
              <strong>Taxable value:</strong> ₹{gst.taxableValue.toFixed(2)}
            </p>
            <p>
              <strong>CGST (2.50%):</strong> ₹{gst.cgst.toFixed(2)} &nbsp;|&nbsp;{" "}
              <strong>SGST (2.50%):</strong> ₹{gst.sgst.toFixed(2)}
            </p>
            <p>
              <strong>Grand total:</strong> ₹{gst.grandTotal.toFixed(2)}
            </p>
            <p>
              <strong>In words:</strong> {amountInWordsInr(gst.grandTotal)}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Total Amount:</strong> ₹{taxableTotal.toFixed(2)}
            </p>
            <p>
              <strong>In Words:</strong> {numberToWords(taxableTotal)}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <label className="block mb-1 text-sm font-medium text-muted-foreground">PDF Orientation:</label>
          <select
            value={orientation}
            onChange={(e) =>
              onOrientationChange(e.target.value as "portrait" | "landscape")
            }
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={onSaveDraft}>
          {isEditingDraft ? "Update Draft" : "Save as Draft"}
        </Button>
        <Button size="sm" onClick={onSaveBill} className="bg-blue-600 hover:bg-blue-700 text-white">
          Save Bill
        </Button>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            New Bill
          </Button>
        )}
        <Button size="sm" onClick={onPrint} className="bg-green-600 hover:bg-green-700">
          Print Bill
        </Button>
        <Button size="sm" onClick={onExportPDF} variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
          Export as PDF
        </Button>
      </div>
    </div>
  );
}

