"use client";

import { useEffect, useMemo, useState } from "react";
import { ItemType } from "@/types/bill";
import type { InventoryAdjustment, InventoryItem } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryPicker } from "@/components/inventory/InventoryPicker";
import {
  adjustmentsToMap,
  computeInventoryAdjustments,
  getStockLevel,
} from "@/utils/inventory";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

interface ItemsTableProps {
  items: ItemType[];
  includeGst?: boolean;
  inventory?: InventoryItem[];
  previousInventoryAdjustments?: InventoryAdjustment[];
  onItemChange: (
    index: number,
    field: keyof ItemType,
    value: string | number,
  ) => void;
  onApplyInventory: (index: number, item: InventoryItem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onAddVaccine?: () => void;
}

const cellInput =
  "h-8 w-full min-w-0 border-0 bg-transparent px-2 py-1 text-sm shadow-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 rounded-md";

function isRowActive(item: ItemType): boolean {
  return Boolean(item.description?.trim()) || (item.qty ?? 0) > 0;
}

function isRowEmpty(item: ItemType): boolean {
  return !isRowActive(item);
}

function findNextEmptyRow(items: ItemType[], after = -1): number {
  for (let i = after + 1; i < items.length; i++) {
    if (isRowEmpty(items[i])) return i;
  }
  for (let i = 0; i <= after; i++) {
    if (isRowEmpty(items[i])) return i;
  }
  return 0;
}

function StockHint({
  linked,
  overStock,
  totalDemand,
  effectiveAvailable,
}: {
  linked: InventoryItem;
  overStock: boolean;
  totalDemand: number;
  effectiveAvailable: number;
}) {
  const level = getStockLevel(linked);
  return (
    <p
      className={cn(
        "mt-0.5 truncate text-[11px] leading-tight",
        overStock ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "mr-1 inline-block size-1.5 rounded-full align-middle",
          level === "ok" && "bg-emerald-500",
          level === "low" && "bg-amber-500",
          level === "out" && "bg-red-500",
        )}
        aria-hidden
      />
      {overStock
        ? `Need ${totalDemand}, only ${effectiveAvailable} available`
        : `${effectiveAvailable} available in stock`}
    </p>
  );
}

export default function ItemsTable({
  items,
  includeGst = true,
  inventory = [],
  previousInventoryAdjustments = [],
  onItemChange,
  onApplyInventory,
  onAddItem,
  onRemoveItem,
  onAddVaccine,
}: ItemsTableProps) {
  const [activeRow, setActiveRow] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const inventoryById = useMemo(
    () => new Map(inventory.map((i) => [i.id, i])),
    [inventory],
  );
  const demandById = adjustmentsToMap(computeInventoryAdjustments(items));
  const previousById = adjustmentsToMap(previousInventoryAdjustments);

  const filledCount = items.filter(isRowActive).length;

  useEffect(() => {
    if (activeRow >= items.length) {
      setActiveRow(Math.max(0, items.length - 1));
    }
  }, [items.length, activeRow]);

  const handleInventorySelect = (inv: InventoryItem) => {
    onApplyInventory(activeRow, inv);
    const next = findNextEmptyRow(items, activeRow);
    setActiveRow(next);
  };

  const activeItem = items[activeRow];
  const activeLineLabel = activeItem?.description?.trim() || "Empty line";

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Line items</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Add vaccines to the bill below. Stock is deducted only when you save
          the bill—not when saving drafts.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              You&apos;re editing
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold text-foreground">
                Line {activeRow + 1}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {activeLineLabel}
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Click any row number in the table to switch lines. Use{" "}
              <strong className="font-medium text-foreground">
                Pick from inventory
              </strong>{" "}
              to auto-fill name, MRP, and your price—or type fields manually.
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-auto lg:min-w-[280px]">
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                Fill this line from stock
              </p>
              <InventoryPicker
                variant="toolbar"
                inventory={inventory}
                targetRow={activeRow}
                onSelect={handleInventorySelect}
              />
              <p className="text-[11px] leading-snug text-muted-foreground">
                Opens your vaccine catalog. Out-of-stock items can&apos;t be
                selected.
              </p>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Other actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddItem}
                  className="h-9"
                >
                  <Plus className="size-4" />
                  Add blank row
                </Button>
                {onAddVaccine ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={onAddVaccine}
                  >
                    New vaccine in catalog
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              showHelp && "rotate-180",
            )}
          />
          How amounts are calculated
        </button>
        {showHelp ? (
          <div className="border-t border-border/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Amount</strong> = taxable value
            before GST. Uses{" "}
            <span className="font-mono text-xs">Rate</span> if set (&gt; 0), else{" "}
            <span className="font-mono text-xs">MRP</span>, minus{" "}
            <span className="font-mono text-xs">Disc%</span>, × qty (× numeric{" "}
            <span className="font-mono text-xs">UNIT</span> when applicable).
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span>
            {filledCount} active line{filledCount === 1 ? "" : "s"} ·{" "}
            {inventory.length} vaccines in catalog
          </span>
          <span className="hidden sm:inline">
            Tip: click a row number to change which line you&apos;re editing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="w-11 px-2 py-2.5">#</th>
                <th className="min-w-[160px] px-2 py-2.5">Description</th>
                <th className="w-[72px] px-2 py-2.5">HSN</th>
                {includeGst && (
                  <th className="w-14 px-2 py-2.5 text-center">GST</th>
                )}
                <th className="w-[72px] px-2 py-2.5">MFG</th>
                <th className="w-16 px-2 py-2.5">Qty</th>
                <th className="w-14 px-2 py-2.5">Unit</th>
                <th className="w-[76px] px-2 py-2.5">Batch</th>
                <th className="w-[68px] px-2 py-2.5">Exp</th>
                <th className="w-[76px] px-2 py-2.5">MRP</th>
                <th className="w-14 px-2 py-2.5">Disc</th>
                <th className="w-[84px] px-2 py-2.5">Rate</th>
                <th className="w-[88px] px-2 py-2.5 text-right">Amount</th>
                <th className="w-10 px-1 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const linked = item.inventoryId
                  ? inventoryById.get(item.inventoryId)
                  : undefined;
                const rowQty = item.qty ?? 0;
                const totalDemandForSku = item.inventoryId
                  ? (demandById.get(item.inventoryId) ?? 0)
                  : 0;
                const restoredForBill = item.inventoryId
                  ? (previousById.get(item.inventoryId) ?? 0)
                  : 0;
                const effectiveAvailable = linked
                  ? linked.quantity + restoredForBill
                  : 0;
                const overStock =
                  linked &&
                  rowQty > 0 &&
                  totalDemandForSku > effectiveAvailable;
                const active = index === activeRow;
                const empty = isRowEmpty(item);

                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-border/40 transition-colors last:border-b-0",
                      active && "bg-primary/4 ring-1 ring-inset ring-primary/20",
                      overStock && "bg-red-500/4",
                      empty && !active && "opacity-55 hover:opacity-80",
                    )}
                  >
                    <td className="p-0 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveRow(index)}
                        className={cn(
                          "flex size-full min-h-10 w-full cursor-pointer items-center justify-center text-xs font-medium tabular-nums transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                        title={`Select row ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    </td>
                    <td className="px-1 py-1 align-top">
                      <Input
                        type="text"
                        value={item.description}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "description", e.target.value)
                        }
                        placeholder="Vaccine or product name"
                        className={cellInput}
                      />
                      {linked ? (
                        <StockHint
                          linked={linked}
                          overStock={Boolean(overStock)}
                          totalDemand={totalDemandForSku}
                          effectiveAvailable={effectiveAvailable}
                        />
                      ) : null}
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="text"
                        value={item.hsn}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "hsn", e.target.value)
                        }
                        className={cellInput}
                      />
                    </td>
                    {includeGst && (
                      <td className="px-2 py-2 text-center text-xs tabular-nums text-muted-foreground">
                        {isRowActive(item) ? "5%" : "—"}
                      </td>
                    )}
                    <td className="px-1 py-1">
                      <Input
                        type="text"
                        value={item.mfg}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "mfg", e.target.value)
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        value={item.qty ?? ""}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "qty", e.target.value)
                        }
                        className={cn(
                          cellInput,
                          "tabular-nums",
                          overStock && "text-red-600",
                        )}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="text"
                        value={item.unit}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "unit", e.target.value)
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="text"
                        value={item.batch}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "batch", e.target.value)
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="text"
                        value={item.exp}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "exp", e.target.value)
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        value={item.mrp ?? ""}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "mrp", e.target.value)
                        }
                        className={cn(cellInput, "tabular-nums")}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        value={item.disc ?? ""}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "disc", e.target.value)
                        }
                        className={cn(cellInput, "tabular-nums")}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        value={item.rate ?? ""}
                        onFocus={() => setActiveRow(index)}
                        onChange={(e) =>
                          onItemChange(index, "rate", e.target.value)
                        }
                        placeholder="—"
                        title="Leave blank to use MRP × (1 − Disc %). Any value > 0 overrides MRP."
                        className={cn(cellInput, "tabular-nums")}
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-medium tabular-nums text-foreground">
                      {item.amount != null && item.amount > 0
                        ? item.amount.toFixed(2)
                        : "—"}
                    </td>
                    <td className="px-1 py-1 text-center">
                      {items.length > 10 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveItem(index)}
                          title="Remove row"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
