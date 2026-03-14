"use client";

import { useState, useCallback, useMemo } from "react";
import { Order } from "@/lib/types";
import { QuotePanel, ResolvedItem } from "../QuotePanel";
import { Check, Clock, Send, Download } from "lucide-react";
import type { DemoContext } from "../OrderWorkspace";

interface Props {
  order: Order;
  mode: "active" | "completed";
  demoCtx?: DemoContext;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface EditableQuoteRow {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}
type AttachmentFormat = "pdf" | "txt" | "csv";
const ATTACHMENT_FORMATS: AttachmentFormat[] = ["pdf", "txt", "csv"];
const EDITABLE_INLINE_INPUT_CLASS =
  "min-w-0 border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-5 text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";
const EDITABLE_TABLE_INPUT_CLASS =
  "min-w-0 w-full border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-5 text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";
const EDITABLE_TEXTAREA_CLASS =
  "min-h-[180px] w-full border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-relaxed text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";

function escCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function QuoteSummaryTable({ qs }: { qs: NonNullable<NonNullable<Order["demoFlow"]>["quoteSummary"]> }) {
  return (
    <div>
      <div className="border border-border">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {qs.items.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-foreground/85">{item.name}</td>
                <td className="px-3 py-2 font-mono text-foreground/70">{item.sku}</td>
                <td className="px-3 py-2 text-right text-foreground/70">{item.qty}</td>
                <td className="px-3 py-2 text-right text-foreground/70">${item.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-medium text-foreground/85">${fmt(item.unitPrice * item.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td colSpan={5} className="px-3 py-2.5 text-right text-[12px] font-medium text-foreground/70">Subtotal</td>
              <td className="px-3 py-2.5 text-right text-[13px] font-semibold text-foreground">${fmt(qs.subtotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {qs.sentAt && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Sent to {qs.sentTo} on{" "}
          {new Date(qs.sentAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}

function DraftQuoteEditor({
  qs,
  order,
  demoCtx,
}: {
  qs: NonNullable<NonNullable<Order["demoFlow"]>["quoteSummary"]>;
  order: Order;
  demoCtx: DemoContext;
}) {
  const [toEmail, setToEmail] = useState(qs.sentTo);
  const [company, setCompany] = useState(order.customer.company);
  const [dueDate, setDueDate] = useState(order.dueDate ?? "");
  const [paymentTerms, setPaymentTerms] = useState(order.paymentTerms ?? "Net 30");
  const [subject, setSubject] = useState(`${qs.quoteNumber} — ${order.customer.company}`);
  const [attachmentFormat, setAttachmentFormat] = useState<AttachmentFormat>("pdf");
  const [rows, setRows] = useState<EditableQuoteRow[]>(
    qs.items.map((item, idx) => ({
      id: `${item.sku}-${idx}`,
      name: item.name,
      sku: item.sku,
      qty: item.qty,
      unitPrice: item.unitPrice,
    }))
  );
  const [emailBody, setEmailBody] = useState(
    [
      `Dear ${order.customer.name.split(" ")[0]},`,
      "",
      `Please find attached our quotation ${qs.quoteNumber} for ${qs.items.length} items totaling $${fmt(qs.subtotal)}.`,
      "This quote is valid for 14 days. Please reply with a PO to confirm.",
      "",
      "Best regards,",
      "Hexa Sales Team",
    ].join("\n")
  );

  const subtotal = useMemo(
    () => rows.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
    [rows]
  );

  const updateRow = useCallback(
    (rowId: string, patch: Partial<EditableQuoteRow>) => {
      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
      );
    },
    []
  );

  const buildTableText = useCallback(() => {
    const header = "Product | SKU | Qty | Unit Price | Line Total";
    const divider = "-".repeat(header.length);
    const lines = rows.map(
      (item) =>
        `${item.name} | ${item.sku} | ${item.qty} | $${item.unitPrice.toFixed(2)} | $${fmt(item.qty * item.unitPrice)}`
    );
    return [header, divider, ...lines, "", `Subtotal: $${fmt(subtotal)}`].join("\n");
  }, [rows, subtotal]);

  const buildCsv = useCallback(() => {
    const csvRows = [
      ["Product", "SKU", "Qty", "Unit Price", "Line Total"].join(","),
      ...rows.map((item) =>
        [
          escCsv(item.name),
          escCsv(item.sku),
          item.qty.toString(),
          item.unitPrice.toFixed(2),
          (item.qty * item.unitPrice).toFixed(2),
        ].join(",")
      ),
      ["", "", "", "Subtotal", subtotal.toFixed(2)].join(","),
    ];
    return csvRows.join("\n");
  }, [rows, subtotal]);

  const downloadTextFile = useCallback((filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportCsv = useCallback(() => {
    downloadTextFile(`${qs.quoteNumber}.csv`, buildCsv(), "text/csv;charset=utf-8");
  }, [buildCsv, downloadTextFile, qs.quoteNumber]);

  const handleExportTxt = useCallback(() => {
    downloadTextFile(
      `${qs.quoteNumber}.txt`,
      buildTableText(),
      "text/plain;charset=utf-8"
    );
  }, [buildTableText, downloadTextFile, qs.quoteNumber]);

  const handleExportPdf = useCallback(() => {
    const printable = window.open("", "_blank");
    if (!printable) return;

    const tableText = buildTableText();
    printable.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(qs.quoteNumber)} Table Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 18px; margin: 0 0 16px; }
            pre { white-space: pre-wrap; font-size: 12px; line-height: 1.5; border: 1px solid #ddd; padding: 12px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(qs.quoteNumber)} - Table Export</h1>
          <pre>${escapeHtml(tableText)}</pre>
        </body>
      </html>`);
    printable.document.close();
    printable.focus();
    printable.print();
  }, [buildTableText, qs.quoteNumber]);

  const handleDownloadSelected = useCallback(() => {
    if (attachmentFormat === "pdf") {
      handleExportPdf();
      return;
    }
    if (attachmentFormat === "txt") {
      handleExportTxt();
      return;
    }
    handleExportCsv();
  }, [attachmentFormat, handleExportCsv, handleExportPdf, handleExportTxt]);

  const handleSendQuote = useCallback(() => {
    if (demoCtx.stepId === "quote_sent") {
      demoCtx.advance();
    }
  }, [demoCtx]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">
            Draft Quote — {qs.quoteNumber}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Auto-generated from resolved line items — review before sending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Attach as</span>
          <div className="inline-flex items-center border border-border bg-muted/20 p-0.5">
            {ATTACHMENT_FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setAttachmentFormat(format)}
                className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                  attachmentFormat === format
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDownloadSelected}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Download className="h-3 w-3" />
            Download {attachmentFormat.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
            <label className="text-muted-foreground">
              To:{" "}
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className={`ml-1 w-[220px] ${EDITABLE_INLINE_INPUT_CLASS}`}
              />
            </label>
            <label className="text-muted-foreground">
              Company:{" "}
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`ml-1 w-[180px] ${EDITABLE_INLINE_INPUT_CLASS}`}
              />
            </label>
            <label className="text-muted-foreground">
              Due:{" "}
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`ml-1 w-[110px] ${EDITABLE_INLINE_INPUT_CLASS}`}
              />
            </label>
            <label className="text-muted-foreground">
              Terms:{" "}
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className={`ml-1 w-[90px] ${EDITABLE_INLINE_INPUT_CLASS}`}
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2.5 min-w-[220px]">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateRow(item.id, { name: e.target.value })}
                    className={`${EDITABLE_TABLE_INPUT_CLASS} font-medium`}
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[130px]">
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateRow(item.id, { sku: e.target.value })}
                    className={`${EDITABLE_TABLE_INPUT_CLASS} font-mono`}
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[90px]">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={item.qty}
                    onChange={(e) =>
                      updateRow(item.id, { qty: Number(e.target.value) || 0 })
                    }
                    className={`${EDITABLE_TABLE_INPUT_CLASS} text-right tabular-nums`}
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[110px]">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateRow(item.id, {
                        unitPrice: Number(e.target.value) || 0,
                      })
                    }
                    className={`${EDITABLE_TABLE_INPUT_CLASS} text-right tabular-nums`}
                  />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground/85">
                  ${fmt(item.unitPrice * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td colSpan={5} className="px-3 py-3 text-right text-[12px] font-medium text-foreground/70">Subtotal</td>
              <td className="px-3 py-3 text-right text-[14px] font-semibold text-foreground">${fmt(subtotal)}</td>
            </tr>
          </tfoot>
          </table>
        </div>
      </div>

      <div className="border border-border bg-muted/10 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Quote Email Preview</p>

        {attachmentFormat !== "txt" && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm">
            {/* File-type thumbnail */}
            <div className="relative flex h-7 w-[22px] shrink-0 items-end overflow-hidden">
              <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <path d="M0 2C0 0.895 0.895 0 2 0H20L32 12V38C32 39.105 31.105 40 30 40H2C0.895 40 0 39.105 0 38V2Z"
                  className={attachmentFormat === "pdf" ? "fill-red-50 dark:fill-red-950/40" : "fill-emerald-50 dark:fill-emerald-950/40"} />
                <path d="M20 0L32 12H22C20.895 12 20 11.105 20 10V0Z"
                  className={attachmentFormat === "pdf" ? "fill-red-100 dark:fill-red-900/40" : "fill-emerald-100 dark:fill-emerald-900/40"} />
                <path d="M0 2C0 0.895 0.895 0 2 0H20L32 12V38C32 39.105 31.105 40 30 40H2C0.895 40 0 39.105 0 38V2Z"
                  className="stroke-border" strokeWidth="0.75" fill="none" />
                <rect x="0" y="24" width="32" height="16" rx="0" ry="0"
                  className={attachmentFormat === "pdf" ? "fill-red-600" : "fill-emerald-600"} />
                <text x="16" y="35" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">
                  {attachmentFormat.toUpperCase()}
                </text>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-foreground">
                {qs.quoteNumber}.{attachmentFormat}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {rows.length} items &middot; ${fmt(subtotal)}
              </p>
            </div>
          </div>
        )}

        <div className="mb-2">
          <label className="text-[11px] text-muted-foreground">
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`mt-1 w-full ${EDITABLE_INLINE_INPUT_CLASS}`}
            />
          </label>
        </div>
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className={EDITABLE_TEXTAREA_CLASS}
        />

        {attachmentFormat === "txt" && (
          <div className="mt-2 rounded-lg border border-border bg-card p-3 shadow-sm">
            <p className="mb-2 text-[11px] font-medium text-muted-foreground">Quote table (inline)</p>
            <pre className="overflow-x-auto whitespace-pre font-mono text-[10.5px] leading-[1.6] text-foreground/75">{buildTableText()}</pre>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSendQuote}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
        >
          <Send className="h-3.5 w-3.5" />
          Send Quote to Customer
        </button>
        <p className="text-[11px] text-muted-foreground">
          {rows.length} items &middot; ${fmt(subtotal)} &middot; to {toEmail}
        </p>
      </div>
    </div>
  );
}

export function QuoteSentSection({ order, mode, demoCtx }: Props) {
  const qs = order.demoFlow?.quoteSummary;

  const resolvedItems: ResolvedItem[] = useMemo(
    () =>
      order.lineItems
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .filter(
          (item) =>
            item.matchStatus === "confirmed" && item.matchedCatalogItems.length > 0
        )
        .map((item) => ({
          lineItem: item,
          catalogItem: item.matchedCatalogItems[0],
        })),
    [order.lineItems]
  );

  const resolvedCount = resolvedItems.length;
  const totalCount = order.lineItems.length;
  const allResolved = resolvedCount === totalCount;

  if (qs) {
    const isDraft = demoCtx && demoCtx.stepId === "quote_sent" && !qs.sentAt;
    if (isDraft) {
      return <DraftQuoteEditor qs={qs} order={order} demoCtx={demoCtx} />;
    }

    return (
      <div className="space-y-3">
        <QuoteSummaryTable qs={qs} />
        {mode === "active" && (
          <div className="flex items-center gap-2 border border-violet-500/20 bg-violet-500/5 px-4 py-3">
            <Clock className="h-4 w-4 text-violet-600" />
            <p className="text-[12px] text-violet-800">
              Waiting for customer PO in response to{" "}
              <span className="font-mono font-medium">{qs.quoteNumber}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  if (mode === "completed") {
    const quoteNum = order.demoFlow?.quoteNumber;
    return (
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
        </div>
        <p className="text-[12px] font-medium text-emerald-700">
          Quote {quoteNum ? <span className="font-mono">{quoteNum}</span> : ""} prepared for {order.customer.company}
        </p>
      </div>
    );
  }

  return allResolved ? (
    <QuotePanel order={order} resolvedItems={resolvedItems} />
  ) : (
    <p className="text-[12px] text-muted-foreground">
      Resolve all line items to build a quote.
    </p>
  );
}
