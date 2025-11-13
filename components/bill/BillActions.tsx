import { ItemType } from "@/types/bill";
import {
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
  numberToWords,
} from "@/utils/bill";

interface BillActionsProps {
  items: ItemType[];
  orientation: "portrait" | "landscape";
  onOrientationChange: (orientation: "portrait" | "landscape") => void;
  onPrint: () => void;
  onExportPDF: () => void;
}

export default function BillActions({
  items,
  orientation,
  onOrientationChange,
  onPrint,
  onExportPDF,
}: BillActionsProps) {
  const totalAmount = calculateTotal(items);
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
        <p>
          <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}
        </p>
        <p>
          <strong>In Words:</strong> {numberToWords(totalAmount)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div>
          <label className="block mb-1">PDF Orientation:</label>
          <select
            value={orientation}
            onChange={(e) =>
              onOrientationChange(e.target.value as "portrait" | "landscape")
            }
            className="p-2 border rounded"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <button
          onClick={onPrint}
          className="bg-[#22c55e] text-white px-4 py-2 rounded hover:bg-[#16a34a]"
        >
          Print Bill
        </button>
        <button
          onClick={onExportPDF}
          className="bg-[#a855f7] text-white px-4 py-2 rounded hover:bg-[#9333ea]"
        >
          Export as PDF
        </button>
      </div>
    </div>
  );
}

