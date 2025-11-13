import { ItemType } from "@/types/bill";
import {
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
} from "@/utils/bill";

interface BillPreviewTableProps {
  items: ItemType[];
}

export default function BillPreviewTable({ items }: BillPreviewTableProps) {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr className="bg-gray-400">
          <th className="border border-black p-1 text-xs w-[4%] align-top">
            Sr.
          </th>
          <th className="border border-black p-1 text-xs w-[15%] align-top">
            DESCRIPTION
          </th>
          <th className="border border-black p-1 text-xs w-[10%] align-top">
            HSN
          </th>
          <th className="border border-black p-1 text-xs w-[8%] align-top">
            MFG
          </th>
          <th className="border border-black p-1 text-xs w-[7%] align-top">
            QTY
          </th>
          <th className="border border-black p-1 text-xs w-[7%] align-top">
            UNIT
          </th>
          <th className="border border-black p-1 text-xs w-[10%] align-top">
            BATCH
          </th>
          <th className="border border-black p-1 text-xs w-[8%] align-top">
            EXP.
          </th>
          <th className="border border-black p-1 text-xs w-[7%] align-top">
            MRP
          </th>
          <th className="border border-black p-1 text-xs w-[6%] align-top">
            DISC
          </th>
          <th className="border border-black p-1 text-xs w-[6%] align-top">
            RATE
          </th>
          <th className="border border-black p-1 text-xs w-[11%] align-top">
            AMOUNT
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className="text-xs">
            <td className="border border-black p-1 text-center align-top">
              {index + 1}
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.description}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.hsn}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.mfg}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.qty}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.unit}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.batch}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.exp}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.mrp}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.disc}
              </div>
            </td>
            <td className="border border-black p-1 align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.rate}
              </div>
            </td>
            <td className="border border-black p-1 text-right align-top">
              <div className="w-full whitespace-pre-wrap break-words overflow-visible min-h-[20px]">
                {item.amount?.toFixed(2) || ""}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className="text-xs">
        <tr>
          <td colSpan={11} className="border border-black p-1 text-right">
            <strong>ITEMS: {getActiveItemCount(items)}</strong>
          </td>
          <td className="border border-black p-1">
            <strong>QTY: {calculateTotalItems(items)}</strong>
          </td>
        </tr>
        <tr>
          <td colSpan={11} className="border border-black p-1 text-right">
            <strong>Total Pay(Rs.):</strong>
          </td>
          <td className="border border-black p-1 text-right whitespace-normal break-words">
            <strong>{calculateTotal(items).toFixed(2)}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

