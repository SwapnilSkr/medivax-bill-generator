/* eslint-disable @next/next/no-img-element */

import { BillInfoType } from "@/types/bill";

interface BillHeaderProps {
  billInfo: BillInfoType;
}

export default function BillHeader({ billInfo }: BillHeaderProps) {
  return (
    <div className="mb-2">
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src="/assets/MedivaxLogo.jpeg"
          alt="Medivax Pharma logo"
          width={80}
          height={80}
          className="my-1 h-16 w-auto object-contain"
          loading="eager"
          crossOrigin="anonymous"
        />
        <h1 className="text-[24px] font-bold text-center">Medivax Pharma</h1>
        <p className="text-center text-[13px]">
          14 DR. RAJKUMAR KUNDU LANE, SHIBTALA, HOWRAH - 711102
        </p>
      </div>
      <div className="flex justify-between mt-1 text-sm">
        <div className="text-left">
          {/* <p>
            <strong>GST NO:</strong> {billInfo.gstNo}
          </p> */}
          <p>
            <strong>MOBILE:</strong> 8777219601 / 7980076433
          </p>
          <p>
            <strong>Email:</strong> {billInfo.email}
          </p>
        </div>
        <div className="text-right">
          <p>
            <strong>Bill No.:</strong> {billInfo.billNo}
          </p>
          <p>
            <strong>Bill Date:</strong>{" "}
            {new Date(billInfo.billDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Bill Time:</strong> {billInfo.billTime}
          </p>
          <p>
            <strong>Order Date:</strong>{" "}
            {new Date(billInfo.billDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-left mt-1 text-sm">
        <p>
          <strong>{billInfo.nameType} Name:</strong> {billInfo.doctorName}
        </p>
        {billInfo.nameType === "Patient" && billInfo.refDoctor && (
          <p>
            <strong>Ref Doctor:</strong> {billInfo.refDoctor}
          </p>
        )}
        <p>
          <strong>Address:</strong> {billInfo.address}
        </p>
        <p>
          <strong>Mobile:</strong> {billInfo.mobile}
        </p>
        <p>
          <strong>MODE:</strong> {billInfo.mode}
        </p>
        <p>
          <strong>Delivered By:</strong> {billInfo.deliveredBy}
        </p>
        <p>
          <strong>Sales Person:</strong> {billInfo.salesPerson}
        </p>
      </div>
    </div>
  );
}
