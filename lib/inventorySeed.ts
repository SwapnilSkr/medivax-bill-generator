import type { InventoryItemInput } from "@/types/inventory";

/** Current on-hand stock after all historical bills (baseline seed). */
export const INVENTORY_SEED: InventoryItemInput[] = [
  { name: "Influvac tetra", mrp: 2688, price: 910, quantity: 12, lowStockThreshold: 5 },
  { name: "Vaximune 23", mrp: 2400, price: 1195, quantity: 4, lowStockThreshold: 3 },
  { name: "Prevenar 20", mrp: 5555, price: 4145, quantity: 10, lowStockThreshold: 5 },
  { name: "Gardasil 9", mrp: 10850, price: 8200, quantity: 1, lowStockThreshold: 2 },
  { name: "Cervavac mono", mrp: 2000, price: 1140, quantity: 3, lowStockThreshold: 3 },
  { name: "Vaxiflu trivalent", mrp: 1990, price: 560, quantity: 51, lowStockThreshold: 10 },
];
