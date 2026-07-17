import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

/**
 * Captures an element rendered at A4 width and downloads it as an A4 PDF,
 * splitting the capture across pages when it is taller than one page.
 */
export async function downloadElementAsPdf(element: HTMLElement, filename: string) {
  const prevShadow = element.style.boxShadow;
  element.style.boxShadow = "none";

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  } finally {
    element.style.boxShadow = prevShadow;
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageHeightPx = Math.floor((pageHeight * canvas.width) / pageWidth);

  let y = 0;
  let first = true;
  while (y < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;
    const ctx = slice.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (!first) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.95),
      "JPEG",
      0,
      0,
      pageWidth,
      (sliceHeight * pageWidth) / canvas.width
    );
    first = false;
    y += sliceHeight;
  }

  pdf.save(filename);
}
