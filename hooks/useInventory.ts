"use client";

import { useState, useEffect, useCallback } from "react";
import type { InventoryItem, InventoryItemInput } from "@/types/inventory";
import {
  subscribeInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryQuantity,
} from "@/lib/firebase";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeInventory(
      (data) => {
        setItems(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const addItem = useCallback(async (data: InventoryItemInput) => {
    setError(null);
    try {
      return await createInventoryItem(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add vaccine";
      setError(msg);
      throw e;
    }
  }, []);

  const updateItem = useCallback(
    async (id: string, data: InventoryItemInput) => {
      setError(null);
      try {
        await updateInventoryItem(id, data);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to update vaccine";
        setError(msg);
        throw e;
      }
    },
    [],
  );

  const removeItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteInventoryItem(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete vaccine";
      setError(msg);
      throw e;
    }
  }, []);

  const adjustStock = useCallback(async (id: string, delta: number) => {
    setError(null);
    try {
      await adjustInventoryQuantity(id, delta);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to adjust stock";
      setError(msg);
      throw e;
    }
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    adjustStock,
  };
}
