"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { InventoryItem } from "@/types/inventory";
import { formatInr, getStockLevel } from "@/utils/inventory";
import { StockLevelBadge } from "./StockLevelBadge";
import { cn } from "@/lib/utils";

interface InventoryPickerProps {
  inventory: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
  disabled?: boolean;
  /** Primary toolbar button vs compact inline (legacy). */
  variant?: "toolbar" | "compact";
  targetRow?: number;
}

export function InventoryPicker({
  inventory,
  onSelect,
  disabled,
  variant = "compact",
  targetRow,
}: InventoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((item) => item.name.toLowerCase().includes(q));
  }, [inventory, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const isToolbar = variant === "toolbar";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={isToolbar ? "default" : "outline"}
          size={isToolbar ? "default" : "sm"}
          disabled={disabled || inventory.length === 0}
          className={cn(
            "gap-2",
            !isToolbar &&
              "h-8 shrink-0 border-dashed px-2.5 text-xs font-medium",
          )}
          title="Pick a vaccine from inventory"
        >
          <PackageSearch className={isToolbar ? "size-4" : "size-3.5"} />
          {isToolbar ? "Pick from inventory" : "Inventory"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(100vw-2rem,22rem)] p-0">
        <div className="border-b p-3">
          <p className="text-sm font-medium">Select vaccine</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {targetRow != null
              ? `Fills row ${targetRow + 1} with description, MRP, and your price.`
              : "Fills description, MRP, and your price on the active row."}
          </p>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vaccines…"
            className="mt-2 h-9"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No vaccines match your search.
            </p>
          ) : (
            filtered.map((item) => {
              const level = getStockLevel(item);
              const outOfStock = item.quantity <= 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="flex w-full cursor-pointer flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug">
                      {item.name}
                    </span>
                    <StockLevelBadge
                      level={level}
                      quantity={item.quantity}
                      className="shrink-0"
                    />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>MRP {formatInr(item.mrp)}</span>
                    <span>Your price {formatInr(item.price)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
