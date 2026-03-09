import { ChangeEvent } from "react";
import { BillInfoType } from "@/types/bill";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface BillFormProps {
  billInfo: BillInfoType;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  includeGst?: boolean;
  onIncludeGstChange?: (value: boolean) => void;
}

const labelClass = "block mb-1.5 text-sm font-medium text-muted-foreground";

export default function BillForm({
  billInfo,
  onChange,
  includeGst = true,
  onIncludeGstChange,
}: BillFormProps) {
  return (
    <div className="mb-6 space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="col-span-full text-sm font-semibold text-foreground uppercase tracking-wide">
          Bill Details
        </h3>
        <div>
          <label className={labelClass}>Bill No</label>
          <Input
            type="text"
            name="billNo"
            value={billInfo.billNo}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Bill Date</label>
          <Input
            type="date"
            name="billDate"
            value={billInfo.billDate}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Bill Time</label>
          <Input
            type="time"
            name="billTime"
            value={billInfo.billTime}
            onChange={onChange}
          />
        </div>
        <div className="flex items-center gap-2 md:items-end">
          <input
            type="checkbox"
            id="includeGst"
            checked={includeGst}
            onChange={(e) => onIncludeGstChange?.(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="includeGst" className={labelClass + " mb-0"}>
            Include GST on bill
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="col-span-full text-sm font-semibold text-foreground uppercase tracking-wide">
          Customer Details
        </h3>
        <div>
          <label className={labelClass}>Name Type</label>
          <Select
            name="nameType"
            value={billInfo.nameType}
            onChange={onChange}
          >
            <option value="Doctor">Doctor Name</option>
            <option value="Patient">Patient Name</option>
          </Select>
        </div>
        <div>
          <label className={labelClass}>{billInfo.nameType} Name</label>
          <Input
            type="text"
            name="doctorName"
            value={billInfo.doctorName}
            onChange={onChange}
          />
        </div>
        {billInfo.nameType === "Patient" && (
          <div>
            <label className={labelClass}>Ref Doctor</label>
            <Input
              type="text"
              name="refDoctor"
              value={billInfo.refDoctor}
              onChange={onChange}
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className={labelClass}>Address</label>
          <Input
            type="text"
            name="address"
            value={billInfo.address}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Mobile</label>
          <Input
            type="text"
            name="mobile"
            value={billInfo.mobile}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <Input
            type="email"
            name="email"
            value={billInfo.email}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Mode</label>
          <Select name="mode" value={billInfo.mode} onChange={onChange}>
            <option value="CREDIT">CREDIT</option>
            <option value="CASH/ONLINE">CASH/ONLINE</option>
          </Select>
        </div>
        <div>
          <label className={labelClass}>Delivered By</label>
          <Input
            type="text"
            name="deliveredBy"
            value={billInfo.deliveredBy}
            onChange={onChange}
          />
        </div>
        <div>
          <label className={labelClass}>Sales Person</label>
          <Input
            type="text"
            name="salesPerson"
            value={billInfo.salesPerson}
            onChange={onChange}
          />
        </div>
      </section>
    </div>
  );
}
