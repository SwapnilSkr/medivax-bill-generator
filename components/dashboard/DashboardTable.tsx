"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Tag,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillDocument, DraftDocument } from "@/types/bill";
import { calculateTotal } from "@/utils/bill";
import {
  dashboardDateFilterIsActive,
  defaultDashboardDateFilter,
  draftMatchesDashboardFilter,
  invoiceMatchesDashboardFilter,
} from "@/lib/dashboardMonthFilter";
import { DashboardDateFilterBar } from "./DashboardMonthPicker";
import RenameModal from "./RenameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

function SortGlyph({ active }: { active: boolean }) {
  return (
    <ArrowUpDown
      className={`size-3 ml-1 inline ${active ? "opacity-100" : "opacity-40"}`}
    />
  );
}

interface BillsTableProps {
  bills: BillDocument[];
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface DraftsTableProps {
  drafts: DraftDocument[];
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function BillsTable({ bills, onRename, onDelete }: BillsTableProps) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(defaultDashboardDateFilter);
  const [sortField, setSortField] = useState<"displayName" | "billDate" | "total">("billDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const filteredBills = bills
    .filter((bill) => {
      if (!invoiceMatchesDashboardFilter(bill.billInfo.billDate, dateFilter)) {
        return false;
      }
      const searchLower = search.toLowerCase();
      return (
        bill.displayName.toLowerCase().includes(searchLower) ||
        bill.billInfo.billNo.toLowerCase().includes(searchLower) ||
        bill.billInfo.doctorName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "displayName") {
        comparison = a.displayName.localeCompare(b.displayName);
      } else if (sortField === "billDate") {
        comparison = (a.billInfo.billDate || "").localeCompare(b.billInfo.billDate || "");
      } else if (sortField === "total") {
        comparison = calculateTotal(a.items) - calculateTotal(b.items);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: "displayName" | "billDate" | "total") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const currentBill = bills.find((b) => b.id === renameModalId);
  const hasActiveFilters = dashboardDateFilterIsActive(dateFilter) || Boolean(search.trim());
  const emptyMessage =
    bills.length > 0 && filteredBills.length === 0 && hasActiveFilters
      ? "No invoices match your filters."
      : "No bills found";

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1 sm:items-end sm:gap-3 min-w-0">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <DashboardDateFilterBar
            prefixId="invoices"
            primaryLabel="Bill month"
            hint="Quick month (last 24 months) or a custom range on the calendar. Matches each invoice’s bill date."
            value={dateFilter}
            onChange={setDateFilter}
          />
        </div>
        <p className="text-sm text-muted-foreground sm:shrink-0 sm:pb-0.5">
          {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th
                className="px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("displayName")}
              >
                <span className="flex items-center">
                  Name <SortGlyph active={sortField === "displayName"} />
                </span>
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("billDate")}
              >
                <span className="flex items-center">
                  Bill Date <SortGlyph active={sortField === "billDate"} />
                </span>
              </th>
              <th className="px-4 py-3">Customer</th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort("total")}
              >
                <span className="flex items-center justify-end">
                  Amount <SortGlyph active={sortField === "total"} />
                </span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{bill.displayName}</div>
                    <div className="text-xs text-muted-foreground">Bill #{bill.billInfo.billNo}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {bill.billInfo.billDate || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {bill.billInfo.doctorName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ₹{calculateTotal(bill.items).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard?viewBill=${bill.id}`}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                      <Link href={`/generate?billId=${bill.id}`}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setRenameModalId(bill.id);
                          setRenameModalOpen(true);
                        }}
                      >
                        <Tag className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeleteModalId(bill.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {currentBill && (
        <RenameModal
          open={renameModalOpen}
          title="Rename Bill"
          currentName={currentBill.displayName}
          onClose={() => {
            setRenameModalOpen(false);
            setRenameModalId(null);
          }}
          onSave={(name) => onRename(currentBill.id, name)}
        />
      )}

      {deleteModalId && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          title="Delete Bill"
          message={`Are you sure you want to delete this bill? This action cannot be undone.`}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteModalId(null);
          }}
          onConfirm={() => onDelete(deleteModalId)}
        />
      )}
    </div>
  );
}

export function DraftsTable({ drafts, onRename, onDelete }: DraftsTableProps) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(defaultDashboardDateFilter);
  const [sortField, setSortField] = useState<"displayName" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const filteredDrafts = drafts
    .filter((draft) => {
      if (
        !draftMatchesDashboardFilter(
          draft.billInfo.billDate,
          new Date(draft.updatedAt),
          dateFilter,
        )
      ) {
        return false;
      }
      const searchLower = search.toLowerCase();
      return (
        draft.displayName.toLowerCase().includes(searchLower) ||
        draft.billInfo.billNo.toLowerCase().includes(searchLower) ||
        draft.billInfo.doctorName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "displayName") {
        comparison = a.displayName.localeCompare(b.displayName);
      } else if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: "displayName" | "updatedAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const currentDraft = drafts.find((d) => d.id === renameModalId);
  const hasActiveFilters = dashboardDateFilterIsActive(dateFilter) || Boolean(search.trim());
  const emptyMessage =
    drafts.length > 0 && filteredDrafts.length === 0 && hasActiveFilters
      ? "No drafts match your filters."
      : "No drafts found";

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-1 sm:items-end sm:gap-3 min-w-0">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drafts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <p className="sr-only" id="drafts-month-hint">
            Bill date when set; otherwise last modified.
          </p>
          <DashboardDateFilterBar
            prefixId="drafts"
            primaryLabel="Month"
            hint="Quick month or custom range. Uses bill date when set; otherwise the last-saved date."
            value={dateFilter}
            onChange={setDateFilter}
            descriptionId="drafts-month-hint"
          />
        </div>
        <p className="text-sm text-muted-foreground sm:shrink-0 sm:pb-0.5">
          {filteredDrafts.length} draft{filteredDrafts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th
                className="px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("displayName")}
              >
                <span className="flex items-center">
                  Name <SortGlyph active={sortField === "displayName"} />
                </span>
              </th>
              <th className="px-4 py-3">Bill No</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("updatedAt")}
              >
                <span className="flex items-center">
                  Last Modified <SortGlyph active={sortField === "updatedAt"} />
                </span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDrafts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredDrafts.map((draft) => (
                <tr key={draft.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{draft.displayName}</div>
                    <div className="text-xs text-amber-600">Draft</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {draft.billInfo.billNo || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {draft.billInfo.doctorName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    ₹{calculateTotal(draft.items).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(draft.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/generate?draftId=${draft.id}`}>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setRenameModalId(draft.id);
                          setRenameModalOpen(true);
                        }}
                      >
                        <Tag className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeleteModalId(draft.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {currentDraft && (
        <RenameModal
          open={renameModalOpen}
          title="Rename Draft"
          currentName={currentDraft.displayName}
          onClose={() => {
            setRenameModalOpen(false);
            setRenameModalId(null);
          }}
          onSave={(name) => onRename(currentDraft.id, name)}
        />
      )}

      {deleteModalId && (
        <DeleteConfirmModal
          open={deleteModalOpen}
          title="Delete Draft"
          message={`Are you sure you want to delete this draft? This action cannot be undone.`}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteModalId(null);
          }}
          onConfirm={() => onDelete(deleteModalId)}
        />
      )}
    </div>
  );
}
