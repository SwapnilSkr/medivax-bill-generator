"use client";

import { useState } from "react";
import { Pencil, Trash2, Tag } from "lucide-react";
import { DashboardRowActionsMenu } from "./DashboardRowActionsMenu";
import type { DraftDocument } from "@/types/bill";
import { getBillChargeAmount } from "@/utils/bill";
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
  const total = getBillChargeAmount(draft.items, draft.includeGst);
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
          <DashboardRowActionsMenu
            items={[
              {
                label: "Continue editing",
                icon: Pencil,
                href: `/generate?draftId=${draft.id}`,
              },
              {
                label: "Rename",
                icon: Tag,
                onSelect: () => onRenameModalOpen(draft.id),
              },
              {
                label: "Delete",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => setDeleteModalOpen(true),
              },
            ]}
          />
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
