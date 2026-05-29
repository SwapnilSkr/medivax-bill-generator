/** Vaccine stock record — separate from bill line items (ItemType). */
export interface InventoryItem {
  id: string;
  name: string;
  mrp: number;
  /** Agreed selling price per unit (maps to bill line `rate`). */
  price: number;
  quantity: number;
  /** Optional metadata for bill auto-fill; not shown on printed invoice. */
  hsn?: string;
  mfg?: string;
  lowStockThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InventoryItemInput = Omit<
  InventoryItem,
  "id" | "createdAt" | "updatedAt"
>;

/** Tracks how much stock was deducted when a bill was posted. */
export interface InventoryAdjustment {
  inventoryId: string;
  qty: number;
}
