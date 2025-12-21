import { ChangeEvent } from "react";
import { BillInfoType } from "@/types/bill";

interface BillFormProps {
  billInfo: BillInfoType;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function BillForm({ billInfo, onChange }: BillFormProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1">Bill No:</label>
        <input
          type="text"
          name="billNo"
          value={billInfo.billNo}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Bill Date:</label>
        <input
          type="date"
          name="billDate"
          value={billInfo.billDate}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Bill Time:</label>
        <input
          type="time"
          name="billTime"
          value={billInfo.billTime}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* <div>
        <label className="block mb-1">GST No:</label>
        <input
          type="text"
          name="gstNo"
          value={billInfo.gstNo}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div> */}
      <div>
        <label className="block mb-1">Name Type:</label>
        <select
          name="nameType"
          value={billInfo.nameType}
          onChange={onChange}
          className="w-full p-2 border rounded"
        >
          <option value="Doctor">Doctor Name</option>
          <option value="Patient">Patient Name</option>
        </select>
      </div>
      <div>
        <label className="block mb-1">{billInfo.nameType} Name:</label>
        <input
          type="text"
          name="doctorName"
          value={billInfo.doctorName}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      {billInfo.nameType === "Patient" && (
        <div>
          <label className="block mb-1">Ref Doctor:</label>
          <input
            type="text"
            name="refDoctor"
            value={billInfo.refDoctor}
            onChange={onChange}
            className="w-full p-2 border rounded"
          />
        </div>
      )}
      <div>
        <label className="block mb-1">Address:</label>
        <input
          type="text"
          name="address"
          value={billInfo.address}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Mobile:</label>
        <input
          type="text"
          name="mobile"
          value={billInfo.mobile}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Email:</label>
        <input
          type="email"
          name="email"
          value={billInfo.email}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Mode:</label>
        <select
          name="mode"
          value={billInfo.mode}
          onChange={onChange}
          className="w-full p-2 border rounded"
        >
          <option value="CREDIT">CREDIT</option>
          <option value="CASH/ONLINE">CASH/ONLINE</option>
        </select>
      </div>
      <div>
        <label className="block mb-1">Delivered By:</label>
        <input
          type="text"
          name="deliveredBy"
          value={billInfo.deliveredBy}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Sales Person:</label>
        <input
          type="text"
          name="salesPerson"
          value={billInfo.salesPerson}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}
