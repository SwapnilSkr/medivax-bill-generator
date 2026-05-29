import type { ItemType } from "@/types/bill";
import type { InventoryAdjustment, InventoryItem } from "@/types/inventory";
import { computeLineAmount } from "@/utils/bill";

export function isActiveLineItem(item: ItemType): boolean {
  const qty = item.qty ?? 0;
  return qty > 0 && Boolean(item.description?.trim());
}

/** Sum billed qty per inventory id across active rows. */
export function computeInventoryAdjustments(
  items: ItemType[],
): InventoryAdjustment[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    if (!item.inventoryId || !isActiveLineItem(item)) continue;
    const qty = item.qty ?? 0;
    totals.set(item.inventoryId, (totals.get(item.inventoryId) ?? 0) + qty);
  }
  return [...totals.entries()].map(([inventoryId, qty]) => ({
    inventoryId,
    qty,
  }));
}

/** Net change in stock per inventory id (positive = deduct more). */
export function computeInventoryDeltas(
  previous: InventoryAdjustment[],
  next: InventoryAdjustment[],
): Map<string, number> {
  const deltas = new Map<string, number>();
  for (const { inventoryId, qty } of previous) {
    deltas.set(inventoryId, (deltas.get(inventoryId) ?? 0) - qty);
  }
  for (const { inventoryId, qty } of next) {
    deltas.set(inventoryId, (deltas.get(inventoryId) ?? 0) + qty);
  }
  return deltas;
}

export function adjustmentsToMap(
  adjustments: InventoryAdjustment[],
): Map<string, number> {
  return new Map(adjustments.map((a) => [a.inventoryId, a.qty]));
}

export interface StockValidationIssue {
  inventoryId: string;
  name: string;
  requested: number;
  available: number;
}

/** Validate that applying deltas won't drive stock below zero. */
export function validateInventoryDeltas(
  inventoryById: Map<string, InventoryItem>,
  deltas: Map<string, number>,
): StockValidationIssue[] {
  const issues: StockValidationIssue[] = [];
  for (const [inventoryId, delta] of deltas) {
    if (delta <= 0) continue;
    const item = inventoryById.get(inventoryId);
    const available = item?.quantity ?? 0;
    if (delta > available) {
      issues.push({
        inventoryId,
        name: item?.name ?? "Unknown vaccine",
        requested: delta,
        available,
      });
    }
  }
  return issues;
}

/** Fill a bill line from an inventory record (does not change bill preview layout). */
export function inventoryToLineItem(
  item: InventoryItem,
  rowId: number,
  qty = 1,
): ItemType {
  const line: ItemType = {
    id: rowId,
    description: item.name,
    hsn: item.hsn ?? "",
    mfg: item.mfg ?? "",
    qty,
    unit: "",
    batch: "",
    exp: "",
    mrp: item.mrp,
    disc: 0,
    rate: item.price,
    amount: null,
    inventoryId: item.id,
  };
  line.amount = computeLineAmount(line);
  return line;
}

export type StockLevel = "out" | "low" | "ok";

export function getStockLevel(
  item: Pick<InventoryItem, "quantity" | "lowStockThreshold">,
): StockLevel {
  if (item.quantity <= 0) return "out";
  const threshold = item.lowStockThreshold ?? 5;
  if (item.quantity <= threshold) return "low";
  return "ok";
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
