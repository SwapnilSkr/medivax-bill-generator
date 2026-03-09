"use client";

import { useState, useEffect, useCallback } from "react";
import type { DraftDocument } from "@/types/bill";
import {
  subscribeDrafts,
  getDraft,
  createDraft,
  updateDraftDisplayName,
  deleteDraft,
  saveDraft,
} from "@/lib/firebase";
import type { BillInfoType, ItemType } from "@/types/bill";

export function useDrafts() {
  const [drafts, setDrafts] = useState<DraftDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeDrafts((data) => {
      setDrafts(data);
      setLoading(false);
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  const fetchDraft = useCallback(async (id: string) => {
    return getDraft(id);
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
        return await createDraft(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create draft");
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
        await saveDraft(id, data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update draft");
        throw e;
      }
    },
    []
  );

  const rename = useCallback(async (id: string, displayName: string) => {
    setError(null);
    try {
      await updateDraftDisplayName(id, displayName);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rename draft");
      throw e;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteDraft(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete draft");
      throw e;
    }
  }, []);

  return {
    drafts,
    loading,
    error,
    fetchDraft,
    createDraft: create,
    updateDraft: update,
    renameDraft: rename,
    deleteDraft: remove,
  };
}
