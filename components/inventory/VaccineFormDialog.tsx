"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryItem, InventoryItemInput } from "@/types/inventory";

interface VaccineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InventoryItem | null;
  onSubmit: (data: InventoryItemInput) => Promise<void>;
}

const emptyForm: InventoryItemInput = {
  name: "",
  mrp: 0,
  price: 0,
  quantity: 0,
  hsn: "",
  mfg: "",
  lowStockThreshold: 5,
};

export function VaccineFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: VaccineFormDialogProps) {
  const [form, setForm] = useState<InventoryItemInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setForm({
        name: initial.name,
        mrp: initial.mrp,
        price: initial.price,
        quantity: initial.quantity,
        hsn: initial.hsn ?? "",
        mfg: initial.mfg ?? "",
        lowStockThreshold: initial.lowStockThreshold ?? 5,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vaccine name is required.");
      return;
    }
    if (form.mrp <= 0 || form.price <= 0) {
      setError("MRP and your price must be greater than zero.");
      return;
    }
    if (form.quantity < 0) {
      setError("Quantity cannot be negative.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save vaccine.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof InventoryItemInput,
    label: string,
    opts?: { type?: string; placeholder?: string; step?: string },
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        type={opts?.type ?? "text"}
        step={opts?.step}
        value={form[key] ?? ""}
        placeholder={opts?.placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          setForm((prev) => ({
            ...prev,
            [key]:
              opts?.type === "number"
                ? raw === ""
                  ? 0
                  : Number(raw)
                : raw,
          }));
        }}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit vaccine" : "Add vaccine"}</DialogTitle>
          <DialogDescription>
            {initial
              ? "Update stock, pricing, or details. Changes apply to future bills."
              : "Add a new vaccine to inventory. It will appear when creating invoices."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {field("name", "Vaccine name", { placeholder: "e.g. Influvac tetra" })}
          <div className="grid grid-cols-2 gap-3">
            {field("mrp", "MRP (₹)", { type: "number", step: "0.01" })}
            {field("price", "Your price (₹)", { type: "number", step: "0.01" })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("quantity", "Units in stock", { type: "number", step: "1" })}
            {field("lowStockThreshold", "Low-stock alert at", {
              type: "number",
              step: "1",
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("hsn", "HSN (optional)", { placeholder: "3002" })}
            {field("mfg", "Manufacturer (optional)")}
          </div>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add vaccine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
