export interface BillInfoType {
  billNo: string;
  billDate: string;
  billTime: string;
  // gstNo: string;
  nameType: "Doctor" | "Patient";
  doctorName: string;
  refDoctor: string;
  address: string;
  mobile: string;
  email: string;
  mode: "CREDIT" | "CASH/ONLINE";
  deliveredBy: string;
  salesPerson: string;
}

export interface ItemType {
  id: number;
  description: string;
  hsn: string;
  mfg: string;
  qty: number | null;
  unit: string;
  batch: string;
  exp: string;
  mrp: number | null;
  disc: number | null;
  rate: number | null;
  amount: number | null;
}
