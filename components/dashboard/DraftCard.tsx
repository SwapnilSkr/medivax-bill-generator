"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DraftDocument } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";
import RenameModal from "./RenameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface DraftCardProps {
  draft: DraftDocument;
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  renameModalOpen: boolean;
  renameModalId: string | null;
  onRenameModalOpen: (id: string) => void;
  onRenameModalClose: () => void;
}

export default function DraftCard({
  draft,
  onRename,
  onDelete,
  renameModalOpen,
  renameModalId,
  onRenameModalOpen,
  onRenameModalClose,
}: DraftCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const total = calculateTotal(draft.items);
  const isRenameTarget = renameModalId === draft.id;

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{draft.displayName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {draft.billInfo.billNo ? `Bill #${draft.billInfo.billNo}` : "No bill number"} • {draft.billInfo.billDate || "—"}
            </p>
            <p className="text-sm font-medium mt-2">
              ₹{total.toFixed(2)}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Link href={`/generate?draftId=${draft.id}`}>
              <Button variant="ghost" size="icon" title="Resume">
                <Play className="size-4" />
              </Button>
            </Link>
            <Link href={`/generate?draftId=${draft.id}`}>
              <Button variant="ghost" size="icon" title="Edit">
                <Pencil className="size-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              title="Rename"
              onClick={() => onRenameModalOpen(draft.id)}
            >
              <Tag className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              onClick={() => setDeleteModalOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      {isRenameTarget && (
        <RenameModal
          open={renameModalOpen}
          title="Rename Draft"
          currentName={draft.displayName}
          onClose={onRenameModalClose}
          onSave={(name) => onRename(draft.id, name)}
        />
      )}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Draft"
        message={`Are you sure you want to delete "${draft.displayName}"? This cannot be undone.`}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => onDelete(draft.id)}
      />
    </>
  );
}
