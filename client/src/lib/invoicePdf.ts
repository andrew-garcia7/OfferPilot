import { jsPDF } from "jspdf";

export interface InvoicePayload {
  paymentId: string;
  orderId: string;
  billingCycle: string;
  amountPaid: number;
  currency: string;
  userEmail: string;
  plan: string;
  createdAt: Date;
}

export function downloadInvoicePdf(payload: InvoicePayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const bg = [248, 250, 252] as const;
  const slate = [15, 23, 42] as const;
  const muted = [100, 116, 139] as const;
  const emerald = [16, 185, 129] as const;

  doc.setFillColor(bg[0], bg[1], bg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(99, 102, 241);
  doc.roundedRect(40, 38, 24, 24, 7, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("OP", 46, 54);

  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.setFontSize(20);
  doc.text("OfferPilot", 74, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth - 176, 40, 136, 28, 14, 14, "FD");
  doc.setTextColor(5, 150, 105);
  doc.text("PREMIUM SUCCESS", pageWidth - 159, 58);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, 86, pageWidth - 40, 86);

  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.setFontSize(25);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Invoice", 40, 132);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(`Issued: ${payload.createdAt.toLocaleString()}`, 40, 154);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 180, pageWidth - 80, 286, 14, 14, "FD");

  const rows: Array<[string, string]> = [
    ["Plan", payload.plan.toUpperCase()],
    ["Billing Cycle", payload.billingCycle],
    ["Amount Paid", `${payload.currency} ${payload.amountPaid.toFixed(2)}`],
    ["Payment ID", payload.paymentId || "N/A"],
    ["Order ID", payload.orderId || "N/A"],
    ["User Email", payload.userEmail || "N/A"],
    ["Date & Time", payload.createdAt.toLocaleString()],
  ];

  let y = 218;
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(label.toUpperCase(), 64, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text(value, 260, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(62, y + 14, pageWidth - 62, y + 14);
    y += 36;
  }

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(40, 492, pageWidth - 80, 72, 12, 12, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(6, 95, 70);
  doc.text("Payment Successful", 62, 532);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Thank you for choosing OfferPilot. Your premium access is now active.", 62, 552);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text("This is a system generated invoice and does not require a signature.", 40, pageHeight - 44);

  doc.save("OfferPilot-Invoice.pdf");
}
