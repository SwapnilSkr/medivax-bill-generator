import ExcelJS from "exceljs";
import type { InventoryItem } from "@/types/inventory";
import { getStockLevel } from "@/utils/inventory";

export type InventoryExcelExportMode = "simple" | "advanced";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE2E8F0" },
};

const STOCK_LABEL = {
  ok: "In stock",
  low: "Low stock",
  out: "Out of stock",
} as const;

function formatExportDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSheetDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  return wb.xlsx.writeBuffer().then((buf) => {
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.font = { bold: true, size: 10 };
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle" };
  }
  row.height = 20;
}

function buildSimpleSheet(ws: ExcelJS.Worksheet, items: InventoryItem[]) {
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const headerRow = ws.getRow(1);
  headerRow.getCell(1).value = "Vaccine";
  headerRow.getCell(2).value = "MRP (₹)";
  headerRow.getCell(3).value = "Your price (₹)";
  styleHeaderRow(headerRow, 3);

  items.forEach((item, index) => {
    const row = ws.getRow(2 + index);
    row.getCell(1).value = item.name;
    row.getCell(2).value = item.mrp;
    row.getCell(3).value = item.price;
  });

  ws.getColumn(1).width = 32;
  ws.getColumn(2).width = 14;
  ws.getColumn(3).width = 16;

  for (let r = 2; r < 2 + items.length; r++) {
    ws.getCell(`B${r}`).numFmt = "#,##0.00";
    ws.getCell(`C${r}`).numFmt = "#,##0.00";
  }
}

function buildAdvancedSheet(
  ws: ExcelJS.Worksheet,
  items: InventoryItem[],
  exportedAt: Date,
  filtered: boolean,
) {
  ws.views = [{ state: "frozen", ySplit: 5 }];

  let totalUnits = 0;
  let lowCount = 0;
  let outCount = 0;
  for (const item of items) {
    totalUnits += item.quantity;
    const level = getStockLevel(item);
    if (level === "low") lowCount += 1;
    if (level === "out") outCount += 1;
  }

  ws.mergeCells("A1:I1");
  const title = ws.getCell("A1");
  title.value = "Medivax Pharma — Vaccine Inventory";
  title.font = { bold: true, size: 14 };

  ws.mergeCells("A2:I2");
  ws.getCell("A2").value = `Exported ${formatExportDate(exportedAt)}${
    filtered ? " · filtered view" : ""
  }`;
  ws.getCell("A2").font = { size: 10, color: { argb: "FF64748B" } };

  ws.mergeCells("A3:I3");
  ws.getCell("A3").value = `${items.length} SKUs · ${totalUnits} total units · ${lowCount} low stock · ${outCount} out of stock`;
  ws.getCell("A3").font = { size: 10 };

  const headers = [
    "Vaccine",
    "Units in stock",
    "Status",
    "MRP (₹)",
    "Your price (₹)",
    "HSN",
    "Manufacturer",
    "Low-stock alert at",
    "Last updated",
  ];

  const headerRow = ws.getRow(5);
  headers.forEach((label, i) => {
    headerRow.getCell(i + 1).value = label;
  });
  styleHeaderRow(headerRow, headers.length);

  items.forEach((item, index) => {
    const row = ws.getRow(6 + index);
    const level = getStockLevel(item);
    row.getCell(1).value = item.name;
    row.getCell(2).value = item.quantity;
    row.getCell(3).value = STOCK_LABEL[level];
    row.getCell(4).value = item.mrp;
    row.getCell(5).value = item.price;
    row.getCell(6).value = item.hsn ?? "";
    row.getCell(7).value = item.mfg ?? "";
    row.getCell(8).value = item.lowStockThreshold ?? 5;
    row.getCell(9).value = formatSheetDate(item.updatedAt);
  });

  ws.getColumn(1).width = 28;
  ws.getColumn(2).width = 14;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 14;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 18;
  ws.getColumn(8).width = 18;
  ws.getColumn(9).width = 16;

  for (let r = 6; r < 6 + items.length; r++) {
    ws.getCell(`B${r}`).numFmt = "#,##0";
    ws.getCell(`D${r}`).numFmt = "#,##0.00";
    ws.getCell(`E${r}`).numFmt = "#,##0.00";
    ws.getCell(`H${r}`).numFmt = "#,##0";
  }
}

export interface ExportInventoryExcelOptions {
  items: InventoryItem[];
  mode?: InventoryExcelExportMode;
  /** When true, subtitle notes the export reflects the current search filter. */
  filtered?: boolean;
}

export async function exportInventoryToExcel({
  items,
  mode = "simple",
  filtered = false,
}: ExportInventoryExcelOptions): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Medivax Pharma";
  wb.created = new Date();

  const ws = wb.addWorksheet("Inventory");
  const exportedAt = new Date();
  const datePart = exportedAt.toISOString().slice(0, 10);

  if (mode === "simple") {
    buildSimpleSheet(ws, items);
    await downloadWorkbook(wb, `Medivax_Inventory_Simple_${datePart}.xlsx`);
    return;
  }

  buildAdvancedSheet(ws, items, exportedAt, filtered);
  await downloadWorkbook(wb, `Medivax_Inventory_Advanced_${datePart}.xlsx`);
}
