import type { ReactNode } from "react";
import { ItemType } from "@/types/bill";
import {
  amountInWordsInr,
  calculateGstBreakdown,
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
  numberToWords,
} from "@/utils/bill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BillActionsProps {
  items: ItemType[];
  includeGst?: boolean;
  orientation: "portrait" | "landscape";
  onOrientationChange: (orientation: "portrait" | "landscape") => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void | Promise<void>;
  onExportCsv: () => void | Promise<void>;
  onSaveBill: () => void | Promise<void>;
  onSaveDraft: () => void;
  onReset?: () => void;
  isEditingDraft?: boolean;
}

function ActionGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-2.5 border-b border-border/80 pb-4 last:border-b-0 last:pb-0",
        className,
      )}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground/90">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export default function BillActions({
  items,
  includeGst = true,
  orientation,
  onOrientationChange,
  onPrint,
  onExportPDF,
  onExportExcel,
  onExportCsv,
  onSaveBill,
  onSaveDraft,
  onReset,
  isEditingDraft,
}: BillActionsProps) {
  const taxableTotal = calculateTotal(items);
  const gst = includeGst ? calculateGstBreakdown(items) : null;
  const totalItems = getActiveItemCount(items);
  const totalQuantity = calculateTotalItems(items);

  const selectClass =
    "h-8 min-w-[8.5rem] rounded-md border border-input bg-background px-2.5 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10",
      )}
    >
      {/* Totals — compact ledger-style summary */}
      <div
        className="min-w-0 shrink rounded-xl border border-border/80 bg-muted/25 p-4 lg:max-w-md lg:flex-1"
        aria-label="Bill totals"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total items</dt>
            <dd className="font-medium tabular-nums">{totalItems}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total quantity</dt>
            <dd className="font-medium tabular-nums">{totalQuantity}</dd>
          </div>
        </dl>
        {includeGst && gst ? (
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-muted-foreground">Taxable value</span>
              <span className="font-medium tabular-nums">
                ₹{gst.taxableValue.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>
                CGST 2.5% · SGST 2.5%
              </span>
              <span className="tabular-nums">
                ₹{gst.cgst.toFixed(2)} · ₹{gst.sgst.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-border/40 pt-3">
              <span className="font-medium text-foreground">Grand total</span>
              <span className="text-base font-semibold tabular-nums tracking-tight">
                ₹{gst.grandTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">In words:</span>{" "}
              {amountInWordsInr(gst.grandTotal)}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-muted-foreground">Total amount</span>
              <span className="text-base font-semibold tabular-nums">
                ₹{taxableTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">In words:</span>{" "}
              {numberToWords(taxableTotal)}
            </p>
          </div>
        )}
      </div>

      {/* Actions — grouped toolbar */}
      <div
        className="w-full min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm lg:max-w-2xl lg:flex-1"
        aria-label="Bill actions"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Actions
        </p>
        <div className="space-y-4">
          <ActionGroup
            title="Page output"
            description="PDF size, printing, and a PDF file of the bill."
          >
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground sm:min-w-42">
                <span className="whitespace-nowrap">PDF orientation</span>
                <select
                  value={orientation}
                  onChange={(e) =>
                    onOrientationChange(
                      e.target.value as "portrait" | "landscape",
                    )
                  }
                  className={selectClass}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={onPrint}>
                  Print
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onExportPDF}>
                  Export PDF
                </Button>
              </div>
            </div>
          </ActionGroup>

          <ActionGroup
            title="Save"
            description="Store this bill or keep working as a draft."
          >
            <Button type="button" variant="outline" size="sm" onClick={onSaveDraft}>
              {isEditingDraft ? "Update draft" : "Save as draft"}
            </Button>
            <Button type="button" size="sm" onClick={onSaveBill}>
              Save bill
            </Button>
            {onReset ? (
              <Button type="button" variant="ghost" size="sm" onClick={onReset}>
                New bill
              </Button>
            ) : null}
          </ActionGroup>

          <ActionGroup
            title="Spreadsheet"
            description="Download line items and totals for accounting."
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportExcel}
            >
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportCsv}
            >
              CSV
            </Button>
          </ActionGroup>
        </div>
      </div>
    </div>
  );
}
