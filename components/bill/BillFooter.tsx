import { numberToWords } from "@/utils/bill";

interface BillFooterProps {
  totalAmount: number;
}

export default function BillFooter({ totalAmount }: BillFooterProps) {
  return (
    <div className="text-xs mt-2">
      <p>
        <strong>{numberToWords(totalAmount)}</strong>
      </p>
      <div className="mt-2 space-y-0.5">
        <p>Please Consult with your Dr. Before Using The Medicines.</p>
        <p>
          Cold Chain Items Once Sold Can&apos;t Be Taken Back due to technical
          reasons.
        </p>
        <p>All Disputes are Subject to KOLKATA Jurisdiction Only.</p>
      </div>
      <div className="text-right mt-2">
        <p>For Medivax Pharma</p>
        <p>E.& O.E.</p>
      </div>
      <p className="mt-2">
        KOTAK MAHINDRA BANK, A/c No.-9314146480, IFS CODE: KKBK0000322, Park
        Street, Kolkata-700016
      </p>
    </div>
  );
}

