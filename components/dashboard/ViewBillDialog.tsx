"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BillListView from "@/components/dashboard/BillListView";
import type { BillDocument } from "@/types/bill";

interface ViewBillDialogProps {
  open: boolean;
  bill: BillDocument | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewBillDialog({
  open,
  bill,
  loading,
  onOpenChange,
}: ViewBillDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 gap-0 border-b border-border/60 bg-card/95 px-5 py-4 text-left backdrop-blur-md">
          <DialogDescription className="sr-only">
            {loading
              ? "Loading invoice preview"
              : "Preview of saved invoice details"}
          </DialogDescription>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="min-w-0 truncate text-base">
              {bill?.displayName ?? "Invoice"}
            </DialogTitle>
            <Button
              ref={closeButtonRef}
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 rounded-lg"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading invoice…</p>
          ) : bill ? (
            <BillListView
              billInfo={bill.billInfo}
              items={bill.items}
              showGst={bill.includeGst}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              This invoice could not be found. It may have been deleted.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
