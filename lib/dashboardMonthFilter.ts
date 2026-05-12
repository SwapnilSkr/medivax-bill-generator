/** `type="month"` value shape: `"YYYY-MM"` */
export type YearMonthString = string;

export type DashboardDateFilter =
  | { mode: "none" }
  | { mode: "month"; ym: YearMonthString }
  | { mode: "range"; from: string; to: string };

export const defaultDashboardDateFilter: DashboardDateFilter = { mode: "none" };

export function dashboardDateFilterIsActive(filter: DashboardDateFilter): boolean {
  return filter.mode !== "none";
}

const TWO_YEAR_MONTH_COUNT = 24;

/** Rolling months (current first): last 24 months for the quick-pick dropdown. */
export function buildLastTwoYearsMonthOptions(
  now: Date = new Date(),
): { value: YearMonthString; label: string }[] {
  const out: { value: YearMonthString; label: string }[] = [];
  for (let i = 0; i < TWO_YEAR_MONTH_COUNT; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const value = `${y}-${String(m).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    out.push({ value, label });
  }
  return out;
}

export function parseFilterYearMonth(
  ym: YearMonthString,
): { year: number; month: number } | null {
  const t = ym.trim();
  if (!t) return null;
  const [ys, ms] = t.split("-");
  const year = Number(ys);
  const month = Number(ms);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export function yearMonthToDate(ym: YearMonthString): Date | undefined {
  const parsed = parseFilterYearMonth(ym);
  if (!parsed) return undefined;
  return new Date(parsed.year, parsed.month - 1, 1);
}

export function formatYearMonthDisplay(ym: YearMonthString): string {
  const parsed = parseFilterYearMonth(ym);
  if (!parsed) return "";
  return new Date(parsed.year, parsed.month - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" },
  );
}

/** Local calendar day as `YYYY-MM-DD`. */
export function dateToLocalIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function localIsoDayToDate(day: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
  if (!m) return undefined;
  const y = Number(m[1]);
  const month = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, month - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== month - 1 || dt.getDate() !== d) {
    return undefined;
  }
  return dt;
}

export function normalizeRangeDays(
  from: string,
  to: string,
): { from: string; to: string } {
  const fromMs = localIsoDayToDate(from)?.getTime() ?? NaN;
  const toMs = localIsoDayToDate(to)?.getTime() ?? NaN;
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
    return { from, to };
  }
  if (fromMs <= toMs) return { from, to };
  return { from: to, to: from };
}

function localIsoDayToMs(isoDay: string): number {
  return localIsoDayToDate(isoDay)?.getTime() ?? NaN;
}

/** Bill form date → local `YYYY-MM-DD`, or `null` if not parseable to a day. */
export function parseBillDateToLocalDay(dateStr: string | undefined): string | null {
  if (!dateStr?.trim()) return null;
  const s = dateStr.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return dateToLocalIsoDay(d);
}

/**
 * Parse bill form date string to calendar { year, month } (month 1–12).
 * Supports leading `YYYY-MM-DD` and falls back to Date parsing.
 */
export function parseBillDateYearMonth(
  dateStr: string | undefined,
): { year: number; month: number } | null {
  if (!dateStr?.trim()) return null;
  const s = dateStr.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function invoiceMatchesDashboardFilter(
  billDateStr: string | undefined,
  filter: DashboardDateFilter,
): boolean {
  if (filter.mode === "none") return true;
  if (filter.mode === "month") {
    const target = parseFilterYearMonth(filter.ym);
    if (!target) return true;
    const parsed = parseBillDateYearMonth(billDateStr);
    if (!parsed) return false;
    return parsed.year === target.year && parsed.month === target.month;
  }
  const day = parseBillDateToLocalDay(billDateStr);
  if (!day) return false;
  const { from, to } = normalizeRangeDays(filter.from, filter.to);
  const t = localIsoDayToMs(day);
  return t >= localIsoDayToMs(from) && t <= localIsoDayToMs(to);
}

/** Drafts: bill date if set; otherwise last-modified (`updatedAt`) calendar day. */
export function draftMatchesDashboardFilter(
  billDateStr: string | undefined,
  updatedAt: Date,
  filter: DashboardDateFilter,
): boolean {
  if (filter.mode === "none") return true;

  const billDay = parseBillDateToLocalDay(billDateStr);
  let effectiveDay: string | null = billDay;
  if (!effectiveDay) {
    if (Number.isNaN(updatedAt.getTime())) return false;
    effectiveDay = dateToLocalIsoDay(updatedAt);
  }

  if (filter.mode === "month") {
    const target = parseFilterYearMonth(filter.ym);
    if (!target) return true;
    const parts = effectiveDay.split("-").map(Number);
    const y = parts[0]!;
    const m = parts[1]!;
    return y === target.year && m === target.month;
  }

  const { from, to } = normalizeRangeDays(filter.from, filter.to);
  const t = localIsoDayToMs(effectiveDay);
  return t >= localIsoDayToMs(from) && t <= localIsoDayToMs(to);
}

export function formatDashboardRangeLabel(from: string, to: string): string {
  const { from: a, to: b } = normalizeRangeDays(from, to);
  const df = localIsoDayToDate(a);
  const dt = localIsoDayToDate(b);
  if (!df || !dt) return "Date range";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  if (a === b) return df.toLocaleDateString("en-IN", opts);
  return `${df.toLocaleDateString("en-IN", opts)} – ${dt.toLocaleDateString("en-IN", opts)}`;
}
