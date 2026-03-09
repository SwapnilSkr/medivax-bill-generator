"use client";

import { useState, useEffect, useCallback } from "react";
import type { BillDocument } from "@/types/bill";
import {
  subscribeBills,
  getBill,
  createBill,
  updateBillDisplayName,
  deleteBill,
  saveBill,
} from "@/lib/firebase";
import type { BillInfoType, ItemType } from "@/types/bill";

export function useBills() {
  const [bills, setBills] = useState<BillDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeBills((data) => {
      setBills(data);
      setLoading(false);
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  const fetchBill = useCallback(async (id: string) => {
    return getBill(id);
  }, []);

  const create = useCallback(
    async (data: {
      displayName: string;
      billInfo: BillInfoType;
      items: ItemType[];
      orientation: "portrait" | "landscape";
      includeGst: boolean;
    }) => {
      setError(null);
      try {
        return await createBill(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create bill");
        throw e;
      }
    },
    []
  );

  const update = useCallback(
    async (
      id: string,
      data: {
        displayName: string;
        billInfo: BillInfoType;
        items: ItemType[];
        orientation: "portrait" | "landscape";
        includeGst: boolean;
      }
    ) => {
      setError(null);
      try {
        await saveBill(id, data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update bill");
        throw e;
      }
    },
    []
  );

  const rename = useCallback(async (id: string, displayName: string) => {
    setError(null);
    try {
      await updateBillDisplayName(id, displayName);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rename bill");
      throw e;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteBill(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete bill");
      throw e;
    }
  }, []);

  return {
    bills,
    loading,
    error,
    fetchBill,
    createBill: create,
    updateBill: update,
    renameBill: rename,
    deleteBill: remove,
  };
}
