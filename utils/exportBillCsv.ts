import type { BillInfoType, ItemType } from "@/types/bill";
import {
  formatBillDateForInvoice,
  SELLER_ADDRESS,
  SELLER_DL_NO,
  SELLER_GSTIN,
  SELLER_MOBILE,
  SELLER_STATE,
  STATE_CODE,
} from "@/lib/invoiceConstants";
import {
  amountInWordsInr,
  calculateGstBreakdown,
  calculateTotal,
  calculateTotalItems,
  getActiveItemCount,
  numberToWords,
  round2,
} from "@/utils/bill";

/** Match `SHEET_WIDTH_COLS` in exportBillExcel — columns A–Q (index 0 = A, 16 = Q). */
const SHEET_WIDTH = 17;
/** Excel header merge spans 11 rows (rows 3–13); keep at least this many CSV rows. */
const EXCEL_HEADER_BLOCK_ROWS = 11;
/** Column I (index 8) — visual center for title rows when opened in Excel. */
const CENTER_COL = 8;
/** Column Q (index 16) — right edge for right-aligned summary text. */
const RIGHT_COL = SHEET_WIDTH - 1;

function safeFilePart(s: string): string {
  const t = s.trim() || "Draft";
  return t.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 72);
}

function hasLineValues(item: ItemType): boolean {
  const amt = item.amount ?? 0;
  return (
    amt > 0 ||
    Boolean(
      (item.description && item.description.trim()) ||
        item.hsn ||
        (item.qty !== null && item.qty !== 0),
    )
  );
}

function buildSellerBlock(showGst: boolean, billEmail: string): string {
  const lines = [
    "MEDIVAX PHARMA",
    SELLER_ADDRESS,
    ...(showGst
      ? [
          `GSTIN / UIN: ${SELLER_GSTIN}`,
          `State Name: ${SELLER_STATE}, Code: ${STATE_CODE}`,
        ]
      : []),
    `Mobile: ${SELLER_MOBILE}`,
    `DL No.: ${SELLER_DL_NO}`,
    `E-Mail: ${billEmail || "—"}`,
  ];
  return lines.join("\n");
}

function buildBillToBlock(billInfo: BillInfoType, showGst: boolean): string {
  const lines = [
    "Bill to (Consignee)",
    `${billInfo.nameType}: ${billInfo.doctorName || "—"}`,
  ];
  if (billInfo.nameType === "Patient" && billInfo.refDoctor) {
    lines.push(`Ref Doctor: ${billInfo.refDoctor}`);
  }
  lines.push(billInfo.address || "—", `Mobile: ${billInfo.mobile || "—"}`);
  if (showGst && billInfo.gstNo) {
    lines.push(`State Name: ${SELLER_STATE}, Code: ${STATE_CODE}`);
  }
  return lines.join("\n");
}

/** RFC 4180-style CSV cell escaping. */
function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowToLine(cells: string[]): string {
  return cells.map((c) => csvEscape(c ?? "")).join(",");
}

function emptyRow(): string[] {
  return Array.from({ length: SHEET_WIDTH }, () => "");
}

/** Ensure exactly `SHEET_WIDTH` columns (pad / trim). */
function row(cells: (string | number)[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < SHEET_WIDTH; i++) {
    const v = cells[i];
    out.push(
      v === undefined || v === null ? "" : typeof v === "number" ? String(v) : v,
    );
  }
  return out;
}

/** Long / full-width text starting in A (matches merged A:Q body text in Excel). */
function fullWidthRow(text: string): string[] {
  const r = emptyRow();
  r[0] = text;
  return r;
}

/** Centered title like merged A:Q header in Excel (text near column I). */
function centeredTitleRow(text: string): string[] {
  const r = emptyRow();
  r[CENTER_COL] = text;
  return r;
}

/** Right-aligned single cell (e.g. column Q). */
function rightEdgeRow(text: string): string[] {
  const r = emptyRow();
  r[RIGHT_COL] = text;
  return r;
}

/**
 * Footer amount row: label right before amount column (L for GST, K for non-GST), amount in last data col (M / L),
 * matching Excel merged label A…penult + amount in `dataColCount`.
 */
function amountFooterRow(
  label: string,
  amount: string | number,
  dataColCount: number,
): string[] {
  const r = emptyRow();
  const amountIdx = dataColCount - 1;
  const labelIdx = Math.max(0, amountIdx - 1);
  r[labelIdx] = label;
  r[amountIdx] = String(amount);
  return r;
}

function fmtCellNum(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v)) || Number(v) === 0) return "";
  return round2(Number(v)).toFixed(2);
}

