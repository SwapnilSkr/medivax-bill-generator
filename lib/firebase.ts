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

function fromFirestore(
  id: string,
  data: Record<string, unknown>,
): BillDocument & { createdAt: Date; updatedAt: Date } {
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;
  return {
    id,
    displayName: data.displayName as string,
    billInfo: data.billInfo as BillInfoType,
    items: data.items as ItemType[],
    orientation: data.orientation as "portrait" | "landscape",
    includeGst: data.includeGst as boolean,
    createdAt: createdAt?.toDate?.() ?? new Date(),
    updatedAt: updatedAt?.toDate?.() ?? new Date(),
  };
}

const BILLS_COLLECTION = "bills";
const DRAFTS_COLLECTION = "drafts";

const FIRESTORE_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[Firebase] ${label} timed out after ${FIRESTORE_TIMEOUT_MS / 1000}s. Check network, firewall, or try a different network.`,
            ),
          ),
        FIRESTORE_TIMEOUT_MS,
      ),
    ),
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
  return fromFirestore(snap.id, snap.data()) as BillDocument;
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
  return snapshot.docs.map((d) =>
    fromFirestore(d.id, d.data()),
  ) as BillDocument[];
}

export function subscribeBills(
  callback: (bills: BillDocument[]) => void,
): () => void {
  const q = query(
    collection(db, BILLS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const bills = snapshot.docs.map((d) =>
      fromFirestore(d.id, d.data()),
    ) as BillDocument[];
    callback(bills);
  });
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
  return fromFirestore(snap.id, snap.data()) as DraftDocument;
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
  return snapshot.docs.map((d) =>
    fromFirestore(d.id, d.data()),
  ) as DraftDocument[];
}

export function subscribeDrafts(
  callback: (drafts: DraftDocument[]) => void,
): () => void {
  const q = query(
    collection(db, DRAFTS_COLLECTION),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const drafts = snapshot.docs.map((d) =>
      fromFirestore(d.id, d.data()),
    ) as DraftDocument[];
    callback(drafts);
  });
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
