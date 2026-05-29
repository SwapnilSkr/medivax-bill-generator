import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import type {
  BillInfoType,
  ItemType,
  BillDocument,
  DraftDocument,
} from "@/types/bill";
import type {
  InventoryAdjustment,
  InventoryItem,
  InventoryItemInput,
} from "@/types/inventory";
import { INVENTORY_COLLECTION } from "@/lib/inventoryConstants";
import {
  computeInventoryAdjustments,
  computeInventoryDeltas,
  validateInventoryDeltas,
} from "@/utils/inventory";

export type { BillDocument, DraftDocument };

type BillOrDraftData = Omit<
  BillDocument,
  "id" | "createdAt" | "updatedAt"
>;

function toDocument(data: BillOrDraftData) {
  const docData: Record<string, unknown> = {
    displayName: data.displayName,
    billInfo: data.billInfo,
    items: data.items,
    orientation: data.orientation,
    includeGst: data.includeGst,
    updatedAt: Timestamp.now(),
  };
  if (data.inventoryAdjustments !== undefined) {
    docData.inventoryAdjustments = data.inventoryAdjustments;
  }
  return docData;
}

/** Skip malformed docs from snapshots/lists so one bad record cannot break the UI. */
function parseBillOrDraft(
  id: string,
  data: Record<string, unknown>,
): BillDocument | null {
  try {
    if (typeof data.displayName !== "string") return null;
    if (!data.billInfo || typeof data.billInfo !== "object") return null;
    if (!Array.isArray(data.items)) return null;
    if (data.orientation !== "portrait" && data.orientation !== "landscape") {
      return null;
    }
    if (typeof data.includeGst !== "boolean") return null;
    const createdAt = data.createdAt as Timestamp | undefined;
    const updatedAt = data.updatedAt as Timestamp | undefined;
    const inventoryAdjustments = Array.isArray(data.inventoryAdjustments)
      ? (data.inventoryAdjustments as InventoryAdjustment[])
      : undefined;
    return {
      id,
      displayName: data.displayName,
      billInfo: data.billInfo as BillInfoType,
      items: data.items as ItemType[],
      orientation: data.orientation,
      includeGst: data.includeGst,
      inventoryAdjustments,
      createdAt: createdAt?.toDate?.() ?? new Date(),
      updatedAt: updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    return null;
  }
}

const BILLS_COLLECTION = "bills";
const DRAFTS_COLLECTION = "drafts";

const FIRESTORE_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () =>
        reject(
          new Error(
            `[Firebase] ${label} timed out after ${FIRESTORE_TIMEOUT_MS / 1000}s. Check network, firewall, or try a different network.`,
          ),
        ),
      FIRESTORE_TIMEOUT_MS,
    );
  });
  return Promise.race([
    promise.finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }),
    timeoutPromise,
  ]);
}

// Bills CRUD
export async function createBill(data: BillOrDraftData): Promise<string> {
  const docRef = await withTimeout(
    addDoc(collection(db, BILLS_COLLECTION), {
      ...toDocument(data),
      createdAt: Timestamp.now(),
    }),
    "Bills create",
  );
  return docRef.id;
}

export async function getBill(id: string): Promise<BillDocument | null> {
  const docRef = doc(db, BILLS_COLLECTION, id);
  const snap = await withTimeout(getDoc(docRef), "Bills get");
  if (!snap.exists()) return null;
  return parseBillOrDraft(snap.id, snap.data());
}

export async function updateBill(
  id: string,
  data: BillOrDraftData,
): Promise<void> {
  const docRef = doc(db, BILLS_COLLECTION, id);
  await withTimeout(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDoc(docRef, toDocument(data) as any),
    "Bills update",
  );
}

export async function updateBillDisplayName(
  id: string,
  displayName: string,
): Promise<void> {
  const docRef = doc(db, BILLS_COLLECTION, id);
  await withTimeout(
    updateDoc(docRef, { displayName, updatedAt: Timestamp.now() }),
    "Bills rename",
  );
}

export async function deleteBill(id: string): Promise<void> {
  const bill = await getBill(id);
  if (bill?.inventoryAdjustments?.length) {
    await restoreInventoryAdjustments(bill.inventoryAdjustments);
  }
  const docRef = doc(db, BILLS_COLLECTION, id);
  await withTimeout(deleteDoc(docRef), "Bills delete");
}

