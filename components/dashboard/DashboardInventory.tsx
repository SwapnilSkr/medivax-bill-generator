"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Minus,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryItem } from "@/types/inventory";
import { formatInr, getStockLevel } from "@/utils/inventory";
import { StockLevelBadge } from "@/components/inventory/StockLevelBadge";
import { VaccineFormDialog } from "@/components/inventory/VaccineFormDialog";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { appToast } from "@/lib/app-toast";
import { cn } from "@/lib/utils";

interface DashboardInventoryProps {
  items: InventoryItem[];
  loading: boolean;
  onAdd: (data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  onUpdate: (
    id: string,
    data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdjustStock: (id: string, delta: number) => Promise<void>;
}

type SortKey = "name" | "quantity" | "mrp" | "price";

export default function DashboardInventory({
  items,
  loading,
  onAdd,
  onUpdate,
  onDelete,
  onAdjustStock,
}: DashboardInventoryProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    let totalUnits = 0;
    let lowCount = 0;
    let outCount = 0;
    for (const item of items) {
      totalUnits += item.quantity;
      const level = getStockLevel(item);
      if (level === "low") lowCount += 1;
      if (level === "out") outCount += 1;
    }
    return { totalUnits, lowCount, outCount, skuCount: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? items.filter((i) => i.name.toLowerCase().includes(q))
      : [...items];
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "quantity") cmp = a.quantity - b.quantity;
      else if (sortKey === "mrp") cmp = a.mrp - b.mrp;
      else cmp = a.price - b.price;
      return sortAsc ? cmp : -cmp;
    });
  }, [items, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    if (adjustingId) return;
    setAdjustingId(item.id);
    try {
      await onAdjustStock(item.id, delta);
      appToast("success", delta > 0 ? "Stock increased." : "Stock decreased.");
    } catch (err) {
      appToast(
        "error",
        err instanceof Error ? err.message : "Could not adjust stock.",
      );
    } finally {
      setAdjustingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await onDelete(deleteId);
      appToast("success", "Vaccine removed from inventory.");
    } catch (err) {
      appToast(
        "error",
        err instanceof Error ? err.message : "Could not delete vaccine.",
      );
    }
  };

  const SortBtn = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-foreground"
    >
      {label}
      <ArrowUpDown
        className={cn(
          "size-3",
          sortKey === field ? "opacity-100" : "opacity-40",
        )}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Vaccine SKUs",
            value: stats.skuCount,
            hint: "Products in catalog",
          },
          {
            label: "Total units",
            value: stats.totalUnits,
            hint: "Combined on-hand stock",
          },
          {
            label: "Low stock",
            value: stats.lowCount,
            hint: "At or below alert threshold",
            warn: stats.lowCount > 0,
          },
          {
            label: "Out of stock",
            value: stats.outCount,
            hint: "Cannot bill until restocked",
            warn: stats.outCount > 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p
              className={cn(
                "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
                card.warn && "text-amber-600 dark:text-amber-400",
              )}
            >
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b px-4 py-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-md space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Search inventory
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vaccine name…"
                className="h-9 pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link href="/generate">Use in new invoice</Link>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add vaccine
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Loading inventory…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Package className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "No vaccines in inventory yet. Add your first one to get started."
                : "No vaccines match your search."}
            </p>
            {items.length === 0 ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Add vaccine
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-4 py-3">
                    <SortBtn label="Vaccine" field="name" />
                  </th>
                  <th className="px-4 py-3">
                    <SortBtn label="Stock" field="quantity" />
                  </th>
                  <th className="px-4 py-3">
                    <SortBtn label="MRP" field="mrp" />
                  </th>
                  <th className="px-4 py-3">
                    <SortBtn label="Your price" field="price" />
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const level = getStockLevel(item);
                  const busy = adjustingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {item.name}
                        </div>
                        {(item.hsn || item.mfg) && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {[item.mfg, item.hsn && `HSN ${item.hsn}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StockLevelBadge
                            level={level}
                            quantity={item.quantity}
                          />
                          <div className="inline-flex rounded-lg border border-border/80">
                            <button
                              type="button"
                              disabled={busy || item.quantity <= 0}
                              onClick={() => handleQuickAdjust(item, -1)}
                              className="flex size-7 cursor-pointer items-center justify-center rounded-l-lg hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                              title="Remove 1 unit"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleQuickAdjust(item, 1)}
                              className="flex size-7 cursor-pointer items-center justify-center rounded-r-lg border-l hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                              title="Add 1 unit"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatInr(item.mrp)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatInr(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit"
                            onClick={() => {
                              setEditing(item);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VaccineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={async (data) => {
          if (editing) {
            await onUpdate(editing.id, data);
            appToast("success", "Vaccine updated.");
          } else {
            await onAdd(data);
            appToast("success", "Vaccine added to inventory.");
          }
        }}
      />

      <DeleteConfirmModal
        open={Boolean(deleteId)}
        title="Remove vaccine?"
        message="This removes the vaccine from inventory. Existing bills are not affected."
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
