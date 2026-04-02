import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const marginMm = 5;

let probeCtx: CanvasRenderingContext2D | null = null;

function getProbeCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!probeCtx) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    probeCtx = c.getContext("2d");
  }
  return probeCtx;
}

/**
 * Browsers often return `oklch()` from getComputedStyle; html2canvas cannot parse it.
 * Canvas 2D resolves these to rgb/hex when assigned to fillStyle.
 */
function resolveModernColorToHexOrRgb(value: string): string {
  const v = value.trim();
  const ctx = getProbeCtx();
  if (!v || !ctx) return "#111827";
  try {
    ctx.fillStyle = "#000000";
    ctx.fillStyle = v;
    const out = ctx.fillStyle;
    return typeof out === "string" ? out : "#111827";
  } catch {
    return "#111827";
  }
}

/** Replace oklch/lab/lch/hwb color functions anywhere in a CSS value. */
function sanitizeCssValueForHtml2Canvas(key: string, value: string): string | null {
  if (!value) return null;
  if (!/oklch\(|lab\(|lch\(|hwb\(/i.test(value)) return value;

  let v = value
    .replace(/oklch\([^)]*\)/gi, (m) => resolveModernColorToHexOrRgb(m))
    .replace(/lab\([^)]*\)/gi, (m) => resolveModernColorToHexOrRgb(m))
    .replace(/lch\([^)]*\)/gi, (m) => resolveModernColorToHexOrRgb(m))
    .replace(/hwb\([^)]*\)/gi, (m) => resolveModernColorToHexOrRgb(m));

  if (/oklch\(|lab\(|lch\(|hwb\(/i.test(v)) {
    if (/^(filter|backdrop-filter)$/i.test(key)) return "none";
    if (/^(-webkit-)?background-image$/i.test(key)) return "none";
    if (/^mask/i.test(key)) return "none";
    return null;
  }
  return v;
}

function stripParsedStylesheets(clonedDoc: Document): void {
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove());
  clonedDoc.querySelectorAll("style").forEach((n) => n.remove());
}

function copyComputedStyleToInline(orig: HTMLElement, dest: HTMLElement): void {
  const s = window.getComputedStyle(orig);
  for (let i = 0; i < s.length; i++) {
    const key = s.item(i);
    if (!key) continue;
    try {
      const raw = s.getPropertyValue(key);
      if (raw === "") continue;
      const safe = sanitizeCssValueForHtml2Canvas(key, raw);
      if (safe === null) continue;
      dest.style.setProperty(key, safe, s.getPropertyPriority(key));
    } catch {
      /* ignore unsupported */
    }
  }
}

function inlineStyleTree(origRoot: HTMLElement, cloneRoot: HTMLElement): void {
  copyComputedStyleToInline(origRoot, cloneRoot);
  const origKids = Array.from(origRoot.children).filter(
    (n): n is HTMLElement => n instanceof HTMLElement,
  );
  const cloneKids = Array.from(cloneRoot.children).filter(
    (n): n is HTMLElement => n instanceof HTMLElement,
  );
  for (let i = 0; i < Math.min(origKids.length, cloneKids.length); i++) {
    inlineStyleTree(origKids[i], cloneKids[i]);
  }
}

/**
 * Rasterise the invoice for PDF. Strips Tailwind/oklch stylesheets in the clone,
 * inlines computed styles, and rewrites any oklch() fragments to rgb/hex.
 */
export const exportToPDF = async (
  element: HTMLElement,
  orientation: "portrait" | "landscape",
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const maxW = pageW - 2 * marginMm;
    const maxH = pageH - 2 * marginMm;

    const w = Math.ceil(
      Math.max(element.scrollWidth, element.offsetWidth, element.clientWidth),
    );
    const h = Math.ceil(
      Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight),
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: w,
      height: h,
      windowWidth: w,
      windowHeight: h,
      imageTimeout: 15000,
      onclone(clonedDoc, clonedElement) {
        stripParsedStylesheets(clonedDoc);
        const html = clonedDoc.documentElement;
        const body = clonedDoc.body;
        if (html) {
          html.style.cssText =
            "background-color:#ffffff!important;color:#0f172a!important;margin:0;padding:0;";
        }
        if (body) {
          body.style.cssText = "background-color:#ffffff!important;margin:0;padding:0;";
        }
        inlineStyleTree(element, clonedElement);
        clonedElement.style.overflow = "visible";
        clonedElement.style.maxWidth = "none";
      },
    });

    const dataUrl = canvas.toDataURL("image/png", 1);
    const iw = canvas.width;
    const ih = canvas.height;
    if (iw <= 0 || ih <= 0) {
      throw new Error("Invalid canvas dimensions for PDF");
    }

    const aspect = iw / ih;
    let drawW = maxW;
    let drawH = drawW / aspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspect;
    }

    const x = marginMm + (maxW - drawW) / 2;
    const y = marginMm;

    pdf.addImage(dataUrl, "PNG", x, y, drawW, drawH);
    pdf.save(`Medivax-Bill-${orientation}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