export async function listBills(): Promise<BillDocument[]> {
  const q = query(
    collection(db, BILLS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  const snapshot = await withTimeout(getDocs(q), "Bills list");
  return snapshot.docs
    .map((d) => parseBillOrDraft(d.id, d.data()))
    .filter((b): b is BillDocument => b !== null);
}

export function subscribeBills(
  callback: (bills: BillDocument[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, BILLS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const bills = snapshot.docs
        .map((d) => parseBillOrDraft(d.id, d.data()))
        .filter((b): b is BillDocument => b !== null);
      callback(bills);
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  );
}

// Drafts CRUD
export async function createDraft(data: BillOrDraftData): Promise<string> {
  const docRef = await withTimeout(
    addDoc(collection(db, DRAFTS_COLLECTION), {
      ...toDocument(data),
      createdAt: Timestamp.now(),
    }),
    "Drafts create",
  );
  return docRef.id;
}

export async function getDraft(id: string): Promise<DraftDocument | null> {
  const docRef = doc(db, DRAFTS_COLLECTION, id);
  const snap = await withTimeout(getDoc(docRef), "Drafts get");
  if (!snap.exists()) return null;
  return parseBillOrDraft(snap.id, snap.data());
}

export async function updateDraft(
  id: string,
  data: BillOrDraftData,
): Promise<void> {
  const docRef = doc(db, DRAFTS_COLLECTION, id);
  await withTimeout(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDoc(docRef, toDocument(data) as any),
    "Drafts update",
  );
}

export async function updateDraftDisplayName(
  id: string,
  displayName: string,
): Promise<void> {
  const docRef = doc(db, DRAFTS_COLLECTION, id);
  await withTimeout(
    updateDoc(docRef, { displayName, updatedAt: Timestamp.now() }),
    "Drafts rename",
  );
}

export async function deleteDraft(id: string): Promise<void> {
  const docRef = doc(db, DRAFTS_COLLECTION, id);
  await withTimeout(deleteDoc(docRef), "Drafts delete");
}

export async function listDrafts(): Promise<DraftDocument[]> {
  const q = query(
    collection(db, DRAFTS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  const snapshot = await withTimeout(getDocs(q), "Drafts list");
  return snapshot.docs
    .map((d) => parseBillOrDraft(d.id, d.data()))
    .filter((d): d is DraftDocument => d !== null);
}

export function subscribeDrafts(
  callback: (drafts: DraftDocument[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, DRAFTS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const drafts = snapshot.docs
        .map((d) => parseBillOrDraft(d.id, d.data()))
        .filter((d): d is DraftDocument => d !== null);
      callback(drafts);
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  );
}

// Save/update bill with full document (for create or update)
export async function saveBill(
  id: string | null,
  data: BillOrDraftData,
): Promise<string> {
  if (id) {
    const docRef = doc(db, BILLS_COLLECTION, id);
    await withTimeout(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDoc(docRef, toDocument(data) as any),
      "Bills save",
    );
    return id;
  }
  return createBill(data);
}

// Save/update draft with full document
export async function saveDraft(
  id: string | null,
  data: BillOrDraftData,
): Promise<string> {
  if (id) {
    const docRef = doc(db, DRAFTS_COLLECTION, id);
    await withTimeout(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDoc(docRef, toDocument(data) as any),
      "Drafts save",
    );
    return id;
  }
  return createDraft(data);
}

// ─── Inventory ───────────────────────────────────────────────────────────────

function parseInventoryItem(
  id: string,
  data: Record<string, unknown>,
): InventoryItem | null {
  try {
    if (typeof data.name !== "string" || !data.name.trim()) return null;
    if (typeof data.mrp !== "number" || typeof data.price !== "number") {
      return null;
    }
    if (typeof data.quantity !== "number") return null;
    const createdAt = data.createdAt as Timestamp | undefined;
    const updatedAt = data.updatedAt as Timestamp | undefined;
    return {
      id,
      name: data.name,
      mrp: data.mrp,
      price: data.price,
      quantity: data.quantity,
      hsn: typeof data.hsn === "string" ? data.hsn : undefined,
      mfg: typeof data.mfg === "string" ? data.mfg : undefined,
      lowStockThreshold:
        typeof data.lowStockThreshold === "number"
          ? data.lowStockThreshold
          : undefined,
      createdAt: createdAt?.toDate?.() ?? new Date(),
      updatedAt: updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    return null;
  }
}

export function subscribeInventory(
  callback: (items: InventoryItem[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    orderBy("name", "asc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((d) => parseInventoryItem(d.id, d.data()))
        .filter((i): i is InventoryItem => i !== null);
      callback(items);
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    },
  );
}

export async function createInventoryItem(
  data: InventoryItemInput,
): Promise<string> {
  const docRef = await withTimeout(
    addDoc(collection(db, INVENTORY_COLLECTION), {
      name: data.name.trim(),
      mrp: data.mrp,
      price: data.price,
      quantity: data.quantity,
      hsn: data.hsn ?? "",
      mfg: data.mfg ?? "",
      lowStockThreshold: data.lowStockThreshold ?? 5,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }),
    "Inventory create",
  );
  return docRef.id;
}

export async function updateInventoryItem(
  id: string,
  data: InventoryItemInput,
): Promise<void> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await withTimeout(
    updateDoc(docRef, {
      name: data.name.trim(),
      mrp: data.mrp,
      price: data.price,
      quantity: data.quantity,
      hsn: data.hsn ?? "",
      mfg: data.mfg ?? "",
      lowStockThreshold: data.lowStockThreshold ?? 5,
      updatedAt: Timestamp.now(),
    }),
    "Inventory update",
  );
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await withTimeout(deleteDoc(docRef), "Inventory delete");
}

export async function adjustInventoryQuantity(
  id: string,
  delta: number,
): Promise<void> {
  const docRef = doc(db, INVENTORY_COLLECTION, id);
  await withTimeout(
    runTransaction(db, async (transaction) => {
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Vaccine not found in inventory.");
      const current = snap.data().quantity as number;
      const next = current + delta;
      if (next < 0) {
        throw new Error("Stock cannot go below zero.");
      }
      transaction.update(docRef, {
        quantity: next,
        updatedAt: Timestamp.now(),
      });
    }),
    "Inventory adjust",
  );
}

async function restoreInventoryAdjustments(
  adjustments: InventoryAdjustment[],
): Promise<void> {
  if (!adjustments.length) return;
  await withTimeout(
    runTransaction(db, async (transaction) => {
      for (const { inventoryId, qty } of adjustments) {
        if (qty <= 0) continue;
        const ref = doc(db, INVENTORY_COLLECTION, inventoryId);
        const snap = await transaction.get(ref);
        if (!snap.exists()) continue;
        const current = snap.data().quantity as number;
        transaction.update(ref, {
          quantity: current + qty,
          updatedAt: Timestamp.now(),
        });
      }
    }),
    "Inventory restore",
  );
}

export class InventoryStockError extends Error {
  issues: { name: string; requested: number; available: number }[];

  constructor(
    message: string,
    issues: { name: string; requested: number; available: number }[],
  ) {
    super(message);
    this.name = "InventoryStockError";
    this.issues = issues;
  }
}

/**
 * Reconcile inventory when a bill is posted or updated.
 * Returns the adjustments to store on the bill document.
 */
export async function syncInventoryForBill(
  items: ItemType[],
  previousAdjustments: InventoryAdjustment[] | undefined,
): Promise<InventoryAdjustment[]> {
  const nextAdjustments = computeInventoryAdjustments(items);
  const deltas = computeInventoryDeltas(
    previousAdjustments ?? [],
    nextAdjustments,
  );

  if (deltas.size === 0) return nextAdjustments;

  await withTimeout(
    runTransaction(db, async (transaction) => {
      const inventoryById = new Map<string, InventoryItem>();

      for (const inventoryId of deltas.keys()) {
        const ref = doc(db, INVENTORY_COLLECTION, inventoryId);
        const snap = await transaction.get(ref);
        if (!snap.exists()) {
          throw new Error(`Vaccine no longer in inventory (${inventoryId}).`);
        }
        const parsed = parseInventoryItem(snap.id, snap.data());
        if (!parsed) throw new Error("Invalid inventory record.");
        inventoryById.set(inventoryId, parsed);
      }

      const issues = validateInventoryDeltas(inventoryById, deltas);
      if (issues.length > 0) {
        throw new InventoryStockError(
          "Not enough stock for one or more vaccines.",
          issues.map((i) => ({
            name: i.name,
            requested: i.requested,
            available: i.available,
          })),
        );
      }

      for (const [inventoryId, delta] of deltas) {
        if (delta === 0) continue;
        const ref = doc(db, INVENTORY_COLLECTION, inventoryId);
        const current = inventoryById.get(inventoryId)!.quantity;
        transaction.update(ref, {
          quantity: current - delta,
          updatedAt: Timestamp.now(),
        });
      }
    }),
    "Inventory sync for bill",
  );

  return nextAdjustments;
}
