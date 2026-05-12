import ExcelJS from "exceljs";
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

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF0F172A" } },
  left: { style: "thin", color: { argb: "FF0F172A" } },
  bottom: { style: "thin", color: { argb: "FF0F172A" } },
  right: { style: "thin", color: { argb: "FF0F172A" } },
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE2E8F0" },
};

const FOOT_SUM_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF8FAFC" },
};

const GRAND_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFCBD5E1" },
};

function applyBorder(cell: ExcelJS.Cell) {
  cell.border = BORDER as ExcelJS.Borders;
}

/** 1-based column index → Excel column letter (A, B, … Z, AA, …). */
function colL(n: number): string {
  let s = "";
  let c = n;
  while (c > 0) {
    const r = (c - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    c = Math.floor((c - 1) / 26);
  }
  return s || "A";
}

function colWidthFromPct(pct: number): number {
  return Math.max(3.5, round2((pct / 100) * 90 * 0.85));
}

/** Full invoice width in Excel: columns A–Q (avoids cramped meta labels). */
const SHEET_WIDTH_COLS = 17;

const COL_PCT_GST = [2, 11, 7, 4, 9, 4, 4, 9, 10, 10, 5, 10, 14] as const;
const COL_PCT_NO_GST = [2, 15, 8, 10, 5, 4, 4, 11, 11, 5, 11, 13] as const;

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

/** Single footer row: label in cols 1…(n−1), amount in col n. */
function addAmountFooterRow(
  ws: ExcelJS.Worksheet,
  row: number,
  dataColCount: number,
  label: string,
  amount: string | number,
  opts?: { labelBold?: boolean; fill?: ExcelJS.Fill },
) {
  const penult = colL(dataColCount - 1);
  const last = colL(dataColCount);
  ws.mergeCells(`A${row}:${penult}${row}`);
  const L = ws.getCell(`A${row}`);
  L.value = label;
  L.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
  L.font = { bold: opts?.labelBold ?? false, size: 10 };
  if (opts?.fill) L.fill = opts.fill;
  applyBorder(L);
  const A = ws.getCell(`${last}${row}`);
  A.value = amount;
  A.alignment = { horizontal: "right", vertical: "middle" };
  A.font = { size: 10, bold: Boolean(opts?.fill) };
  if (opts?.fill) A.fill = opts.fill;
  applyBorder(A);
  if (dataColCount < SHEET_WIDTH_COLS) {
    const padA = colL(dataColCount + 1);
    const padZ = colL(SHEET_WIDTH_COLS);
    ws.mergeCells(`${padA}${row}:${padZ}${row}`);
    const pad = ws.getCell(`${padA}${row}`);
    pad.value = "";
    applyBorder(pad);
  }
}

/** Empty merge from startCol (1-based) through column Q for a full-width row. */
function padRowToSheetWidth(ws: ExcelJS.Worksheet, row: number, startCol: number) {
  if (startCol > SHEET_WIDTH_COLS) return;
  const c0 = colL(startCol);
  const c1 = colL(SHEET_WIDTH_COLS);
  ws.mergeCells(`${c0}${row}:${c1}${row}`);
  const cell = ws.getCell(`${c0}${row}`);
  cell.value = "";
  applyBorder(cell);
}

export async function exportBillToExcel(params: {
  billInfo: BillInfoType;
  items: ItemType[];
  showGst: boolean;
}): Promise<void> {
  const { billInfo, items, showGst } = params;
  const colCount = showGst ? 13 : 12;
  const sheetEndCol = colL(SHEET_WIDTH_COLS);
  const colPcts = showGst ? COL_PCT_GST : COL_PCT_NO_GST;
  const padColWidth = 3.4;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Medivax Bill Generator";
  const ws = wb.addWorksheet("Tax Invoice", {
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
    },
  });

  ws.columns = [
    ...colPcts.map((pct) => ({ width: colWidthFromPct(pct) })),
    ...Array.from({ length: SHEET_WIDTH_COLS - colCount }, () => ({
      width: padColWidth,
    })),
  ];

  let r = 1;

  ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
  const t1 = ws.getCell(`A${r}`);
  t1.value = "TAX INVOICE";
  t1.font = { bold: true, size: 14 };
  t1.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(t1);
  r++;

  ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
  const t2 = ws.getCell(`A${r}`);
  t2.value = "Computer generated — medivax pharma";
  t2.font = { size: 11, color: { argb: "FF475569" } };
  t2.alignment = { horizontal: "center", vertical: "middle" };
  applyBorder(t2);
  r++;

  const headerStart = r;
  const sellerEndRow = r + 10;

  ws.mergeCells(`A${headerStart}:F${sellerEndRow}`);
  const sellerCell = ws.getCell(`A${headerStart}`);
  sellerCell.value = buildSellerBlock(showGst, billInfo.email);
  sellerCell.alignment = { wrapText: true, vertical: "top" };
  sellerCell.font = { size: 10 };
  applyBorder(sellerCell);

  ws.mergeCells(`G${headerStart}:L${sellerEndRow}`);
  const billToCell = ws.getCell(`G${headerStart}`);
  billToCell.value = buildBillToBlock(billInfo, showGst);
  billToCell.alignment = { wrapText: true, vertical: "top" };
  billToCell.font = { size: 10 };
  applyBorder(billToCell);

  const metaRows: [string, string][] = [
    ["Invoice No.", billInfo.billNo || "—"],
    ["Dated", formatBillDateForInvoice(billInfo.billDate)],
    ["Time", billInfo.billTime || "—"],
    ["Mode / Terms", billInfo.mode],
    ["Delivered By", billInfo.deliveredBy || "—"],
    ["Sales Person", billInfo.salesPerson || "—"],
    ["Order Date", formatBillDateForInvoice(billInfo.billDate)],
  ];

  let metaR = headerStart;
  for (const [label, val] of metaRows) {
    ws.mergeCells(`M${metaR}:N${metaR}`);
    const lc = ws.getCell(`M${metaR}`);
    lc.value = label;
    lc.font = { bold: true, size: 10, color: { argb: "FF334155" } };
    lc.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    applyBorder(lc);
    ws.mergeCells(`O${metaR}:Q${metaR}`);
    const vc = ws.getCell(`O${metaR}`);
    vc.value = val || "—";
    vc.alignment = { wrapText: true, vertical: "top" };
    vc.font = { size: 10 };
    applyBorder(vc);
    metaR++;
  }

  for (let row = metaR; row <= sellerEndRow; row++) {
    ws.mergeCells(`M${row}:Q${row}`);
    const filler = ws.getCell(`M${row}`);
    filler.value = "";
    applyBorder(filler);
  }

  for (let row = headerStart; row <= sellerEndRow; row++) {
    for (let c = 1; c <= SHEET_WIDTH_COLS; c++) {
      const cell = ws.getRow(row).getCell(c);
      if (!cell.border?.top) applyBorder(cell);
    }
  }

  r = sellerEndRow + 1;
  ws.getRow(r).height = 6;
  r++;

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

  const itemHeaderRow = r;
  const itemHeader = ws.getRow(itemHeaderRow);
  headers.forEach((h, i) => {
    const cell = itemHeader.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10 };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.fill = HEADER_FILL;
    applyBorder(cell);
  });
  padRowToSheetWidth(ws, itemHeaderRow, colCount + 1);
  r++;

  const gstBreakdown = showGst ? calculateGstBreakdown(items) : null;

  items.forEach((item, index) => {
    const row = ws.getRow(r);
    let c = 1;
    const setStr = (
      val: string | number | null | undefined,
      opts?: { align?: "left" | "right" | "center" },
    ) => {
      const cell = row.getCell(c++);
      const align = opts?.align ?? "left";
      if (val === null || val === undefined || val === "") cell.value = "";
      else cell.value = val;
      cell.alignment = { vertical: "top", horizontal: align, wrapText: true };
      cell.font = { size: 10 };
      applyBorder(cell);
    };

    setStr(index + 1, { align: "center" });
    setStr(item.description ?? "");
    setStr(item.hsn ?? "");
    if (showGst) {
      setStr(hasLineValues(item) ? "5%" : "", { align: "center" });
    }
    setStr(item.mfg ?? "");
    if (item.qty != null && !Number.isNaN(Number(item.qty))) {
      const q = row.getCell(c);
      q.value = Number(item.qty);
      q.alignment = { vertical: "top", horizontal: "center" };
      q.font = { size: 10 };
      applyBorder(q);
    } else {
      const q = row.getCell(c);
      q.value = "";
      q.alignment = { vertical: "top", horizontal: "center" };
      q.font = { size: 10 };
      applyBorder(q);
    }
    c++;
    setStr(item.unit ?? "", { align: "center" });
    setStr(item.batch ?? "");
    setStr(item.exp ?? "", { align: "center" });

    const setNum = (v: number | null | undefined) => {
      const cell = row.getCell(c++);
      if (v != null && !Number.isNaN(Number(v)) && Number(v) !== 0) {
        cell.value = round2(Number(v));
        cell.numFmt = "0.00";
      } else cell.value = "";
      cell.alignment = { vertical: "top", horizontal: "right" };
      cell.font = { size: 10 };
      applyBorder(cell);
    };
    setNum(item.mrp != null ? Number(item.mrp) : null);
    if (item.disc != null && item.disc !== 0) {
      row.getCell(c).value = Number(item.disc);
      row.getCell(c).alignment = { vertical: "top", horizontal: "right" };
      row.getCell(c).font = { size: 10 };
      applyBorder(row.getCell(c));
    } else {
      row.getCell(c).value = "";
      row.getCell(c).alignment = { vertical: "top", horizontal: "right" };
      applyBorder(row.getCell(c));
    }
    c++;
    setNum(item.rate != null ? Number(item.rate) : null);
    setNum(item.amount != null ? Number(item.amount) : null);
    padRowToSheetWidth(ws, r, colCount + 1);
    r++;
  });

  ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
  const sumRow = ws.getCell(`A${r}`);
  sumRow.value = `Items: ${getActiveItemCount(items)}  |  Total Qty: ${calculateTotalItems(items)}`;
  sumRow.alignment = { horizontal: "right", vertical: "middle" };
  sumRow.font = { bold: true, size: 10 };
  sumRow.fill = FOOT_SUM_FILL;
  applyBorder(sumRow);
  r++;

  if (showGst && gstBreakdown) {
    addAmountFooterRow(
      ws,
      r,
      colCount,
      "Taxable value",
      gstBreakdown.taxableValue.toFixed(2),
      { labelBold: true },
    );
    r++;

    addAmountFooterRow(
      ws,
      r,
      colCount,
      "CGST @ 2.50%",
      gstBreakdown.cgst.toFixed(2),
    );
    r++;

    addAmountFooterRow(
      ws,
      r,
      colCount,
      "SGST / UTGST @ 2.50%",
      gstBreakdown.sgst.toFixed(2),
    );
    r++;

    if (Math.abs(gstBreakdown.roundOff) >= 0.001) {
      const ro = gstBreakdown.roundOff;
      const roStr =
        ro < 0
          ? `(−) ${Math.abs(ro).toFixed(2)}`
          : ro > 0
            ? `+${ro.toFixed(2)}`
            : ro.toFixed(2);
      addAmountFooterRow(ws, r, colCount, "Round off", roStr);
      r++;
    }

    addAmountFooterRow(
      ws,
      r,
      colCount,
      "GRAND TOTAL",
      `₹ ${gstBreakdown.grandTotal.toFixed(2)}`,
      { labelBold: true, fill: GRAND_FILL },
    );
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const words = ws.getCell(`A${r}`);
    words.value = `Amount chargeable (in words): ${amountInWordsInr(gstBreakdown.grandTotal)}`;
    words.font = { bold: true, size: 10 };
    words.alignment = { vertical: "top", wrapText: true };
    applyBorder(words);
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const bigAmt = ws.getCell(`A${r}`);
    bigAmt.value = `₹ ${gstBreakdown.grandTotal.toFixed(2)}`;
    bigAmt.font = { bold: true, size: 16 };
    bigAmt.alignment = { horizontal: "left", vertical: "middle" };
    applyBorder(bigAmt);
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const eoe = ws.getCell(`A${r}`);
    eoe.value = "E. & O. E.";
    eoe.font = { size: 10, color: { argb: "FF475569" } };
    eoe.alignment = { horizontal: "right" };
    applyBorder(eoe);
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const taxTitle = ws.getCell(`A${r}`);
    taxTitle.value = "Tax summary (GST @ 5% — CGST 2.50% + SGST / UTGST 2.50%)";
    taxTitle.font = { bold: true, size: 10 };
    taxTitle.alignment = { vertical: "middle", wrapText: true };
    applyBorder(taxTitle);
    r++;

    const taxR1 = r;
    ws.mergeCells(`B${taxR1}:C${taxR1}`);
    ws.mergeCells(`D${taxR1}:E${taxR1}`);
    const h1 = ws.getRow(taxR1);
    h1.getCell(1).value = "Taxable value";
    h1.getCell(2).value = "CGST";
    h1.getCell(4).value = "SGST / UTGST";
    h1.getCell(6).value = "Total tax";
    for (let i = 1; i <= 6; i++) {
      const cell = h1.getCell(i);
      cell.font = { bold: true, size: 9 };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.fill = HEADER_FILL;
      applyBorder(cell);
    }
    padRowToSheetWidth(ws, taxR1, 7);
    r++;

    const h2Row = r;
    const h2 = ws.getRow(h2Row);
    const sub = ["", "Rate", "Amount", "Rate", "Amount", ""];
    sub.forEach((h, i) => {
      const cell = h2.getCell(i + 1);
      cell.value = h;
      cell.font = { size: 9 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = HEADER_FILL;
      applyBorder(cell);
    });
    padRowToSheetWidth(ws, h2Row, 7);
    r++;

    const trRow = r;
    const tr = ws.getRow(trRow);
    const taxVals = [
      gstBreakdown.taxableValue.toFixed(2),
      "2.50%",
      gstBreakdown.cgst.toFixed(2),
      "2.50%",
      gstBreakdown.sgst.toFixed(2),
      gstBreakdown.totalTax.toFixed(2),
    ];
    taxVals.forEach((v, i) => {
      const cell = tr.getCell(i + 1);
      cell.value = v;
      cell.alignment = {
        horizontal:
          i === 0 || i === 2 || i === 4 || i === 5 ? "right" : "center",
        vertical: "middle",
      };
      cell.font = { size: 10 };
      applyBorder(cell);
    });
    padRowToSheetWidth(ws, trRow, 7);
    r++;

    const tr2Row = r;
    const tr2 = ws.getRow(tr2Row);
    const taxVals2 = [
      gstBreakdown.taxableValue.toFixed(2),
      "",
      gstBreakdown.cgst.toFixed(2),
      "",
      gstBreakdown.sgst.toFixed(2),
      gstBreakdown.totalTax.toFixed(2),
    ];
    taxVals2.forEach((v, i) => {
      const cell = tr2.getCell(i + 1);
      cell.value = v;
      cell.font = { bold: true, size: 10 };
      cell.fill = FOOT_SUM_FILL;
      cell.alignment = {
        horizontal:
          i === 0 || i === 2 || i === 4 || i === 5 ? "right" : "center",
        vertical: "middle",
      };
      applyBorder(cell);
    });
    padRowToSheetWidth(ws, tr2Row, 7);
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const tw = ws.getCell(`A${r}`);
    tw.value = `Tax amount (in words): ${amountInWordsInr(gstBreakdown.totalTax)}`;
    tw.font = { bold: true, size: 10 };
    tw.alignment = { vertical: "top", wrapText: true };
    applyBorder(tw);
    r++;

    const declEnd = r + 6;
    ws.mergeCells(`A${r}:F${declEnd}`);
    const decl = ws.getCell(`A${r}`);
    decl.value = [
      "Declaration",
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "Subject to Kolkata jurisdiction",
      "Please consult your doctor before using medicines. Cold chain items once sold cannot be taken back for technical reasons.",
    ].join("\n\n");
    decl.alignment = { wrapText: true, vertical: "top" };
    decl.font = { size: 10 };
    applyBorder(decl);

    ws.mergeCells(`G${r}:${sheetEndCol}${declEnd}`);
    const bank = ws.getCell(`G${r}`);
    bank.value = [
      "COMPANY'S BANK DETAILS",
      "A/c holder: Medivax Pharma",
      "Bank: Kotak Mahindra Bank",
      "A/c no.: 9314146480",
      "Branch & IFSC: Park Street, Kolkata — KKBK0000322",
      "",
      "For Medivax Pharma",
      "",
      "Authorised signatory",
    ].join("\n");
    bank.alignment = { wrapText: true, vertical: "top" };
    bank.font = { size: 10 };
    applyBorder(bank);
    r = declEnd + 1;
  } else {
    const plainTotal = calculateTotal(items);
    addAmountFooterRow(
      ws,
      r,
      colCount,
      "Total pay (Rs.)",
      plainTotal.toFixed(2),
      {
        labelBold: true,
      },
    );
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r}`);
    const nw = ws.getCell(`A${r}`);
    nw.value = numberToWords(plainTotal);
    nw.font = { bold: true, size: 10 };
    nw.alignment = { wrapText: true, vertical: "top" };
    applyBorder(nw);
    r++;

    ws.mergeCells(`A${r}:${sheetEndCol}${r + 5}`);
    const plainFoot = ws.getCell(`A${r}`);
    plainFoot.value = [
      "Please consult your doctor before using the medicines.",
      "Cold chain items once sold cannot be taken back due to technical reasons.",
      "All disputes are subject to Kolkata jurisdiction only.",
      "",
      "For Medivax Pharma",
      "E. & O. E.",
      "",
      "Kotak Mahindra Bank, A/c no. 9314146480, IFSC KKBK0000322, Park Street, Kolkata — 700016",
    ].join("\n");
    plainFoot.alignment = { wrapText: true, vertical: "top" };
    plainFoot.font = { size: 10 };
    applyBorder(plainFoot);
    r += 6;
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const name = `Medivax_Tax_Invoice_${safeFilePart(billInfo.billNo || "Draft")}_${safeFilePart(billInfo.billDate || "nodate")}.xlsx`;
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
