import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");

const COLORS = {
  black: rgb(0, 0, 0),
  dark: rgb(0.15, 0.15, 0.15),
  gray: rgb(0.4, 0.4, 0.4),
  lightGray: rgb(0.6, 0.6, 0.6),
  lineGray: rgb(0.82, 0.82, 0.82),
  bgGray: rgb(0.95, 0.95, 0.95),
  headerBg: rgb(0.12, 0.18, 0.28),
  headerText: rgb(1, 1, 1),
  accent: rgb(0.1, 0.35, 0.6),
  tableHeaderBg: rgb(0.92, 0.93, 0.95),
};

function drawHLine(page, y, x1, x2) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color: COLORS.lineGray });
}

function drawRect(page, x, y, w, h, color) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

async function generateRfqPacific() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  const m = 50;

  // Header bar
  drawRect(page, 0, height - 70, width, 70, COLORS.headerBg);
  page.drawText("PACIFIC INDUSTRIAL CO.", { x: m, y: height - 32, size: 16, font: bold, color: COLORS.headerText });
  page.drawText("4200 Harbor Blvd, Suite 100, Long Beach, CA 90802", { x: m, y: height - 50, size: 8, font: regular, color: rgb(0.7, 0.75, 0.8) });
  page.drawText("REQUEST FOR QUOTATION", { x: width - m - bold.widthOfTextAtSize("REQUEST FOR QUOTATION", 14), y: height - 35, size: 14, font: bold, color: COLORS.headerText });

  let y = height - 100;

  // RFQ metadata
  const meta = [
    ["RFQ Number:", "RFQ-PAC-2026-0052"],
    ["Date:", "March 13, 2026"],
    ["Prepared By:", "Tom Wagner"],
    ["Email:", "tom.wagner@pacificindustrial.com"],
    ["Phone:", "(555) 401-8833"],
  ];

  for (const [label, value] of meta) {
    page.drawText(label, { x: m, y, size: 9, font: bold, color: COLORS.gray });
    page.drawText(value, { x: m + 85, y, size: 9, font: regular, color: COLORS.dark });
    y -= 15;
  }

  y -= 10;
  page.drawText("TO:", { x: m, y, size: 9, font: bold, color: COLORS.accent });
  y -= 14;
  page.drawText("Hexa Manufacturing — Sales Department", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 13;
  page.drawText("sales@hexamfg.com", { x: m, y, size: 9, font: regular, color: COLORS.dark });

  y -= 25;
  page.drawText("SUBJECT: CNC Machining Parts for Q2 Production Run", { x: m, y, size: 11, font: bold, color: COLORS.dark });

  y -= 20;
  page.drawText("Please provide pricing and lead times for the following items. Delivery required to our", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 13;
  page.drawText("Long Beach facility, Dock 3. Payment terms: Net 30.", { x: m, y, size: 9, font: regular, color: COLORS.dark });

  // Table
  y -= 25;
  const cols = [m, m + 35, m + 200, m + 290, m + 340, m + 390, m + 448];
  const colLabels = ["#", "Description", "SKU", "Qty", "UOM", "Target Price", "Need Date"];

  drawRect(page, m, y - 6, width - 2 * m, 20, COLORS.tableHeaderBg);
  for (let i = 0; i < colLabels.length; i++) {
    page.drawText(colLabels[i], { x: cols[i], y, size: 8, font: bold, color: COLORS.gray });
  }
  y -= 20;
  drawHLine(page, y + 12, m, width - m);

  const items = [
    ["1", "Aluminum Bracket 100mm", "AL-BRK-100", "200", "units", "$8.75", "Apr 15, 2026"],
    ["2", "Stainless Dowel Pin", "—", "50", "units", "TBD", "Apr 15, 2026"],
    ["3", "Titanium Shaft Collar", "TC-25 / TC-30", "30", "units", "$22.00", "Apr 20, 2026"],
    ["4", "Custom Spacer (non-std)", "—", "100", "units", "TBD", "Apr 20, 2026"],
    ["5", "Precision Bushing 440C", "PB-440", "80", "units", "$6.50", "Apr 20, 2026"],
  ];

  for (const row of items) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], { x: cols[i], y, size: 8.5, font: regular, color: COLORS.dark });
    }
    y -= 20;
    drawHLine(page, y + 12, m, width - m);
  }

  // Notes
  y -= 20;
  page.drawText("NOTES:", { x: m, y, size: 9, font: bold, color: COLORS.dark });
  y -= 14;
  const notes = [
    "1.  Line 2 — Diameter not specified; please quote both 6mm and 8mm options.",
    "2.  Line 3 — Please clarify bore size: TC-25 (25mm ID) or TC-30 (30mm ID).",
    "3.  Line 4 — Custom part, material and dimensions to follow. Quote as custom fabrication.",
    "4.  All items must meet ISO 9001 quality certification.",
    "5.  Partial shipments are acceptable if lead times differ.",
  ];
  for (const note of notes) {
    page.drawText(note, { x: m, y, size: 8, font: regular, color: COLORS.dark });
    y -= 13;
  }

  // Footer
  y -= 20;
  drawHLine(page, y, m, width - m);
  y -= 14;
  page.drawText("Please return your quotation by March 20, 2026. Contact Tom Wagner with any questions.", { x: m, y, size: 8, font: regular, color: COLORS.gray });
  y -= 12;
  page.drawText("Pacific Industrial Co. — Confidential", { x: m, y, size: 7, font: regular, color: COLORS.lightGray });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(PUBLIC, "rfq-pacific-q2-2026.pdf"), bytes);
  console.log("  ✓ rfq-pacific-q2-2026.pdf");
}

