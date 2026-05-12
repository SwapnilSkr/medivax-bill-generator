import type { BillDocument, DraftDocument } from "@/types/bill";
import {
  draftMatchesDashboardFilter,
  invoiceMatchesDashboardFilter,
  type DashboardDateFilter,
} from "@/lib/dashboardMonthFilter";

export function billMatchesToolbarSearch(bill: BillDocument, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    bill.displayName.toLowerCase().includes(q) ||
    bill.billInfo.billNo.toLowerCase().includes(q) ||
    bill.billInfo.doctorName.toLowerCase().includes(q)
  );
}

export function draftMatchesToolbarSearch(draft: DraftDocument, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    draft.displayName.toLowerCase().includes(q) ||
    draft.billInfo.billNo.toLowerCase().includes(q) ||
    draft.billInfo.doctorName.toLowerCase().includes(q)
  );
}

export function filterBillsForToolbar(
  bills: BillDocument[],
  dateFilter: DashboardDateFilter,
  search: string,
): BillDocument[] {
  return bills.filter(
    (b) =>
      invoiceMatchesDashboardFilter(b.billInfo.billDate, dateFilter) &&
      billMatchesToolbarSearch(b, search),
  );
}

export function filterDraftsForToolbar(
  drafts: DraftDocument[],
  dateFilter: DashboardDateFilter,
  search: string,
): DraftDocument[] {
  return drafts.filter(
    (d) =>
      draftMatchesDashboardFilter(
        d.billInfo.billDate,
        new Date(d.updatedAt),
        dateFilter,
      ) && draftMatchesToolbarSearch(d, search),
  );
}
