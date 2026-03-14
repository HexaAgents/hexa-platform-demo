"use client";

import { useState } from "react";
import { Order, LineItem, CatalogItem } from "@/lib/types";
import {
  Send,
  FileText,
  Table2,
  Mail,
  Paperclip,
  Check,
  Download,
} from "lucide-react";

export interface ResolvedItem {
  lineItem: LineItem;
  catalogItem: CatalogItem;
}

type FormatTab = "email" | "pdf" | "csv";
type AttachmentFormat = "pdf" | "txt" | "csv";
interface EditableQuoteRow {
  id: string;
  name: string;
  sku: string;
  qty: number;
  uom: string;
  unitPrice: number;
}

const FORMAT_TABS: { id: FormatTab; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "In Email", icon: Mail },
  { id: "pdf", label: "PDF Attachment", icon: FileText },
  { id: "csv", label: "CSV Attachment", icon: Table2 },
];
const ATTACHMENT_FORMATS: AttachmentFormat[] = ["pdf", "txt", "csv"];
const EDITABLE_INLINE_INPUT_CLASS =
  "min-w-0 border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-5 text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";
const EDITABLE_TABLE_INPUT_CLASS =
  "min-w-0 w-full border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-5 text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";
const EDITABLE_TEXTAREA_CLASS =
  "min-h-[170px] w-full border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-relaxed text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none";

function escCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function QuotePanel({
  order,
  resolvedItems,
}: {
  order: Order;
  resolvedItems: ResolvedItem[];
}) {
  const [activeTab, setActiveTab] = useState<FormatTab>("email");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const customerFirstName = order.customer.name.split(" ")[0];
  const quoteNumber = order.orderNumber.replace("ORD", "Q");
  const defaultSubject = `${quoteNumber} — ${order.customer.company}`;
  const [toEmail, setToEmail] = useState(order.customer.email);
  const [fromEmail, setFromEmail] = useState("sales@hexa-orders.com");
  const [subject, setSubject] = useState(defaultSubject);
  const [attachmentFormat, setAttachmentFormat] = useState<AttachmentFormat>("pdf");
  const [emailBody, setEmailBody] = useState(
    [
      `Dear ${customerFirstName},`,
      "",
      `Thank you for your order request (${order.orderNumber}). Please review the quote details below:`,
      "This quote is valid for 30 days from the date of issue.",
      "If you'd like to proceed or have any questions, please don't hesitate to reply.",
      "",
      "Best regards,",
      "Hexa Sales Team",
    ].join("\n")
  );
  const [rows, setRows] = useState<EditableQuoteRow[]>(
    resolvedItems.map(({ lineItem, catalogItem }) => ({
      id: lineItem.id,
      name: catalogItem.catalogName,
      sku: catalogItem.catalogSku,
      qty: lineItem.parsedQuantity,
      uom: lineItem.parsedUom,
      unitPrice: catalogItem.catalogPrice,
    }))
  );

  const subtotal = rows.reduce((sum, row) => sum + row.unitPrice * row.qty, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  const updateRow = (rowId: string, patch: Partial<EditableQuoteRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    );
  };

  const buildTableText = () => {
    const header = "Product | SKU | Qty | Unit Price | Line Total";
    const divider = "-".repeat(header.length);
    const lines = rows.map(
      (item) =>
        `${item.name} | ${item.sku} | ${item.qty} ${item.uom} | $${item.unitPrice.toFixed(2)} | $${fmt(item.qty * item.unitPrice)}`
    );
    return [header, divider, ...lines, "", `Subtotal: $${fmt(subtotal)}`].join("\n");
  };

  const buildCsv = () => {
    const csvRows = [
      ["Product", "SKU", "Qty", "UOM", "Unit Price", "Line Total"].join(","),
      ...rows.map((item) =>
        [
          escCsv(item.name),
          escCsv(item.sku),
          item.qty.toString(),
          escCsv(item.uom),
          item.unitPrice.toFixed(2),
          (item.qty * item.unitPrice).toFixed(2),
        ].join(",")
      ),
      ["", "", "", "", "Subtotal", subtotal.toFixed(2)].join(","),
    ];
    return csvRows.join("\n");
  };

  const downloadTextFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    downloadTextFile(`${quoteNumber}.csv`, buildCsv(), "text/csv;charset=utf-8");
  };

  const handleExportTxt = () => {
    downloadTextFile(
      `${quoteNumber}.txt`,
      buildTableText(),
      "text/plain;charset=utf-8"
    );
  };

  const handleExportPdf = () => {
    const printable = window.open("", "_blank");
    if (!printable) return;

    const tableText = buildTableText();
    printable.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(quoteNumber)} Table Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 18px; margin: 0 0 16px; }
            pre { white-space: pre-wrap; font-size: 12px; line-height: 1.5; border: 1px solid #ddd; padding: 12px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(quoteNumber)} - Table Export</h1>
          <pre>${escapeHtml(tableText)}</pre>
        </body>
      </html>`);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  const handleDownloadSelected = () => {
    if (attachmentFormat === "pdf") {
      handleExportPdf();
      return;
    }
    if (attachmentFormat === "txt") {
      handleExportTxt();
      return;
    }
    handleExportCsv();
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 border border-emerald-500/30 bg-card shadow-sm duration-400">
      {/* ── Success header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-emerald-800">
            Quote Ready
          </h3>
          <p className="text-[12px] text-emerald-700/70">
            All {resolvedItems.length} items matched and resolved
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* ── Quote summary table ────────────────────────────────────── */}
        <div>
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Quote Summary
          </h4>
          <div className="border border-border overflow-x-auto">
            <table className="min-w-[900px] w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 min-w-[240px]">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        className={`${EDITABLE_TABLE_INPUT_CLASS} font-medium`}
                      />
                    </td>
                    <td className="px-3 py-2 min-w-[150px]">
                      <input
                        type="text"
                        value={row.sku}
                        onChange={(e) => updateRow(row.id, { sku: e.target.value })}
                        className={`${EDITABLE_TABLE_INPUT_CLASS} font-mono`}
                      />
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={row.qty}
                          onChange={(e) =>
                            updateRow(row.id, { qty: Number(e.target.value) || 0 })
                          }
                          className={`${EDITABLE_TABLE_INPUT_CLASS} text-right`}
                        />
                        <input
                          type="text"
                          value={row.uom}
                          onChange={(e) => updateRow(row.id, { uom: e.target.value })}
                          className="w-20 border-0 border-b border-transparent bg-transparent px-1.5 py-1 text-[12px] leading-5 text-foreground/85 transition-colors focus:border-border focus:bg-background/30 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 min-w-[120px]">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={row.unitPrice}
                        onChange={(e) =>
                          updateRow(row.id, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                        className={`${EDITABLE_TABLE_INPUT_CLASS} text-right`}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-foreground/85">
                      ${fmt(row.unitPrice * row.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td
                    colSpan={5}
                    className="px-3 py-2.5 text-right text-[12px] font-medium text-foreground/70"
                  >
                    Subtotal
                  </td>
                  <td className="px-3 py-2.5 text-right text-[13px] font-semibold text-foreground">
                    ${fmt(subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Email template section ─────────────────────────────────── */}
        <div>
          <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Email Preview
          </h4>

          {/* Format tabs */}
          <div className="flex border-b border-border bg-muted/30">
            {FORMAT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium transition-colors ${
                    isActive
                      ? "border-b-2 border-foreground bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Email preview card */}
          <div className="border border-t-0 border-border bg-card">
            {/* Email headers — editable across all 3 format tabs */}
            <div className="space-y-2 border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">To</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className={`min-w-0 flex-1 ${EDITABLE_INLINE_INPUT_CLASS}`}
                />
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">From</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className={`min-w-0 flex-1 ${EDITABLE_INLINE_INPUT_CLASS}`}
                />
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <label className="w-12 shrink-0 text-right text-muted-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`min-w-0 flex-1 font-medium ${EDITABLE_INLINE_INPUT_CLASS}`}
                />
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-5 text-[12px] leading-relaxed text-foreground/75">
              <label className="mb-3 block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Email Body
                </span>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className={EDITABLE_TEXTAREA_CLASS}
                />
              </label>

              {/* Inline table for "In Email" tab */}
              {activeTab === "email" && (
                <div className="my-4 border border-border">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">
                          Product
                        </th>
                        <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">
                          SKU
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Qty
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Unit Price
                        </th>
                        <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-2.5 py-1.5 text-foreground/80">
                            {row.name}
                          </td>
                          <td className="px-2.5 py-1.5 font-mono text-muted-foreground">
                            {row.sku}
                          </td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">
                            {row.qty} {row.uom}
                          </td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">
                            ${row.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-2.5 py-1.5 text-right font-medium text-foreground/80">
                            ${fmt(row.unitPrice * row.qty)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td
                          colSpan={4}
                          className="px-2.5 py-1.5 text-right font-medium"
                        >
                          Subtotal
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-semibold">
                          ${fmt(subtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Attachment indicator for PDF / CSV tabs */}
              {(activeTab === "pdf" || activeTab === "csv") && (
                <div className="my-4 flex items-center gap-2.5 border border-dashed border-border bg-muted/20 px-3.5 py-3">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-[12px]">
                    <span className="font-medium text-foreground/85">
                      {quoteNumber}.{attachmentFormat}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {rows.length} items &mdash; ${fmt(subtotal)}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] text-muted-foreground">
                Preview updates as you edit headers, table fields, and email body.
              </p>
            </div>
          </div>
        </div>

        {/* ── Action buttons ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {!sent ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                  Sending&hellip;
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Quote
                </>
              )}
            </button>
          ) : (
            <div className="animate-in fade-in-0 inline-flex items-center gap-2 bg-emerald-600 px-5 py-2.5 text-[13px] font-medium text-white duration-300">
              <Check className="h-3.5 w-3.5" />
              Quote Sent
            </div>
          )}

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
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download {attachmentFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
