import domToImage from "dom-to-image";
import { jsPDF } from "jspdf";

export const exportToPDF = async (
  element: HTMLElement,
  orientation: "portrait" | "landscape"
): Promise<void> => {
  try {
    const dataUrl = await domToImage.toPng(element, {
      quality: 0.95,
      bgcolor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        position: "static",
        left: "0",
        top: "0",
      },
    });

    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Medivax-Bill-${orientation}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

