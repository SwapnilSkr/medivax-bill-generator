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