async function generateRfqAcme() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  const m = 50;

  drawRect(page, 0, height - 70, width, 70, rgb(0.08, 0.25, 0.15));
  page.drawText("ACME DISTRIBUTORS INC.", { x: m, y: height - 32, size: 16, font: bold, color: COLORS.headerText });
  page.drawText("1200 Commerce Blvd, Suite 400, Austin, TX 73301", { x: m, y: height - 50, size: 8, font: regular, color: rgb(0.65, 0.78, 0.7) });
  page.drawText("REQUEST FOR QUOTATION", { x: width - m - bold.widthOfTextAtSize("REQUEST FOR QUOTATION", 14), y: height - 35, size: 14, font: bold, color: COLORS.headerText });

  let y = height - 100;

  const meta = [
    ["RFQ Number:", "RFQ-ACME-2026-0051"],
    ["Date:", "March 13, 2026"],
    ["Buyer:", "James Whitfield"],
    ["Email:", "james.whitfield@acmedist.com"],
    ["Phone:", "(555) 234-8901"],
    ["Ship To:", "850 Warehouse Dr, Unit 12, Austin, TX 73344"],
  ];

  for (const [label, value] of meta) {
    page.drawText(label, { x: m, y, size: 9, font: bold, color: COLORS.gray });
    page.drawText(value, { x: m + 85, y, size: 9, font: regular, color: COLORS.dark });
    y -= 15;
  }

  y -= 10;
  page.drawText("TO: Hexa Manufacturing — Sales Team", { x: m, y, size: 9, font: bold, color: rgb(0.08, 0.25, 0.15) });
  y -= 20;
  page.drawText("SUBJECT: Hydraulic Fittings and Seals for Plant Retrofit", { x: m, y, size: 11, font: bold, color: COLORS.dark });
  y -= 16;
  page.drawText("We are requesting quotation for the following hydraulic components needed for our Austin", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 13;
  page.drawText("plant retrofit project. Please provide unit pricing, availability, and estimated lead times.", { x: m, y, size: 9, font: regular, color: COLORS.dark });

  y -= 25;
  const cols = [m, m + 35, m + 210, m + 300, m + 342, m + 388, m + 452];
  const colLabels = ["Line", "Description", "Part No.", "Qty", "UOM", "Budget", "Due Date"];

  drawRect(page, m, y - 6, width - 2 * m, 20, COLORS.tableHeaderBg);
  for (let i = 0; i < colLabels.length; i++) {
    page.drawText(colLabels[i], { x: cols[i], y, size: 8, font: bold, color: COLORS.gray });
  }
  y -= 20;
  drawHLine(page, y + 12, m, width - m);

  const items = [
    ["1", "Valve Body - Stainless 316", "VB-316-90", "120", "units", "$42.50", "Mar 28"],
    ["2", "Pump Impeller 4in", "IMP-4-220", "60", "units", "$78.00", "Mar 29"],
    ["3", "Seal Kit High Temp", "SK-HT-55 / SK-HT-80", "180", "kits", "$12.40–$18.90", "Mar 30"],
  ];

  for (const row of items) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], { x: cols[i], y, size: 8.5, font: regular, color: COLORS.dark });
    }
    y -= 20;
    drawHLine(page, y + 12, m, width - m);
  }

  y -= 20;
  page.drawText("SPECIAL INSTRUCTIONS:", { x: m, y, size: 9, font: bold, color: COLORS.dark });
  y -= 14;
  const notes = [
    "•  Line 3: Operating temperature range not yet confirmed — please quote both the",
    "   SK-HT-55 (rated 400°F) and SK-HT-80 (rated 800°F) options.",
    "•  All parts must conform to ASTM specifications where applicable.",
    "•  Partial deliveries accepted; priority for Line 1 (Valve Bodies).",
    "•  Payment Terms: Net 45.",
  ];
  for (const note of notes) {
    page.drawText(note, { x: m, y, size: 8, font: regular, color: COLORS.dark });
    y -= 13;
  }

  y -= 25;
  drawHLine(page, y, m, width - m);
  y -= 14;
  page.drawText("Quotations due by: March 18, 2026 — Email: james.whitfield@acmedist.com", { x: m, y, size: 8, font: regular, color: COLORS.gray });
  y -= 12;
  page.drawText("Acme Distributors Inc. — Proprietary & Confidential", { x: m, y, size: 7, font: regular, color: COLORS.lightGray });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(PUBLIC, "rfq-acme-hydraulic-2026.pdf"), bytes);
  console.log("  ✓ rfq-acme-hydraulic-2026.pdf");
}

