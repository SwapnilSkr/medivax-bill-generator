"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Tag } from "lucide-react";
import { DashboardRowActionsMenu } from "./DashboardRowActionsMenu";
import type { BillDocument } from "@/types/bill";
import { getBillChargeAmount } from "@/utils/bill";
import RenameModal from "./RenameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface BillCardProps {
  bill: BillDocument;
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onViewBill: (id: string) => void;
  renameModalOpen: boolean;
  renameModalId: string | null;
  onRenameModalOpen: (id: string) => void;
  onRenameModalClose: () => void;
}

export default function BillCard({
  bill,
  onRename,
  onDelete,
  onViewBill,
  renameModalOpen,
  renameModalId,
  onRenameModalOpen,
  onRenameModalClose,
}: BillCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const total = getBillChargeAmount(bill.items, bill.includeGst);
  const isRenameTarget = renameModalId === bill.id;

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{bill.displayName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bill #{bill.billInfo.billNo} • {bill.billInfo.billDate}
            </p>
            <p className="text-sm font-medium mt-2">
              ₹{total.toFixed(2)}
            </p>
          </div>
          <DashboardRowActionsMenu
            items={[
              {
                label: "View bill",
                icon: Eye,
                onSelect: () => onViewBill(bill.id),
              },
              {
                label: "Edit bill",
                icon: Pencil,
                href: `/generate?billId=${bill.id}`,
              },
              {
                label: "Rename",
                icon: Tag,
                onSelect: () => onRenameModalOpen(bill.id),
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
          title="Rename Bill"
          currentName={bill.displayName}
          onClose={onRenameModalClose}
          onSave={(name) => onRename(bill.id, name)}
        />
      )}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Bill"
        message={`Are you sure you want to delete "${bill.displayName}"? This cannot be undone.`}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => onDelete(bill.id)}
      />
    </>
  );
}
