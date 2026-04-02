import { ItemType } from "@/types/bill";
import {
  amountInWordsInr,
  calculateTotal,
  GstBreakdown,
  numberToWords,
} from "@/utils/bill";

interface BillFooterProps {
  items: ItemType[];
  showGst?: boolean;
  gst: GstBreakdown | null;
}

const footCell =
  "min-w-0 border border-slate-900 px-0.5 py-0.5 align-middle";

const footTh = `${footCell} bg-slate-100 font-semibold text-center text-[0.92em]`;

const TAX_COLS = [20, 13, 17, 13, 17, 20] as const;

export default function BillFooter({ items, showGst = true, gst }: BillFooterProps) {
  if (showGst && gst) {
    return (
      <div className="mt-0 border-t-2 border-slate-900 bg-white text-slate-900">
        <div className="border-b border-slate-900 px-2 py-2">
          <p className="font-semibold leading-snug">
            Amount chargeable (in words):{" "}
            <span className="font-bold uppercase">{amountInWordsInr(gst.grandTotal)}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2">
            <p className="text-[1.65em] font-bold leading-none tabular-nums">
              ₹ {gst.grandTotal.toFixed(2)}
            </p>
            <p className="shrink-0 text-[0.95em] leading-tight text-slate-600">
              E. &amp; O. E.
            </p>
          </div>
        </div>

        <div className="px-1.5 py-1.5">
          <p className="mb-1 text-[0.95em] font-bold uppercase leading-tight text-slate-800">
            Tax summary (GST @ 5% — CGST 2.50% + SGST / UTGST 2.50%)
          </p>
          <table className="w-full table-fixed border-collapse border-2 border-slate-900">
            <colgroup>
              {TAX_COLS.map((w, i) => (
                <col key={i} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className={footTh}>Taxable value</th>
                <th className={footTh} colSpan={2}>
                  CGST
                </th>
                <th className={footTh} colSpan={2}>
                  SGST / UTGST
                </th>
                <th className={footTh}>Total tax</th>
              </tr>
              <tr>
                <th className={`${footTh} font-normal`} aria-hidden />
                <th className={footTh}>Rate</th>
                <th className={footTh}>Amount</th>
                <th className={footTh}>Rate</th>
                <th className={footTh}>Amount</th>
                <th className={footTh} aria-hidden />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.taxableValue.toFixed(2)}
                </td>
                <td className={`${footCell} text-center whitespace-nowrap`}>2.50%</td>
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.cgst.toFixed(2)}
                </td>
                <td className={`${footCell} text-center whitespace-nowrap`}>2.50%</td>
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.sgst.toFixed(2)}
                </td>
                <td className={`${footCell} text-right font-semibold tabular-nums whitespace-nowrap`}>
                  {gst.totalTax.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.taxableValue.toFixed(2)}
                </td>
                <td className={`${footCell} text-center`} aria-hidden />
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.cgst.toFixed(2)}
                </td>
                <td className={`${footCell} text-center`} aria-hidden />
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.sgst.toFixed(2)}
                </td>
                <td className={`${footCell} text-right tabular-nums whitespace-nowrap`}>
                  {gst.totalTax.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1 font-medium leading-snug">
            Tax amount (in words):{" "}
            <span className="font-bold">{amountInWordsInr(gst.totalTax)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 border-t border-slate-900 md:grid-cols-2 md:divide-x md:divide-slate-900 print:grid-cols-2 print:divide-x print:divide-slate-900">
          <div className="p-2 leading-snug">
            <p className="font-semibold">Declaration</p>
            <p className="mt-0.5 text-slate-800">
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
            <p className="mt-2 text-center text-[0.95em] font-semibold uppercase tracking-wide text-slate-800">
              Subject to Kolkata jurisdiction
            </p>
            <p className="mt-1 text-[0.92em] text-slate-600">
              Please consult your doctor before using medicines. Cold chain
              items once sold cannot be taken back for technical reasons.
            </p>
          </div>
          <div className="p-2">
            <p className="font-bold uppercase">Company&apos;s bank details</p>
            <p className="mt-1">
              <span className="font-semibold">A/c holder:</span> Medivax Pharma
            </p>
            <p>
              <span className="font-semibold">Bank:</span> Kotak Mahindra Bank
            </p>
            <p>
              <span className="font-semibold">A/c no.:</span> 9314146480
            </p>
            <p>
              <span className="font-semibold">Branch &amp; IFSC:</span> Park
              Street, Kolkata — KKBK0000322
            </p>
            <div className="mt-4 text-right">
              <p className="font-semibold">For Medivax Pharma</p>
              <div className="mt-6 border-t border-slate-400 pt-0.5 text-[0.95em] text-slate-700">
                Authorised signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const plainTotal = calculateTotal(items);
  return (
    <div className="mt-0 border-t-2 border-slate-900 p-2 text-slate-900">
      <p>
        <strong>{numberToWords(plainTotal)}</strong>
      </p>
      <div className="mt-1 space-y-0.5">
        <p>Please consult your doctor before using the medicines.</p>
        <p>
          Cold chain items once sold cannot be taken back due to technical
          reasons.
        </p>
        <p>All disputes are subject to Kolkata jurisdiction only.</p>
      </div>
      <div className="mt-1 text-right">
        <p>For Medivax Pharma</p>
        <p>E. &amp; O. E.</p>
      </div>
      <p className="mt-1">
        Kotak Mahindra Bank, A/c no. 9314146480, IFSC KKBK0000322, Park Street,
        Kolkata — 700016
      </p>
    </div>
  );
}
