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
} from "firebase/firestore";
import { db } from "@/firebase.config";
import type {
  BillInfoType,
  ItemType,
  BillDocument,
  DraftDocument,
} from "@/types/bill";

export type { BillDocument, DraftDocument };

type BillOrDraftData = Omit<BillDocument, "id" | "createdAt" | "updatedAt">;

function toDocument(data: BillOrDraftData) {
  return {
    displayName: data.displayName,
    billInfo: data.billInfo,
    items: data.items,
    orientation: data.orientation,
    includeGst: data.includeGst,
    updatedAt: Timestamp.now(),
  };
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
    return {
      id,
      displayName: data.displayName,
      billInfo: data.billInfo as BillInfoType,
      items: data.items as ItemType[],
      orientation: data.orientation,
      includeGst: data.includeGst,
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
