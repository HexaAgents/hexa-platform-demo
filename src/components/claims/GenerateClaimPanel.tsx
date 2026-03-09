"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  FileText,
  Table2,
  Copy,
  Download,
  Paperclip,
  Send,
} from "lucide-react";
import { metricLabels, eventTypeLabels } from "@/data/sla-data";
import type { CreditOpportunity } from "@/data/sla-data";
import type { Supplier } from "@/data/sla-data";

type FormatTab = "email" | "pdf" | "csv";

const FORMAT_TABS: { id: FormatTab; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Text Email", icon: Mail },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "csv", label: "CSV", icon: Table2 },
];

interface GenerateClaimPanelProps {
  opp: CreditOpportunity;
  supplier: Supplier;
  disabled?: boolean;
}

const defaultFrom = "procurement@hexamfg.com";

export default function GenerateClaimPanel({
  opp,
  supplier,
  disabled = false,
}: GenerateClaimPanelProps) {
  const [activeTab, setActiveTab] = useState<FormatTab>("email");
  const [copied, setCopied] = useState(false);

  const defaultSubject = `SLA Credit Claim – ${supplier.name} – ${opp.poNumber} – ${metricLabels[opp.metric]}`;
  const defaultBody = `Dear ${supplier.name} Team,

We are writing regarding a breach of SLA terms under our current supply agreement.

Order Reference: ${opp.poNumber}
Item: ${opp.item}
Invoice Value: £${opp.invoiceValue.toLocaleString()}

Breach Details:
${opp.breachSummary}

SLA Rule: ${opp.ruleDescription}

Credit Amount Claimed: £${opp.creditAmount.toLocaleString()}

Supporting Evidence:
${opp.timeline
  .filter((e) => e.evidenceUrl)
  .map((e) => `- ${eventTypeLabels[e.type]}: ${e.evidenceUrl}`)
  .join("\n")}

We request that a credit note for £${opp.creditAmount.toLocaleString()} be issued within 14 business days.

Please acknowledge receipt of this claim and advise on next steps.

Best regards,
Hexa Procurement Team`;

  const [toEmail, setToEmail] = useState(supplier.email);
  const [fromEmail, setFromEmail] = useState(defaultFrom);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  useEffect(() => {
    setToEmail(supplier.email);
    setSubject(defaultSubject);
    setBody(defaultBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp.id, supplier.id]);

  const evidenceList = opp.timeline.filter((e) => e.evidenceUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoLinkForEmail = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailtoLinkForAttachment = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    "Please find the claim document attached. Download the file using the button below, then attach it to this email before sending."
  )}`;

  const handleSendEmail = () => {
    const link = activeTab === "email" ? mailtoLinkForEmail : mailtoLinkForAttachment;
    window.location.href = link;
  };

  const handleDownloadCSV = () => {
    const headers = ["Field", "Value"];
    const rows = [
      ["PO Number", opp.poNumber],
      ["Supplier", supplier.name],
      ["Item", opp.item],
      ["Metric", metricLabels[opp.metric]],
      ["Breach Margin", opp.breachMargin],
      ["Credit Amount", `£${opp.creditAmount.toLocaleString()}`],
      ["Invoice Value", `£${opp.invoiceValue.toLocaleString()}`],
      ["Qty Ordered", opp.qtyOrdered.toString()],
      ["Qty Received", opp.qtyReceived.toString()],
      ["Breach Summary", opp.breachSummary],
      ["Rule", opp.ruleDescription],
      ["Detected", new Date(opp.createdAt).toLocaleDateString("en-GB")],
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map(([k, v]) => `"${String(k).replace(/"/g, '""')}","${String(v).replace(/"/g, '""')}"`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim-${opp.poNumber}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const textContent = `SLA Credit Claim\n\n${subject}\n\n${body}`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim-${opp.poNumber}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-border bg-card p-4 shadow-sm">
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Generate Claim
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
              disabled={disabled}
              className={`-mb-px flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-foreground bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Email preview — editable */}
      <div className="border border-t-0 border-border bg-card">
        <div className="space-y-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-10 shrink-0 text-right text-muted-foreground">To</span>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              disabled={disabled}
              className="flex-1 min-w-0 rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-10 shrink-0 text-right text-muted-foreground">From</span>
            <input
              type="text"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              disabled={disabled}
              className="flex-1 min-w-0 rounded border border-border bg-background px-2 py-1 text-[12px] text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-10 shrink-0 text-right text-muted-foreground">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={disabled}
              className="flex-1 min-w-0 rounded border border-border bg-background px-2 py-1 text-[12px] font-medium text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Body content by tab */}
        <div className="px-4 py-3 text-[12px] leading-relaxed text-foreground/75">
          {activeTab === "email" ? (
            <>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={disabled}
                rows={12}
                className="w-full min-w-0 resize-y rounded border border-border bg-background px-3 py-2 font-sans text-[12px] leading-relaxed text-foreground/85 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Email body..."
              />
              {evidenceList.length > 0 && (
                <div className="mt-3 flex items-center gap-2 border border-dashed border-border bg-muted/20 px-3 py-2">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-[11px]">
                    {evidenceList.length} evidence document{evidenceList.length !== 1 ? "s" : ""} attached
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 border border-dashed border-border bg-muted/20 px-3 py-2">
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="text-[11px]">
                <span className="font-medium text-foreground/85">
                  claim-{opp.poNumber}.{activeTab}
                </span>
                <span className="ml-2 text-muted-foreground">
                  £{opp.creditAmount.toLocaleString()} credit · {metricLabels[opp.metric]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons — Send Email for all + format-specific */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-[12px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          Send Email
        </button>
        {activeTab === "email" && (
          <button
            type="button"
            onClick={handleCopy}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[12px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
        {(activeTab === "pdf" || activeTab === "csv") && (
          <button
            type="button"
            onClick={activeTab === "pdf" ? handleDownloadPDF : handleDownloadCSV}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-[12px] font-medium text-foreground/70 transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download {activeTab.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}
