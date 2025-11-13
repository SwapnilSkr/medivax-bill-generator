import { BillInfoType, ItemType } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";
import BillHeader from "./BillHeader";
import BillPreviewTable from "./BillPreviewTable";
import BillFooter from "./BillFooter";

interface BillPreviewProps {
  billInfo: BillInfoType;
  items: ItemType[];
  componentRef: React.RefObject<HTMLDivElement | null>;
}

export default function BillPreview({
  billInfo,
  items,
  componentRef,
}: BillPreviewProps) {
  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold mb-4">Bill Preview</h2>
      <div className="border px-[70px] py-2" ref={componentRef}>
        <BillHeader billInfo={billInfo} />
        <BillPreviewTable items={items} />
        <BillFooter totalAmount={calculateTotal(items)} />
      </div>
    </div>
  );
}
