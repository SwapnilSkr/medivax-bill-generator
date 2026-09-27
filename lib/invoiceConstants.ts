/** Shared seller / invoice chrome — keep in sync with bill preview UI. */
export const SELLER_GSTIN = "19HGRPS5830J1ZF";
export const SELLER_DL_NO = "WB/HWH/BIO/W/792998";
export const SELLER_ADDRESS =
  "14 DR. RAJKUMAR KUNDU LANE, SHIBTALA, HOWRAH - 711102";
export const SELLER_MOBILE = "8777219601 / 7980076433";
export const SELLER_STATE = "West Bengal";
export const STATE_CODE = "19";

export function formatBillDateForInvoice(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

/** Kotak account — used on non-GST bills. */
export const KOTAK_BANK_ONELINER =
  "Kotak Mahindra Bank, A/c no. 9314146480, IFSC KKBK0000322, Park Street, Kolkata — 700016";

/** UCO account — used on GST (tax invoice) bills. */
export const GST_INVOICE_BANK = {
  accountName: "MEDIVAX PHARMA",
  accountNumber: "09260510002629",
  ifsc: "UCBA0000926",
  branch: "SHIBPUR - KOLKATA",
  branchAddress: "SHIBPUR KOLKATA KOLKA WB 711102",
} as const;

/** Multi-line bank block for GST invoice footer / exports. */
export function gstInvoiceBankBlockLines(): string[] {
  const b = GST_INVOICE_BANK;
  return [
    "COMPANY'S BANK DETAILS",
    `Account Name: ${b.accountName}`,
    `Account Number: ${b.accountNumber}`,
    `IFSC Code: ${b.ifsc}`,
    `Branch: ${b.branch}`,
    `Branch Address: ${b.branchAddress}`,
    "",
    "For Medivax Pharma",
    "",
    "Authorised signatory",
  ];
}
