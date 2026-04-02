import { ItemType } from "@/types/bill";
import {
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
  GstBreakdown,
  round2,
} from "@/utils/bill";

interface BillPreviewTableProps {
  items: ItemType[];
  showGst?: boolean;
  gst: GstBreakdown | null;
}

/** Percent widths (GST on); sum = 100. Wide EXP / MRP / Amt to prevent overlap in print/PDF. */
const COLS_WITH_GST = [
  2, 11, 7, 4, 5, 4, 4, 6, 10, 10, 5, 10, 22,
] as const;

/** 12 columns when GST column hidden */
const COLS_NO_GST = [
  2, 15, 8, 6, 5, 4, 4, 8, 11, 5, 11, 21,
] as const;

const thCls =
  "min-w-0 overflow-hidden border border-slate-900 bg-slate-200 px-0.5 py-1 text-center text-[0.92em] font-bold uppercase leading-tight text-slate-900";

const tdCls =
  "min-w-0 overflow-hidden border border-slate-900 px-0.5 py-0.5 align-top text-inherit";

const tdNum =
  "min-w-0 overflow-hidden border border-slate-900 px-0.5 py-0.5 align-top text-inherit whitespace-nowrap text-right tabular-nums";

function hasLineValues(item: ItemType): boolean {
  const amt = item.amount ?? 0;
  return (
    amt > 0 ||
    Boolean(
      (item.description && item.description.trim()) ||
        item.hsn ||
        (item.qty !== null && item.qty !== 0)
    )
  );
}

function Colgroup({ widths }: { widths: readonly number[] }) {
  return (
    <colgroup>
      {widths.map((w, i) => (
        <col key={i} style={{ width: `${w}%` }} />
      ))}
    </colgroup>
  );
}

export default function BillPreviewTable({
  items,
  showGst = true,
  gst,
}: BillPreviewTableProps) {
  const colCount = showGst ? 13 : 12;
  const colWidths = showGst ? COLS_WITH_GST : COLS_NO_GST;

  return (
    <table className="invoice-items-table mt-0 w-full table-fixed border-collapse text-inherit">
      <Colgroup widths={colWidths} />
      <thead>
        <tr className="border-t-2 border-slate-900">
          <th className={thCls}>Sl.</th>
          <th className={thCls}>Description of goods</th>
          <th className={thCls}>HSN</th>
          {showGst && <th className={thCls}>GST %</th>}
          <th className={thCls}>MFG</th>
          <th className={thCls}>Qty</th>
          <th className={thCls}>Unit</th>
          <th className={thCls}>Batch</th>
          <th className={thCls}>Exp.</th>
          <th className={thCls}>MRP</th>
          <th className={thCls}>Disc %</th>
          <th className={thCls}>Rate</th>
          <th className={thCls}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className="break-inside-avoid">
            <td className={`${tdCls} text-center`}>{index + 1}</td>
            <td className={tdCls}>
              <div className="min-h-0 wrap-anywhere">
                {item.description}
              </div>
            </td>
            <td className={tdCls}>
              <div className="min-h-0 wrap-anywhere">
                {item.hsn}
              </div>
            </td>
            {showGst && (
              <td className={`${tdCls} text-center`}>
                {hasLineValues(item) ? "5%" : ""}
              </td>
            )}
            <td className={tdCls}>
              <div className="min-h-0 wrap-anywhere">
                {item.mfg}
              </div>
            </td>
            <td className={`${tdCls} text-center whitespace-nowrap`}>
              {item.qty ?? ""}
            </td>
            <td className={`${tdCls} text-center whitespace-nowrap`}>
              {item.unit}
            </td>
            <td className={`${tdCls} whitespace-nowrap`}>{item.batch}</td>
            <td className={`${tdCls} break-all text-center leading-none`}>
              {item.exp}
            </td>
            <td className={tdNum}>
              {item.mrp != null && item.mrp !== 0
                ? round2(Number(item.mrp)).toFixed(2)
                : ""}
            </td>
            <td className={`${tdNum} text-center`}>
              {item.disc != null && item.disc !== 0 ? item.disc : ""}
            </td>
            <td className={tdNum}>
              {item.rate != null && item.rate !== 0
                ? round2(Number(item.rate)).toFixed(2)
                : ""}
            </td>
            <td className={tdNum}>
              {item.amount != null && item.amount !== 0
                ? round2(Number(item.amount)).toFixed(2)
                : ""}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-slate-50 font-semibold">
          <td
            colSpan={colCount}
            className="border border-slate-900 px-1 py-1 text-right text-[0.92em]"
          >
            Items: {getActiveItemCount(items)}
            <span className="mx-1.5 text-slate-400">|</span>
            Total Qty: {calculateTotalItems(items)}
          </td>
        </tr>
        {showGst && gst ? (
          <>
            <tr>
              <td
                colSpan={colCount - 1}
                className="border border-slate-900 px-1 py-0.5 text-right font-semibold text-[0.92em]"
              >
                Taxable value
              </td>
              <td className="border border-slate-900 px-1 py-0.5 text-right font-semibold tabular-nums text-[0.92em]">
                {gst.taxableValue.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={colCount - 1}
                className="border border-slate-900 px-1 py-0.5 text-right text-[0.92em]"
              >
                CGST @ 2.50%
              </td>
              <td className="border border-slate-900 px-1 py-0.5 text-right tabular-nums text-[0.92em]">
                {gst.cgst.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={colCount - 1}
                className="border border-slate-900 px-1 py-0.5 text-right text-[0.92em]"
              >
                SGST / UTGST @ 2.50%
              </td>
              <td className="border border-slate-900 px-1 py-0.5 text-right tabular-nums text-[0.92em]">
                {gst.sgst.toFixed(2)}
              </td>
            </tr>
            {Math.abs(gst.roundOff) >= 0.001 && (
              <tr>
                <td
                  colSpan={colCount - 1}
                  className="border border-slate-900 px-1 py-0.5 text-right text-[0.92em]"
                >
                  Round off
                </td>
                <td className="border border-slate-900 px-1 py-0.5 text-right tabular-nums text-[0.92em]">
                  {gst.roundOff < 0
                    ? `(−) ${Math.abs(gst.roundOff).toFixed(2)}`
                    : gst.roundOff > 0
                      ? `+${gst.roundOff.toFixed(2)}`
                      : gst.roundOff.toFixed(2)}
                </td>
              </tr>
            )}
            <tr className="bg-slate-200 font-bold">
              <td
                colSpan={colCount - 1}
                className="border border-slate-900 px-1 py-1 text-right uppercase text-[0.95em]"
              >
                Grand total
              </td>
              <td className="border border-slate-900 px-1 py-1 text-right tabular-nums text-[0.95em]">
                ₹ {gst.grandTotal.toFixed(2)}
              </td>
            </tr>
          </>
        ) : (
          <tr>
            <td
              colSpan={colCount - 1}
              className="border border-slate-900 px-1 py-0.5 text-right font-semibold text-[0.92em]"
            >
              Total pay (Rs.)
            </td>
            <td className="border border-slate-900 px-1 py-0.5 text-right tabular-nums text-[0.92em]">
              {calculateTotal(items).toFixed(2)}
            </td>
          </tr>
        )}
      </tfoot>
    </table>
  );
}