export async function exportBillToCsv(params: {
  billInfo: BillInfoType;
  items: ItemType[];
  showGst: boolean;
}): Promise<void> {
  const { billInfo, items, showGst } = params;
  const colCount = showGst ? 13 : 12;
  const lines: string[] = [];
  const push = (cells: (string | number)[]) => lines.push(rowToLine(row(cells)));

  lines.push(rowToLine(centeredTitleRow("TAX INVOICE")));
  lines.push(rowToLine(centeredTitleRow("Computer generated — medivax pharma")));

  const sellerText = buildSellerBlock(showGst, billInfo.email);
  const billToText = buildBillToBlock(billInfo, showGst);
  const metaRows: [string, string][] = [
    ["Invoice No.", billInfo.billNo || "—"],
    ["Dated", formatBillDateForInvoice(billInfo.billDate)],
    ["Time", billInfo.billTime || "—"],
    ["Mode / Terms", billInfo.mode],
    ["Delivered By", billInfo.deliveredBy || "—"],
    ["Sales Person", billInfo.salesPerson || "—"],
    ["Order Date", formatBillDateForInvoice(billInfo.billDate)],
  ];

  const sellerLines = sellerText.split("\n");
  const billLines = billToText.split("\n");
  const headerRowCount = Math.max(
    EXCEL_HEADER_BLOCK_ROWS,
    sellerLines.length,
    billLines.length,
  );

  /*
   * One line per row: col A seller, col G bill-to (same as Excel A:F / G:L blocks, but readable in CSV).
   * Cols M + O = invoice meta for the first 7 rows — matches exportBillExcel M:N + O:Q.
   */
  for (let i = 0; i < headerRowCount; i++) {
    const line = emptyRow();
    line[0] = sellerLines[i] ?? "";
    line[6] = billLines[i] ?? "";
    if (i < metaRows.length) {
      const [label, val] = metaRows[i];
      line[12] = label;
      line[14] = val || "—";
    }
    lines.push(rowToLine(line));
  }

  /* Blank spacer row (Excel row height 6) */
  lines.push(rowToLine(emptyRow()));

  const headers = showGst
    ? [
        "Sl.",
        "Description of goods",
        "HSN",
        "GST %",
        "MFG",
        "Qty",
        "Unit",
        "Batch",
        "Exp.",
        "MRP",
        "Disc %",
        "Rate",
        "Amount",
      ]
    : [
        "Sl.",
        "Description of goods",
        "HSN",
        "MFG",
        "Qty",
        "Unit",
        "Batch",
        "Exp.",
        "MRP",
        "Disc %",
        "Rate",
        "Amount",
      ];
  push([...headers, ...Array(SHEET_WIDTH - headers.length).fill("")]);

  const gstBreakdown = showGst ? calculateGstBreakdown(items) : null;

  items.forEach((item, index) => {
    const cells: (string | number)[] = [];
    cells.push(String(index + 1));
    cells.push(item.description ?? "");
    cells.push(item.hsn ?? "");
    if (showGst) {
      cells.push(hasLineValues(item) ? "5%" : "");
    }
    cells.push(item.mfg ?? "");
    if (item.qty != null && !Number.isNaN(Number(item.qty))) {
      cells.push(Number(item.qty));
    } else {
      cells.push("");
    }
    cells.push(item.unit ?? "", item.batch ?? "", item.exp ?? "");
    cells.push(fmtCellNum(item.mrp != null ? Number(item.mrp) : null));
    if (item.disc != null && item.disc !== 0) {
      cells.push(Number(item.disc));
    } else {
      cells.push("");
    }
    cells.push(
      fmtCellNum(item.rate != null ? Number(item.rate) : null),
      fmtCellNum(item.amount != null ? Number(item.amount) : null),
    );
    while (cells.length < SHEET_WIDTH) cells.push("");
    push(cells);
  });

  lines.push(
    rowToLine(
      rightEdgeRow(
        `Items: ${getActiveItemCount(items)}  |  Total Qty: ${calculateTotalItems(items)}`,
      ),
    ),
  );

  if (showGst && gstBreakdown) {
    lines.push(rowToLine(amountFooterRow("Taxable value", gstBreakdown.taxableValue.toFixed(2), colCount)));
    lines.push(rowToLine(amountFooterRow("CGST @ 2.50%", gstBreakdown.cgst.toFixed(2), colCount)));
    lines.push(
      rowToLine(amountFooterRow("SGST / UTGST @ 2.50%", gstBreakdown.sgst.toFixed(2), colCount)),
    );
    if (Math.abs(gstBreakdown.roundOff) >= 0.001) {
      const ro = gstBreakdown.roundOff;
      const roStr =
        ro < 0
          ? `(−) ${Math.abs(ro).toFixed(2)}`
          : ro > 0
            ? `+${ro.toFixed(2)}`
            : ro.toFixed(2);
      lines.push(rowToLine(amountFooterRow("Round off", roStr, colCount)));
    }
    lines.push(
      rowToLine(amountFooterRow("GRAND TOTAL", `₹ ${gstBreakdown.grandTotal.toFixed(2)}`, colCount)),
    );
    lines.push(
      rowToLine(
        fullWidthRow(
          `Amount chargeable (in words): ${amountInWordsInr(gstBreakdown.grandTotal)}`,
        ),
      ),
    );
    lines.push(rowToLine(fullWidthRow(`₹ ${gstBreakdown.grandTotal.toFixed(2)}`)));
    lines.push(rowToLine(rightEdgeRow("E. & O. E.")));
    lines.push(
      rowToLine(
        centeredTitleRow("Tax summary (GST @ 5% — CGST 2.50% + SGST / UTGST 2.50%)"),
      ),
    );

    /* Tax table cols A–F + pad — matches Excel tax rows */
    const taxH1: (string | number)[] = [
      "Taxable value",
      "CGST",
      "",
      "SGST / UTGST",
      "",
      "Total tax",
      ...Array(SHEET_WIDTH - 6).fill(""),
    ];
    lines.push(rowToLine(row(taxH1)));
    const taxH2: (string | number)[] = [
      "",
      "Rate",
      "Amount",
      "Rate",
      "Amount",
      "",
      ...Array(SHEET_WIDTH - 6).fill(""),
    ];
    lines.push(rowToLine(row(taxH2)));
    const taxVals: (string | number)[] = [
      gstBreakdown.taxableValue.toFixed(2),
      "2.50%",
      gstBreakdown.cgst.toFixed(2),
      "2.50%",
      gstBreakdown.sgst.toFixed(2),
      gstBreakdown.totalTax.toFixed(2),
      ...Array(SHEET_WIDTH - 6).fill(""),
    ];
    lines.push(rowToLine(row(taxVals)));
    const taxVals2: (string | number)[] = [
      gstBreakdown.taxableValue.toFixed(2),
      "",
      gstBreakdown.cgst.toFixed(2),
      "",
      gstBreakdown.sgst.toFixed(2),
      gstBreakdown.totalTax.toFixed(2),
      ...Array(SHEET_WIDTH - 6).fill(""),
    ];
    lines.push(rowToLine(row(taxVals2)));

    lines.push(
      rowToLine(
        fullWidthRow(`Tax amount (in words): ${amountInWordsInr(gstBreakdown.totalTax)}`),
      ),
    );

    const declLines = [
      "Declaration",
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "Subject to Kolkata jurisdiction",
      "Please consult your doctor before using medicines. Cold chain items once sold cannot be taken back for technical reasons.",
    ];
    const bankLines = [
      "COMPANY'S BANK DETAILS",
      "A/c holder: Medivax Pharma",
      "Bank: Kotak Mahindra Bank",
      "A/c no.: 9314146480",
      "Branch & IFSC: Park Street, Kolkata — KKBK0000322",
      "",
      "For Medivax Pharma",
      "",
      "Authorised signatory",
    ];
    const declBankRows = Math.max(declLines.length, bankLines.length);
    for (let i = 0; i < declBankRows; i++) {
      const dr = emptyRow();
      dr[0] = declLines[i] ?? "";
      dr[6] = bankLines[i] ?? "";
      lines.push(rowToLine(dr));
    }
  } else {
    const plainTotal = calculateTotal(items);
    lines.push(rowToLine(amountFooterRow("Total pay (Rs.)", plainTotal.toFixed(2), colCount)));
    lines.push(rowToLine(fullWidthRow(numberToWords(plainTotal))));
    const plainFootLines = [
      "Please consult your doctor before using the medicines.",
      "Cold chain items once sold cannot be taken back due to technical reasons.",
      "All disputes are subject to Kolkata jurisdiction only.",
      "",
      "For Medivax Pharma",
      "E. & O. E.",
      "",
      "Kotak Mahindra Bank, A/c no. 9314146480, IFSC KKBK0000322, Park Street, Kolkata — 700016",
    ];
    for (const pl of plainFootLines) {
      lines.push(rowToLine(pl ? fullWidthRow(pl) : emptyRow()));
    }
  }

  const body = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const name = `Medivax_Tax_Invoice_${safeFilePart(billInfo.billNo || "Draft")}_${safeFilePart(billInfo.billDate || "nodate")}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
