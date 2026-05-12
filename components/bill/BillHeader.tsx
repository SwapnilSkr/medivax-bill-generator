/* eslint-disable @next/next/no-img-element */

import { BillInfoType } from "@/types/bill";
import {
  formatBillDateForInvoice,
  SELLER_ADDRESS,
  SELLER_DL_NO,
  SELLER_GSTIN,
  SELLER_MOBILE,
  SELLER_STATE,
  STATE_CODE,
} from "@/lib/invoiceConstants";

interface BillHeaderProps {
  billInfo: BillInfoType;
  showGst?: boolean;
}

const cell =
  "border-b border-slate-800 md:border-b-0 md:border-r md:last:border-r-0 print:border-b-0 print:border-r print:last:border-r-0 border-slate-800 p-1.5 leading-snug align-top text-slate-900";

export default function BillHeader({ billInfo, showGst = true }: BillHeaderProps) {
  const metaRow = (label: string, value: string) => (
    <tr className="border-b border-slate-800 last:border-b-0">
      <td className="w-[42%] border-r border-slate-800 bg-slate-50/80 px-1 py-1 font-semibold text-[0.95em] uppercase tracking-wide text-slate-700">
        {label}
      </td>
      <td className="min-w-0 wrap-break-word px-1 py-1 text-inherit">
        {value || "—"}
      </td>
    </tr>
  );

  return (
    <div className="mb-0 bg-white text-slate-900">
      <div className="flex flex-col items-stretch">
        <div className="border-b-2 border-slate-900 px-2 py-1.5 text-center">
          <h1 className="text-[1.35em] font-bold uppercase tracking-[0.12em] text-slate-900 leading-tight">
            Tax Invoice
          </h1>
          <p className="mt-0.5 text-[0.95em] text-slate-600">
            Computer generated — medivax pharma
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-900 md:grid-cols-3 md:divide-x md:divide-y-0 print:grid-cols-3 print:divide-x print:divide-y-0 print:divide-slate-900">
          <div className={cell}>
            <div className="mb-2 flex items-start gap-2">
              <img
                src="/assets/MedivaxLogo.jpeg"
                alt="Medivax Pharma logo"
                width={56}
                height={56}
                className="h-12 w-12 shrink-0 object-contain"
                loading="eager"
                crossOrigin="anonymous"
              />
              <div>
                <p className="text-[1.05em] font-bold uppercase leading-tight">
                  Medivax Pharma
                </p>
                <p className="mt-0.5 leading-snug text-slate-800">
                  {SELLER_ADDRESS}
                </p>
              </div>
            </div>
            {showGst && (
              <>
                <p className="mt-1">
                  <span className="font-semibold">GSTIN / UIN:</span> {SELLER_GSTIN}
                </p>
                <p>
                  <span className="font-semibold">State Name:</span> {SELLER_STATE},
                  Code: {STATE_CODE}
                </p>
              </>
            )}
            <p className="mt-1">
              <span className="font-semibold">Mobile:</span> {SELLER_MOBILE}
            </p>
            <p className="mt-1">
              <span className="font-semibold">DL No.:</span> {SELLER_DL_NO}
            </p>
            <p>
              <span className="font-semibold">E-Mail:</span>{" "}
              {billInfo.email || "—"}
            </p>
          </div>

          <div className={cell}>
            <p className="mb-1 text-[1.05em] font-bold uppercase text-slate-900">
              Bill to (Consignee)
            </p>
            <p className="font-semibold text-[1.05em] leading-tight">
              {billInfo.nameType}: {billInfo.doctorName || "—"}
            </p>
            {billInfo.nameType === "Patient" && billInfo.refDoctor && (
              <p className="mt-1">
                <span className="font-semibold">Ref Doctor:</span> {billInfo.refDoctor}
              </p>
            )}
            <p className="mt-1 wrap-break-word leading-snug text-inherit">
              {billInfo.address || "—"}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Mobile:</span> {billInfo.mobile || "—"}
            </p>
            {showGst && billInfo.gstNo && (
              <>
                <p>
                  <span className="font-semibold">State Name:</span> {SELLER_STATE},
                  Code: {STATE_CODE}
                </p>
              </>
            )}
          </div>

          <div className="border-b-0 p-0 md:border-r-0 print:border-r-0">
            <table className="h-full w-full border-collapse text-left">
              <tbody>
                {metaRow("Invoice No.", billInfo.billNo)}
                {metaRow("Dated", formatBillDateForInvoice(billInfo.billDate))}
                {metaRow("Time", billInfo.billTime || "—")}
                {metaRow("Mode / Terms", billInfo.mode)}
                {metaRow("Delivered By", billInfo.deliveredBy || "—")}
                {metaRow("Sales Person", billInfo.salesPerson || "—")}
                {metaRow("Order Date", formatBillDateForInvoice(billInfo.billDate))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
