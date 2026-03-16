import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const REQUIRED_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

const DEMO_EMAIL_RECIPIENT = "supplier-hexa@outlook.com";

export async function POST() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: "SMTP not configured",
        message:
          "Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable sending demo emails.",
        missingVars: missing,
      },
      { status: 503 }
    );
  }

  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT!);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const to = DEMO_EMAIL_RECIPIENT;

  const publicDir = path.join(process.cwd(), "public");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const sent: string[] = [];
  const errors: string[] = [];

  try {
    // Email 1: RFQ (CSV)
    const rfqCsvPath = path.join(publicDir, "rfq-request-march.csv");
    if (fs.existsSync(rfqCsvPath)) {
      await transporter.sendMail({
        from: `"Elena Marsh - Northfield Components" <${user}>`,
        to,
        subject: "RFQ-2026-1187 — Need quote for March machining lot (CSV)",
        text: [
          "Hi Hexa team,",
          "",
          "Please quote the attached items for our March machining lot.",
          "Please include lead time and confirm drawing revision support.",
          "",
          "Target response date: 16 Mar 2026.",
          "",
          "Thanks,",
          "Elena Marsh",
          "Buyer, Northfield Components",
          "(555) 220-1178",
        ].join("\n"),
        attachments: [
          {
            filename: "RFQ-2026-1187-Northfield.csv",
            path: rfqCsvPath,
            contentType: "text/csv",
          },
        ],
      });
      sent.push("RFQ (CSV)");
    } else {
      errors.push("rfq-request-march.csv not found");
    }

    // Email 2: RFQ (handwritten note, PDF)
    const rfqHandwrittenPath = path.join(publicDir, "rfq-handwritten-note.pdf");
    if (fs.existsSync(rfqHandwrittenPath)) {
      await transporter.sendMail({
        from: `"Ravi Patel - Summit Fabrication" <${user}>`,
        to,
        subject: "Quick RFQ — handwritten shop-floor request",
        text: [
          "Hi,",
          "",
          "Attaching a handwritten request from our production lead.",
          "Please quote what you can and flag anything unclear.",
          "",
          "This one is urgent for line setup next week.",
          "",
          "Thanks,",
          "Ravi Patel",
          "Summit Fabrication",
          "(555) 778-4010",
        ].join("\n"),
        attachments: [
          {
            filename: "RFQ-handwritten-note.pdf",
            path: rfqHandwrittenPath,
            contentType: "application/pdf",
          },
        ],
      });
      sent.push("RFQ (Handwritten PDF)");
    } else {
      errors.push("rfq-handwritten-note.pdf not found");
    }

    // Email 3: Purchase Order that matches prior quote
    const poMatchPath = path.join(publicDir, "po-match-q-2026-0047.pdf");
    if (fs.existsSync(poMatchPath)) {
      await transporter.sendMail({
        from: `"James Whitfield - Acme Distributors" <${user}>`,
        to,
        subject: "PO-2026-0341 — Confirmed against Quote Q-2026-0047",
        text: [
          "Hi,",
          "",
          "Attached PO aligns with your quote Q-2026-0047.",
          "Please process and push to ERP once validated.",
          "",
          "Please confirm expected ship date in your acknowledgment.",
          "",
          "Thanks,",
          "James Whitfield",
          "Acme Distributors Inc.",
          "(555) 234-8901",
        ].join("\n"),
        attachments: [
          {
            filename: "PO-2026-0341-match.pdf",
            path: poMatchPath,
            contentType: "application/pdf",
          },
        ],
      });
      sent.push("PO (Matched to Quote)");
    } else {
      errors.push("po-match-q-2026-0047.pdf not found");
    }

    // Email 4: Purchase Order with quote mismatch
    const poMismatchPath = path.join(publicDir, "po-mismatch-q-2026-0047.pdf");
    if (fs.existsSync(poMismatchPath)) {
      await transporter.sendMail({
        from: `"James Whitfield - Acme Distributors" <${user}>`,
        to,
        subject: "PO-2026-0342 — Updated quantities (please expedite)",
        text: [
          "Hi team,",
          "",
          "Sharing an updated PO revision for immediate release.",
          "We changed quantity and due dates on a few lines.",
          "",
          "Please process quickly if acceptable.",
          "",
          "Best,",
          "James Whitfield",
          "Acme Distributors Inc.",
          "(555) 234-8901",
        ].join("\n"),
        attachments: [
          {
            filename: "PO-2026-0342-mismatch.pdf",
            path: poMismatchPath,
            contentType: "application/pdf",
          },
        ],
      });
      sent.push("PO (Mismatch vs Quote)");
    } else {
      errors.push("po-mismatch-q-2026-0047.pdf not found");
    }

    // Email 5: Procurement request — Pneumatic Cylinder (Packaging Line 2)
    await transporter.sendMail({
      from: `"Sarah Chen - Production Engineering" <${user}>`,
      to,
      subject:
        "Parts needed — Packaging Line 2 actuator replacement",
      text: [
        "Hi Procurement,",
        "",
        "We need the following parts for the Packaging Line 2 actuator replacement project. The current cylinders are failing intermittently and we need replacements before the April production ramp.",
        "",
        "- 12× Pneumatic Cylinder, 40mm bore, 200mm stroke (double-acting, magnetic piston)",
        "- 12× Mounting bracket kits for the above cylinders",
        '- 6× 5/3 way solenoid valves, ¼" NPT ports',
        "",
        "Target delivery by end of March if possible. Let me know if you need any additional specs.",
        "",
        "Thanks,",
        "Sarah Chen",
        "Production Engineering",
      ].join("\n"),
    });
    sent.push("Procurement Request (Pneumatic Cylinder)");

    if (sent.length === 0) {
      return NextResponse.json(
        {
          error: "No emails sent",
          message: "Attachment files not found in public folder.",
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sent.length} demo email(s) to ${to}`,
      sent,
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send emails";
    return NextResponse.json(
      {
        error: "Send failed",
        message,
      },
      { status: 500 }
    );
  }
}
