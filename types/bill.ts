export interface BillInfoType {
  billNo: string;
  billDate: string;
  billTime: string;
  gstNo: string;
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
  /** Links row to inventory; not rendered on printed bill. */
  inventoryId?: string | null;
}

import type { InventoryAdjustment } from "@/types/inventory";

export interface BillDocument {
  id: string;
  displayName: string;
  billInfo: BillInfoType;
  items: ItemType[];
  orientation: "portrait" | "landscape";
  includeGst: boolean;
  /** Stock deducted when this bill was posted; used to reconcile edits/deletes. */
  inventoryAdjustments?: InventoryAdjustment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftDocument {
  id: string;
  displayName: string;
  billInfo: BillInfoType;
  items: ItemType[];
  orientation: "portrait" | "landscape";
  includeGst: boolean;
  createdAt: Date;
  updatedAt: Date;
}
