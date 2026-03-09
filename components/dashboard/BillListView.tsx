import { BillInfoType, ItemType } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";
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
  return (
    <div className="border px-[70px] py-2 bg-white">
      <BillHeader billInfo={billInfo} showGst={showGst} />
      <BillPreviewTable items={items} />
      <BillFooter totalAmount={calculateTotal(items)} />
    </div>
  );
}
