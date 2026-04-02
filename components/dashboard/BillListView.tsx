import { BillInfoType, ItemType } from "@/types/bill";
import { calculateGstBreakdown } from "@/utils/bill";
import BillHeader from "@/components/bill/BillHeader";
import BillPreviewTable from "@/components/bill/BillPreviewTable";
import BillFooter from "@/components/bill/BillFooter";

interface BillListViewProps {
  billInfo: BillInfoType;
  items: ItemType[];
  showGst?: boolean;
}

export default function BillListView({
  billInfo,
  items,
  showGst = true,
}: BillListViewProps) {
  const gst = showGst ? calculateGstBreakdown(items) : null;
  return (
    <div className="overflow-hidden rounded-sm border-2 border-slate-900 bg-white px-3 py-2 shadow-sm md:px-6">
      <BillHeader billInfo={billInfo} showGst={showGst} />
      <BillPreviewTable items={items} showGst={showGst} gst={gst} />
      <BillFooter items={items} showGst={showGst} gst={gst} />
    </div>
  );
}
