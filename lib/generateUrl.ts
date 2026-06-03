/** Build `/generate` URLs for edit, duplicate, and draft flows. */
export function generateEditBillUrl(billId: string): string {
  return `/generate?billId=${encodeURIComponent(billId)}`;
}

export function generateDuplicateBillUrl(billId: string): string {
  return `/generate?duplicateFrom=${encodeURIComponent(billId)}`;
}

export function generateEditDraftUrl(draftId: string): string {
  return `/generate?draftId=${encodeURIComponent(draftId)}`;
}
