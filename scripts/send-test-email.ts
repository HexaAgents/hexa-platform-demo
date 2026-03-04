/**
 * Send three test emails to the target inbox:
 *   1. A formal purchase order (HTML)
 *   2. A CSV order spreadsheet
 *   3. A handwritten note photo (PNG)
 *
 * Each email, when processed via the Outlook add-in, creates a separate order.
 *
 * Usage:
 *   1. Copy .env.example → .env and fill in SMTP + recipient values
 *   2. Run:  npx tsx scripts/send-test-email.ts
 */

import * as nodemailer from "nodemailer";
import * as path from "path";
import * as fs from "fs";

const REQUIRED_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "RECIPIENT_EMAIL",
] as const;

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const localPath = path.resolve(__dirname, "..", ".env.local");
  const file = fs.existsSync(localPath) ? localPath : envPath;

  if (!fs.existsSync(file)) {
    console.error(
      "No .env or .env.local found. Copy .env.example and fill in your values."
    );
    process.exit(1);
  }

  const lines = fs.readFileSync(file, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }

  for (const v of REQUIRED_VARS) {
    if (!process.env[v]) {
      console.error(`Missing env var: ${v}`);
      process.exit(1);
    }
  }
}

async function main() {
  loadEnv();

  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT!);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const to = process.env.RECIPIENT_EMAIL!;

  const publicDir = path.resolve(__dirname, "..", "public");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  console.log(`Connecting to ${host}:${port} as ${user}...\n`);

  // ── Email 1: Formal Purchase Order (HTML) ────────────────────

  const htmlPath = path.join(publicDir, "sample-purchase-order.html");

  if (fs.existsSync(htmlPath)) {
    const info = await transporter.sendMail({
      from: `"James Whitfield - Acme Distributors" <${user}>`,
      to,
      subject: "PO-2026-0341 — March Restock Order",
      text: [
        "Hi,",
        "",
        "Please find attached our purchase order PO-2026-0341 for the March restock.",
        "A few items still need price confirmation — I've noted those on the PO.",
        "",
        "Happy to jump on a call to clarify anything.",
        "",
        "Best regards,",
        "James Whitfield",
        "Purchasing Manager",
        "Acme Distributors Inc.",
        "(555) 234-8901",
      ].join("\n"),
      attachments: [
        {
          filename: "PO-2026-0341-AcmeDistributors.html",
          path: htmlPath,
          contentType: "text/html",
        },
      ],
    });
    console.log("Email 1 sent (Purchase Order HTML)");
    console.log(`  Message ID: ${info.messageId}`);
  } else {
    console.log("Skipping Email 1 — sample-purchase-order.html not found.");
  }

  // ── Email 2: CSV Order Spreadsheet ───────────────────────────

  const csvPath = path.join(publicDir, "sample-order.csv");

  if (fs.existsSync(csvPath)) {
    const info = await transporter.sendMail({
      from: `"Sarah Chen - Meridian Parts" <${user}>`,
      to,
      subject: "February Replenishment — Order Spreadsheet",
      text: [
        "Hi team,",
        "",
        "Attached is our February replenishment order as a CSV export",
        "from our inventory system. Should be straightforward — all SKUs",
        "are ones we've ordered before.",
        "",
        "Please confirm availability and expected ship dates.",
        "",
        "Thanks,",
        "Sarah Chen",
        "Procurement Lead",
        "Meridian Parts Co.",
        "(555) 876-5432",
      ].join("\n"),
      attachments: [
        {
          filename: "meridian-parts-feb-order.csv",
          path: csvPath,
          contentType: "text/csv",
        },
      ],
    });
    console.log("\nEmail 2 sent (CSV Spreadsheet)");
    console.log(`  Message ID: ${info.messageId}`);
  } else {
    console.log("\nSkipping Email 2 — sample-order.csv not found.");
  }

  // ── Email 3: Handwritten Note Photo (PNG) ────────────────────

  const notePath = path.join(publicDir, "handwritten-order-note.png");

  if (fs.existsSync(notePath)) {
    const info = await transporter.sendMail({
      from: `"Marcus Rivera - Topline Hardware" <${user}>`,
      to,
      subject: "Quick order note from our warehouse",
      text: [
        "Hi,",
        "",
        "Here's a photo of the handwritten note from our warehouse team.",
        "A few of the SKUs are hard to read so we might need to confirm those.",
        "",
        "Can you check availability on the valve assemblies and pump impellers?",
        "",
        "Thanks,",
        "Marcus Rivera",
        "Topline Hardware LLC",
        "(555) 321-0987",
      ].join("\n"),
      attachments: [
        {
          filename: "warehouse-order-note.png",
          path: notePath,
          contentType: "image/png",
        },
      ],
    });
    console.log("\nEmail 3 sent (Handwritten Note)");
    console.log(`  Message ID: ${info.messageId}`);
  } else {
    console.log("\nSkipping Email 3 — handwritten-order-note.png not found.");
  }

  console.log(`\nDone. All emails sent to ${to}`);
}

main().catch((err) => {
  console.error("Failed to send email:", err.message || err);
  process.exit(1);
});
