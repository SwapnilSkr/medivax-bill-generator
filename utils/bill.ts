import { ItemType } from "@/types/bill";

/** Round to 2 decimal places (currency). */
export const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;

const NUMERIC_UNIT = /^\d+(\.\d+)?$/;

/**
 * Line taxable amount before GST.
 *
 * - **Qty** × **effective unit** (if `unit` is purely numeric, e.g. pack size, it multiplies qty; otherwise unit is labels like "pcs").
 * - **Rate** if set (&gt; 0): net unit = rate × (1 − disc%/100).
 * - Else **MRP** if set (&gt; 0): net unit = mrp × (1 − disc%/100).
 * - **Disc** is treated as a **percentage** off the chosen base (rate or MRP), matching “Disc %” on the printed bill.
 */
export function computeLineAmount(item: ItemType): number | null {
  const qty =
    item.qty != null && !Number.isNaN(Number(item.qty)) ? Number(item.qty) : 0;
  if (qty <= 0) return null;

  const u = String(item.unit ?? "").trim();
  let effectiveQty = qty;
  if (NUMERIC_UNIT.test(u)) {
    const mult = parseFloat(u);
    if (mult > 0) effectiveQty = qty * mult;
  }

  const discRaw =
    item.disc != null && !Number.isNaN(Number(item.disc))
      ? Number(item.disc)
      : 0;
  const discPct = Math.min(Math.max(discRaw, 0), 100);
  const afterDisc = 1 - discPct / 100;

  const rate =
    item.rate != null && !Number.isNaN(Number(item.rate))
      ? Number(item.rate)
      : null;
  const mrp =
    item.mrp != null && !Number.isNaN(Number(item.mrp))
      ? Number(item.mrp)
      : null;

  let base: number | null = null;
  if (rate !== null && rate > 0) base = rate;
  else if (mrp !== null && mrp > 0) base = mrp;

  if (base === null) return null;

  const netUnit = round2(base * afterDisc);
  return round2(effectiveQty * netUnit);
}

/** Combined GST rate for pharma-style 5% (2.5% CGST + 2.5% SGST). */
export const GST_TOTAL_RATE = 0.05;
export const GST_HALF_RATE = 0.025;

export interface GstBreakdown {
  taxableValue: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
}

/**
 * CGST/SGST computed per line item (taxable amount × 2.5% each, rounded to paise),
 * then summed — matches common Indian invoice print logic.
 */
export function calculateGstBreakdown(items: ItemType[]): GstBreakdown {
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;

  for (const item of items) {
    const amt =
      item.amount !== null && item.amount !== undefined ? item.amount : 0;
    taxableValue += amt;
    cgst += round2(amt * GST_HALF_RATE);
    sgst += round2(amt * GST_HALF_RATE);
  }

  taxableValue = round2(taxableValue);
  cgst = round2(cgst);
  sgst = round2(sgst);
  const totalTax = round2(cgst + sgst);
  const rawGrand = round2(taxableValue + totalTax);
  const grandTotal = Math.round(rawGrand);
  const roundOff = round2(grandTotal - rawGrand);

  return {
    taxableValue,
    cgst,
    sgst,
    totalTax,
    roundOff,
    grandTotal,
  };
}

/** Invoice-style amount in words: "INR … Only" / "… and … paise Only". */
export function amountInWordsInr(num: number): string {
  const rounded = round2(num);
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);
  const words = (n: number) => {
    if (n === 0) return "Zero";
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const sayNumberInWordsInner = (x: number): string => {
      if (x < 20) return units[x];
      if (x < 100)
        return tens[Math.floor(x / 10)] + (x % 10 ? " " + units[x % 10] : "");
      if (x < 1000)
        return (
          units[Math.floor(x / 100)] +
          " Hundred" +
          (x % 100 ? " " + sayNumberInWordsInner(x % 100) : "")
        );
      if (x < 100000)
        return (
          sayNumberInWordsInner(Math.floor(x / 1000)) +
          " Thousand" +
          (x % 1000 ? " " + sayNumberInWordsInner(x % 1000) : "")
        );
      if (x < 10000000)
        return (
          sayNumberInWordsInner(Math.floor(x / 100000)) +
          " Lakh" +
          (x % 100000 ? " " + sayNumberInWordsInner(x % 100000) : "")
        );
      return (
        sayNumberInWordsInner(Math.floor(x / 10000000)) +
        " Crore" +
        (x % 10000000 ? " " + sayNumberInWordsInner(x % 10000000) : "")
      );
    };
    return sayNumberInWordsInner(n);
  };

  if (paise <= 0) {
    return `INR ${words(rupees)} Only`;
  }
  return `INR ${words(rupees)} and ${words(paise)} paise Only`;
}

export const numberToWords = (num: number): string => {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const sayNumberInWords = (num: number): string => {
    if (num < 20) return units[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "")
      );
    if (num < 1000)
      return (
        units[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + sayNumberInWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        sayNumberInWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + sayNumberInWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        sayNumberInWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + sayNumberInWords(num % 100000) : "")
      );
    return (
      sayNumberInWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + sayNumberInWords(num % 10000000) : "")
    );
  };

  const rounded = round2(num);
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let result = sayNumberInWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + sayNumberInWords(paise) + " Paise";
  }

  return result + " Only";
};

export const calculateTotal = (items: ItemType[]): number => {
  return items.reduce((total, item) => {
    return total + (item.amount !== null ? item.amount : 0);
  }, 0);
};

export const calculateTotalItems = (items: ItemType[]): number => {
  return items.reduce((total, item) => {
    return total + (item.qty !== null ? item.qty : 0);
  }, 0);
};

export const getActiveItemCount = (items: ItemType[]): number => {
  return items.filter((item) => item.qty !== null || item.description !== "")
    .length;
};

export const createEmptyItem = (id: number): ItemType => {
  return {
    id,
    description: "",
    hsn: "",
    mfg: "",
    qty: null as unknown as number,
    unit: "",
    batch: "",
    exp: "",
    mrp: null as unknown as number,
    disc: null as unknown as number,
    rate: null as unknown as number,
    amount: null as unknown as number,
  };
};

export const createInitialItems = (count: number = 10): ItemType[] => {
  return Array.from({ length: count }, (_, i) => createEmptyItem(i + 1));
};