async function generateRfqNorthfield() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  const m = 50;

  drawRect(page, 0, height - 70, width, 70, rgb(0.2, 0.15, 0.35));
  page.drawText("NORTHFIELD COMPONENTS", { x: m, y: height - 32, size: 16, font: bold, color: COLORS.headerText });
  page.drawText("810 Industrial Parkway, Dayton, OH 45402", { x: m, y: height - 50, size: 8, font: regular, color: rgb(0.72, 0.7, 0.82) });
  page.drawText("REQUEST FOR QUOTATION", { x: width - m - bold.widthOfTextAtSize("REQUEST FOR QUOTATION", 14), y: height - 35, size: 14, font: bold, color: COLORS.headerText });

  let y = height - 100;

  const boxW = 240;
  const boxGap = width - 2 * m - 2 * boxW;
  const boxPadTop = 10;
  const boxPadBot = 10;
  const lineH = 14;
  const boxH = boxPadTop + 4 * lineH + boxPadBot;
  const boxTop = y + boxPadTop;
  const boxBot = boxTop - boxH;
  const rightBoxX = m + boxW + boxGap;

  drawRect(page, m, boxBot, boxW, boxH, rgb(0.96, 0.96, 0.98));
  drawRect(page, rightBoxX, boxBot, boxW, boxH, rgb(0.96, 0.96, 0.98));

  const metaLeft = [
    ["RFQ #:", "RFQ-2026-1187"],
    ["Date:", "March 13, 2026"],
    ["Contact:", "Elena Marsh"],
    ["Email:", "elena.marsh@northfieldcomponents.com"],
    ["Phone:", "(555) 220-1178"],
  ];
  for (const [label, value] of metaLeft) {
    page.drawText(label, { x: m + 10, y, size: 8.5, font: bold, color: COLORS.gray });
    page.drawText(value, { x: m + 68, y, size: 8.5, font: regular, color: COLORS.dark });
    y -= lineH;
  }

  y = height - 100;
  const metaRight = [
    ["Ship To:", "810 Industrial Parkway"],
    ["", "Gate 6, Dayton, OH 45402"],
    ["Terms:", "Net 30"],
    ["Priority:", "Standard"],
    ["Project:", "March Machining Lot"],
  ];
  for (const [label, value] of metaRight) {
    if (label) page.drawText(label, { x: rightBoxX + 10, y, size: 8.5, font: bold, color: COLORS.gray });
    page.drawText(value, { x: rightBoxX + 68, y, size: 8.5, font: regular, color: COLORS.dark });
    y -= lineH;
  }

  y -= 20;
  page.drawText("Dear Sales Team,", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 14;
  page.drawText("Please quote the following CNC machined parts for our March production run. All items require", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 13;
  page.drawText("standard finishing and inspection per our standing quality agreement.", { x: m, y, size: 9, font: regular, color: COLORS.dark });

  y -= 25;
  const cols = [m, m + 30, m + 195, m + 285, m + 330, m + 385, m + 445];
  const colLabels = ["#", "Product Description", "SKU / Part #", "Qty", "UOM", "Unit Price", "Due Date"];

  drawRect(page, m, y - 6, width - 2 * m, 20, rgb(0.89, 0.88, 0.93));
  for (let i = 0; i < colLabels.length; i++) {
    page.drawText(colLabels[i], { x: cols[i], y, size: 8, font: bold, color: COLORS.gray });
  }
  y -= 20;
  drawHLine(page, y + 12, m, width - m);

  const items = [
    ["1", "Valve Body - Stainless 316 (rev C)", "VB-316-90", "120", "units", "$42.50", "Mar 28, 2026"],
    ["2", "Pump Impeller 4in (rev B)", "IMP-4-220", "60", "units", "$78.00", "Mar 29, 2026"],
    ["3", "Seal Kit High Temp (rev A)", "SK-HT-55", "180", "kits", "$12.40", "Mar 30, 2026"],
  ];

  for (let r = 0; r < items.length; r++) {
    if (r % 2 === 1) drawRect(page, m, y - 8, width - 2 * m, 20, rgb(0.97, 0.97, 0.99));
    for (let i = 0; i < items[r].length; i++) {
      page.drawText(items[r][i], { x: cols[i], y, size: 8.5, font: regular, color: COLORS.dark });
    }
    y -= 20;
    drawHLine(page, y + 12, m, width - m);
  }

  y -= 8;
  drawRect(page, m + 285, y - 4, width - m - (m + 285), 18, rgb(0.96, 0.96, 0.98));
  page.drawText("Estimated Total:", { x: m + 293, y, size: 8.5, font: bold, color: COLORS.gray });
  page.drawText("$12,222.00", { x: m + 445, y, size: 8.5, font: bold, color: COLORS.dark });

  y -= 30;
  page.drawText("TERMS & CONDITIONS:", { x: m, y, size: 9, font: bold, color: COLORS.dark });
  y -= 14;
  const terms = [
    "1.  Quotation valid for 30 days from date of issue.",
    "2.  Prices quoted are FOB Dayton, OH.",
    "3.  Standard Northfield QA inspection required before shipment.",
    "4.  Material test certificates required for all stainless steel parts.",
  ];
  for (const t of terms) {
    page.drawText(t, { x: m, y, size: 8, font: regular, color: COLORS.dark });
    y -= 13;
  }

  y -= 20;
  drawHLine(page, y, m, width - m);
  y -= 14;
  page.drawText("Elena Marsh | Procurement Manager | Northfield Components", { x: m, y, size: 8, font: regular, color: COLORS.gray });
  y -= 12;
  page.drawText("elena.marsh@northfieldcomponents.com | (555) 220-1178", { x: m, y, size: 8, font: regular, color: COLORS.lightGray });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(PUBLIC, "rfq-northfield-march-2026.pdf"), bytes);
  console.log("  ✓ rfq-northfield-march-2026.pdf");
}

