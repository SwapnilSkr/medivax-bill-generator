"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Tag, Search, ArrowUpDown } from "lucide-react";
import { DashboardRowActionsMenu } from "./DashboardRowActionsMenu";
import type { BillDocument, DraftDocument } from "@/types/bill";
import { getBillChargeAmount } from "@/utils/bill";
import {
  dashboardDateFilterIsActive,
  type DashboardDateFilter,
} from "@/lib/dashboardMonthFilter";
import { filterBillsForToolbar, filterDraftsForToolbar } from "@/lib/dashboardTableFilters";
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
  search: string;
  onSearchChange: (value: string) => void;
  dateFilter: DashboardDateFilter;
  onDateFilterChange: (value: DashboardDateFilter) => void;
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onViewBill: (id: string) => void;
}

interface DraftsTableProps {
  drafts: DraftDocument[];
  search: string;
  onSearchChange: (value: string) => void;
  dateFilter: DashboardDateFilter;
  onDateFilterChange: (value: DashboardDateFilter) => void;
  onRename: (id: string, displayName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function BillsTable({
  bills,
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onRename,
  onDelete,
  onViewBill,
}: BillsTableProps) {
  const [sortField, setSortField] = useState<"displayName" | "billDate" | "total">("billDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const filteredBills = useMemo(() => {
    const base = filterBillsForToolbar(bills, dateFilter, search);
    return [...base].sort((a, b) => {
      let comparison = 0;
      if (sortField === "displayName") {
        comparison = a.displayName.localeCompare(b.displayName);
      } else if (sortField === "billDate") {
        comparison = (a.billInfo.billDate || "").localeCompare(b.billInfo.billDate || "");
      } else if (sortField === "total") {
        comparison =
          getBillChargeAmount(a.items, a.includeGst) -
          getBillChargeAmount(b.items, b.includeGst);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [bills, dateFilter, search, sortField, sortOrder]);

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
      <div className="border-b px-4 py-4">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[50%] lg:flex-none">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium leading-none text-muted-foreground">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-0 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoComplete="off"
                  className="h-9 w-full rounded-md border border-input bg-background py-2 pr-4 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
          <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[50%]">
            <DashboardDateFilterBar
              prefixId="invoices"
              primaryLabel="Bill month"
              value={dateFilter}
              onChange={onDateFilterChange}
            />
          </div>
        </div>
        <p className="mt-3 text-center text-[0.7rem] leading-snug text-muted-foreground">
          Quick month (last 24 months) or a custom range on the calendar. Matches each
          invoice&apos;s bill date.
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
                    ₹{getBillChargeAmount(bill.items, bill.includeGst).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
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
                          onSelect: () => {
                            setRenameModalId(bill.id);
                            setRenameModalOpen(true);
                          },
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          variant: "destructive",
                          separatorBefore: true,
                          onSelect: () => {
                            setDeleteModalId(bill.id);
                            setDeleteModalOpen(true);
                          },
                        },
                      ]}
                    />
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

export function DraftsTable({
  drafts,
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onRename,
  onDelete,
}: DraftsTableProps) {
  const [sortField, setSortField] = useState<"displayName" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const filteredDrafts = useMemo(() => {
    const base = filterDraftsForToolbar(drafts, dateFilter, search);
    return [...base].sort((a, b) => {
      let comparison = 0;
      if (sortField === "displayName") {
        comparison = a.displayName.localeCompare(b.displayName);
      } else if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [drafts, dateFilter, search, sortField, sortOrder]);

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
      <div className="border-b px-4 py-4">
        <p className="sr-only" id="drafts-month-hint">
          Bill date when set; otherwise last modified.
        </p>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[50%] lg:flex-none">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium leading-none text-muted-foreground">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-0 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoComplete="off"
                  aria-describedby="drafts-month-hint"
                  className="h-9 w-full rounded-md border border-input bg-background py-2 pr-4 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
          <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[50%]">
            <DashboardDateFilterBar
              prefixId="drafts"
              primaryLabel="Month"
              value={dateFilter}
              onChange={onDateFilterChange}
              descriptionId="drafts-month-hint"
            />
          </div>
        </div>
        <p className="mt-3 text-center text-[0.7rem] leading-snug text-muted-foreground">
          Quick month or custom range. Uses bill date when set; otherwise the last-saved
          date.
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
                    ₹{getBillChargeAmount(draft.items, draft.includeGst).toFixed(2)}
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
                          onSelect: () => {
                            setRenameModalId(draft.id);
                            setRenameModalOpen(true);
                          },
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          variant: "destructive",
                          separatorBefore: true,
                          onSelect: () => {
                            setDeleteModalId(draft.id);
                            setDeleteModalOpen(true);
                          },
                        },
                      ]}
                    />
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
