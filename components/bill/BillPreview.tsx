import { BillInfoType, ItemType } from "@/types/bill";
import { calculateGstBreakdown } from "@/utils/bill";
import BillHeader from "./BillHeader";
import BillPreviewTable from "./BillPreviewTable";
import BillFooter from "./BillFooter";

interface BillPreviewProps {
  billInfo: BillInfoType;
  items: ItemType[];
  componentRef: React.RefObject<HTMLDivElement | null>;
  showGst?: boolean;
}

export default function BillPreview({
  billInfo,
  items,
  componentRef,
  showGst = true,
}: BillPreviewProps) {
  const gst = showGst ? calculateGstBreakdown(items) : null;

  return (
    <div className="mt-2">
      <h2 className="mb-4 text-xl font-bold print:hidden">Bill Preview</h2>
      <div
        ref={componentRef}
        className="invoice-print-root invoice-compact mx-auto w-full max-w-[210mm] overflow-visible rounded-sm border-2 border-slate-900 bg-white shadow-sm print:mx-0 print:max-w-none print:rounded-none print:shadow-none"
      >
        <div className="min-w-0 px-3 py-3.5">
          <BillHeader billInfo={billInfo} showGst={showGst} />
          <BillPreviewTable items={items} showGst={showGst} gst={gst} />
          <BillFooter items={items} showGst={showGst} gst={gst} />
        </div>
      </div>
    </div>
  );
}