async function generateRfqSummit() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const courier = await doc.embedFont(StandardFonts.Courier);
  const { width, height } = page.getSize();
  const m = 50;

  drawRect(page, 0, height - 65, width, 65, rgb(0.42, 0.22, 0.08));
  page.drawText("SUMMIT FABRICATION", { x: m, y: height - 30, size: 16, font: bold, color: COLORS.headerText });
  page.drawText("22 Foundry Lane, Pittsburgh, PA 15201", { x: m, y: height - 47, size: 8, font: regular, color: rgb(0.85, 0.75, 0.65) });
  page.drawText("RFQ", { x: width - m - bold.widthOfTextAtSize("RFQ", 20), y: height - 35, size: 20, font: bold, color: COLORS.headerText });

  let y = height - 90;

  page.drawText("From: Ravi Patel — ravi.patel@summitfab.com — (555) 778-4010", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 15;
  page.drawText("Date: March 13, 2026", { x: m, y, size: 9, font: regular, color: COLORS.dark });
  y -= 15;
  page.drawText("To: Hexa Manufacturing Sales", { x: m, y, size: 9, font: regular, color: COLORS.dark });

  y -= 25;
  drawHLine(page, y, m, width - m);
  y -= 18;
  page.drawText("HANDWRITTEN SHOP-FLOOR REQUEST — Transcribed", { x: m, y, size: 10, font: bold, color: rgb(0.42, 0.22, 0.08) });

  y -= 20;
  drawRect(page, m, y - 120, width - 2 * m, 140, rgb(0.98, 0.97, 0.94));
  page.drawRectangle({ x: m, y: y - 120, width: width - 2 * m, height: 140, borderColor: rgb(0.85, 0.8, 0.7), borderWidth: 1 });

  page.drawText("[ Transcription of handwritten note ]", { x: m + 15, y: y - 5, size: 8, font: regular, color: COLORS.lightGray });

  const handLines = [
    "Need these by March 25 — please rush if possible:",
    "",
    "  30 x shaft collars  SC-12  (rev B)",
    "  75 x bearings  BB-6205  (rev C)",
    "  20 x gasket packs  GK-STD-25",
    "",
    "Ship to Dock 2.  Call me if any issues.",
    "— Ravi",
  ];

  let hy = y - 20;
  for (const line of handLines) {
    page.drawText(line, { x: m + 20, y: hy, size: 10, font: courier, color: rgb(0.2, 0.15, 0.1) });
    hy -= 14;
  }

  y -= 155;
  page.drawText("PARSED LINE ITEMS:", { x: m, y, size: 9, font: bold, color: COLORS.dark });

  y -= 18;
  const cols = [m, m + 30, m + 190, m + 275, m + 320, m + 385, m + 445];
  const colLabels = ["#", "Product", "Part No.", "Qty", "UOM", "Catalog Price", "Need By"];

  drawRect(page, m, y - 6, width - 2 * m, 20, COLORS.tableHeaderBg);
  for (let i = 0; i < colLabels.length; i++) {
    page.drawText(colLabels[i], { x: cols[i], y, size: 8, font: bold, color: COLORS.gray });
  }
  y -= 20;
  drawHLine(page, y + 12, m, width - m);

  const items = [
    ["1", "Shaft Collar 12mm (rev B)", "SC-12", "30", "units", "$6.90", "Mar 25, 2026"],
    ["2", "Deep Groove Bearing 6205", "BB-6205", "75", "units", "$4.80", "Mar 25, 2026"],
    ["3", "Standard Gasket Pack", "GK-STD-25", "20", "packs", "$11.50", "Mar 25, 2026"],
  ];

  for (const row of items) {
    for (let i = 0; i < row.length; i++) {
      page.drawText(row[i], { x: cols[i], y, size: 8.5, font: regular, color: COLORS.dark });
    }
    y -= 20;
    drawHLine(page, y + 12, m, width - m);
  }

  y -= 8;
  page.drawText("Subtotal (at catalog):", { x: m + 325, y, size: 8.5, font: bold, color: COLORS.gray });
  page.drawText("$797.00", { x: m + 445, y, size: 8.5, font: bold, color: COLORS.dark });

  y -= 30;
  page.drawText("DELIVERY:", { x: m, y, size: 9, font: bold, color: COLORS.dark });
  y -= 14;
  page.drawText("Ship to: 22 Foundry Lane, Dock 2, Pittsburgh, PA 15201", { x: m, y, size: 8, font: regular, color: COLORS.dark });
  y -= 13;
  page.drawText("Required by: March 25, 2026 — Rush delivery requested", { x: m, y, size: 8, font: regular, color: COLORS.dark });

  y -= 25;
  drawHLine(page, y, m, width - m);
  y -= 14;
  page.drawText("Summit Fabrication — Shop Floor RFQ — Confidential", { x: m, y, size: 7, font: regular, color: COLORS.lightGray });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(PUBLIC, "rfq-summit-handwritten.pdf"), bytes);
  console.log("  ✓ rfq-summit-handwritten.pdf");
}

