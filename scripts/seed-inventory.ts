/**
 * Seed the Firestore `inventory` collection with baseline vaccine stock.
 *
 * Usage:
 *   npm run seed:inventory          # seed only when collection is empty
 *   npm run seed:inventory -- --force   # delete all inventory docs, then re-seed
 *
 * Requires `.env.local` with NEXT_PUBLIC_FIREBASE_* vars (same as the app).
 */

import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  deleteDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { INVENTORY_COLLECTION } from "../lib/inventoryConstants";
import { INVENTORY_SEED } from "../lib/inventorySeed";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local and retry.`);
  }
  return value;
}

function initDb() {
  const app = initializeApp({
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  });
  return getFirestore(app);
}

async function clearInventory(db: ReturnType<typeof getFirestore>) {
  const snapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
  if (snapshot.empty) return 0;
  const batch = writeBatch(db);
  for (const d of snapshot.docs) {
    batch.delete(d.ref);
  }
  await batch.commit();
  return snapshot.size;
}

async function seedInventory(db: ReturnType<typeof getFirestore>) {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  for (const item of INVENTORY_SEED) {
    const ref = doc(collection(db, INVENTORY_COLLECTION));
    batch.set(ref, {
      name: item.name,
      mrp: item.mrp,
      price: item.price,
      quantity: item.quantity,
      hsn: item.hsn ?? "",
      mfg: item.mfg ?? "",
      lowStockThreshold: item.lowStockThreshold ?? 5,
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
}

async function main() {
  const force = process.argv.includes("--force");
  const db = initDb();
  const colRef = collection(db, INVENTORY_COLLECTION);

  const existing = await getDocs(colRef);

  if (!existing.empty && !force) {
    console.log(
      `Skipped: Firestore collection "${INVENTORY_COLLECTION}" already has ${existing.size} document(s).`,
    );
    console.log("Run with --force to wipe and re-seed baseline stock.");
    process.exit(0);
  }

  if (force && !existing.empty) {
    const removed = await clearInventory(db);
    console.log(`Removed ${removed} existing document(s) from "${INVENTORY_COLLECTION}".`);
  }

  await seedInventory(db);
  console.log(
    `Seeded ${INVENTORY_SEED.length} vaccines into Firestore collection "${INVENTORY_COLLECTION}":`,
  );
  for (const item of INVENTORY_SEED) {
    console.log(`  · ${item.name} — ${item.quantity} units @ MRP ₹${item.mrp}, price ₹${item.price}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