async function generatePoTopline() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  const m = 50;

  drawRect(page, 0, height - 75, width, 75, rgb(0.05, 0.12, 0.22));
  page.drawText("TOPLINE HARDWARE LLC", { x: m, y: height - 30, size: 16, font: bold, color: COLORS.headerText });
  page.drawText("78 Main Street, Portland, OR 97201", { x: m, y: height - 48, size: 8, font: regular, color: rgb(0.55, 0.65, 0.75) });
  const poTitle = "PURCHASE ORDER";
  page.drawText(poTitle, { x: width - m - bold.widthOfTextAtSize(poTitle, 16), y: height - 32, size: 16, font: bold, color: COLORS.headerText });
  const poNum = "PO-2026-0299";
  page.drawText(poNum, { x: width - m - regular.widthOfTextAtSize(poNum, 10), y: height - 50, size: 10, font: regular, color: rgb(0.55, 0.65, 0.75) });

  let y = height - 105;

  // Two-column header info
  drawRect(page, m, y - 75, 230, 85, rgb(0.96, 0.97, 0.98));
  page.drawText("VENDOR:", { x: m + 8, y, size: 8, font: bold, color: COLORS.accent });
  y -= 13;
  page.drawText("Hexa Manufacturing", { x: m + 8, y, size: 9, font: regular, color: COLORS.dark });
  y -= 12;
  page.drawText("Sales Department", { x: m + 8, y, size: 9, font: regular, color: COLORS.dark });
  y -= 12;
  page.drawText("sales@hexamfg.com", { x: m + 8, y, size: 9, font: regular, color: COLORS.dark });

  y = height - 105;
  drawRect(page, m + 260, y - 75, 230, 85, rgb(0.96, 0.97, 0.98));
  page.drawText("SHIP TO:", { x: m + 268, y, size: 8, font: bold, color: COLORS.accent });
  y -= 13;
  page.drawText("Topline Hardware LLC", { x: m + 268, y, size: 9, font: regular, color: COLORS.dark });
  y -= 12;
  page.drawText("900 Distribution Way", { x: m + 268, y, size: 9, font: regular, color: COLORS.dark });
  y -= 12;
  page.drawText("Portland, OR 97220", { x: m + 268, y, size: 9, font: regular, color: COLORS.dark });

  y = height - 105 - 75 - 15;

  const poMeta = [
    ["PO Number:", "PO-2026-0299"],
    ["PO Date:", "February 24, 2026"],
    ["Quote Ref:", "Q-2026-0038"],
    ["Payment Terms:", "Net 30"],
    ["Shipping:", "FedEx Economy"],
    ["Required Delivery:", "March 12, 2026"],
    ["Buyer:", "Marcus Rivera — m.rivera@toplinehardware.com"],
  ];
  for (const [label, value] of poMeta) {
    page.drawText(label, { x: m, y, size: 8.5, font: bold, color: COLORS.gray });
    page.drawText(value, { x: m + 110, y, size: 8.5, font: regular, color: COLORS.dark });
    y -= 14;
  }

  y -= 15;
  const cols = [m, m + 28, m + 195, m + 280, m + 320, m + 370, m + 430];
  const colLabels = ["#", "Item Description", "Part No.", "Qty", "UOM", "Unit Price", "Line Total"];

  drawRect(page, m, y - 6, width - 2 * m, 20, rgb(0.9, 0.92, 0.95));
  for (let i = 0; i < colLabels.length; i++) {
    page.drawText(colLabels[i], { x: cols[i], y, size: 8, font: bold, color: COLORS.gray });
  }
  y -= 20;
  drawHLine(page, y + 12, m, width - m);

  const items = [
    ["1", "Brass Hinge Small - Bulk 500", "BH-SM-500", "500", "units", "$0.85", "$425.00"],
    ["2", "Drawer Slide 18\" Pair", "DS-18-PR", "25", "pairs", "$11.00", "$275.00"],
    ["3", "Cabinet Knob Round - Br. Nickel", "CK-RND", "40", "each", "$3.25", "$130.00"],
    ["4", "Soft-Close Hinge 35mm Cup", "SC-35", "60", "each", "$4.75", "$285.00"],
  ];

  for (let r = 0; r < items.length; r++) {
    if (r % 2 === 1) drawRect(page, m, y - 8, width - 2 * m, 20, rgb(0.97, 0.98, 0.99));
    for (let i = 0; i < items[r].length; i++) {
      page.drawText(items[r][i], { x: cols[i], y, size: 8.5, font: regular, color: COLORS.dark });
    }
    y -= 20;
    drawHLine(page, y + 12, m, width - m);
  }

  // Totals
  y -= 5;
  drawRect(page, m + 330, y - 4, width - m - (m + 330), 18, rgb(0.96, 0.97, 0.98));
  page.drawText("Subtotal:", { x: m + 340, y, size: 8.5, font: bold, color: COLORS.gray });
  page.drawText("$1,115.00", { x: m + 430, y, size: 8.5, font: bold, color: COLORS.dark });
  y -= 16;
  page.drawText("Shipping:", { x: m + 340, y, size: 8.5, font: regular, color: COLORS.gray });
  page.drawText("TBD", { x: m + 430, y, size: 8.5, font: regular, color: COLORS.dark });
  y -= 16;
  drawRect(page, m + 330, y - 4, width - m - (m + 330), 18, rgb(0.9, 0.92, 0.95));
  page.drawText("TOTAL:", { x: m + 340, y, size: 9, font: bold, color: COLORS.dark });
  page.drawText("$1,115.00", { x: m + 430, y, size: 9, font: bold, color: COLORS.dark });

  y -= 30;
  page.drawText("TERMS & CONDITIONS:", { x: m, y, size: 9, font: bold, color: COLORS.dark });
  y -= 14;
  const terms = [
    "1.  This Purchase Order is subject to Topline Hardware LLC standard terms and conditions.",
    "2.  All prices are per quote Q-2026-0038 dated February 22, 2026.",
    "3.  Packing slip must reference PO number PO-2026-0299.",
    "4.  Notify buyer of any delivery delays within 24 hours.",
    "5.  Defective items subject to return at vendor's expense.",
  ];
  for (const t of terms) {
    page.drawText(t, { x: m, y, size: 7.5, font: regular, color: COLORS.dark });
    y -= 12;
  }

  y -= 15;
  drawHLine(page, y, m, width - m);
  y -= 14;
  page.drawText("Authorized By: Marcus Rivera, Purchasing Manager", { x: m, y, size: 8, font: regular, color: COLORS.gray });
  y -= 12;
  page.drawText("Topline Hardware LLC — This document constitutes a binding purchase order.", { x: m, y, size: 7, font: regular, color: COLORS.lightGray });
  y -= 12;
  page.drawText("Page 1 of 1", { x: width / 2 - 20, y, size: 7, font: regular, color: COLORS.lightGray });

  const bytes = await doc.save();
  fs.writeFileSync(path.join(PUBLIC, "po-topline-supply-q1.pdf"), bytes);
  console.log("  ✓ po-topline-supply-q1.pdf");
}

async function main() {
  console.log("Generating PDF documents...\n");
  await generateRfqPacific();
  await generateRfqAcme();
  await generateRfqNorthfield();
  await generateRfqSummit();
  await generatePoTopline();
  console.log("\nDone! All PDFs saved to public/");
}

main().catch(console.error);
