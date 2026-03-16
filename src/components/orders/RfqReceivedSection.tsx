"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { CatalogItem, Order } from "@/lib/types";
import { LineItemsPanel } from "../LineItemsPanel";
import { Send, Save, Phone, ExternalLink } from "lucide-react";
import type { DemoContext } from "../OrderWorkspace";

interface Props {
  order: Order;
  mode: "active" | "completed";
  demoCtx?: DemoContext;
}

function toCustomerQuestion(rawIssue: string): string {
  if (rawIssue.includes("No SKU provided — diameter not specified")) {
    return "Could you please confirm the required diameter for this item so we can match it to the correct product in our range?";
  }
  if (rawIssue.includes("Multiple sizes available")) {
    const options = rawIssue.match(/\(([^)]+)\)/)?.[1];
    return options
      ? `We have this available in several sizes (${options}). Which size would you like us to include in your quote?`
      : "This item comes in multiple sizes — could you let us know which size you need?";
  }
  if (rawIssue.includes("bore size unclear")) {
    return "We offer both the 25mm and 30mm bore options for this collar. Could you confirm which bore size you require?";
  }
  if (rawIssue.includes("Price differs between options")) {
    return "The pricing varies depending on which variant you go with. Could you let us know your preference so we can quote accurately?";
  }
  if (rawIssue.includes("Manual review required to resolve conflict")) {
    return "We'd like to make sure we quote the right specification for this line. Could you confirm the exact part or spec you need?";
  }
  if (rawIssue.includes("No matching item found in product catalog")) {
    return "We weren't able to find an exact match for this item in our catalogue. Could you share a drawing, part number, or any additional specifications?";
  }
  if (rawIssue.includes("Material and dimensions not specified")) {
    return "Could you let us know the required material and dimensions so we can source this correctly?";
  }
  if (rawIssue.includes("non-standard part")) {
    return "This appears to be a custom or non-standard part. Would you like us to quote it as a bespoke fabrication item?";
  }
  if (rawIssue.startsWith("Missing order fields:")) {
    return "Could you confirm your target delivery date and any budget expectations so we can finalise the quote?";
  }
  if (rawIssue.includes("standard length") || rawIssue.includes("extended length")) {
    return "We stock both the standard and extended-length variants of this bearing. Could you confirm which version you need?";
  }
  if (rawIssue.includes("Confirm bearing length")) {
    return "Just to make sure we quote the right part — do you need the standard-length or extended-length version?";
  }
  return `Could you help us clarify the following so we can finalise your quote: ${rawIssue}`;
}

function CallTranscriptLink({ order }: { order: Order }) {
  if (order.source !== "phone") return null;
  const callId = order.id.replace("ord-", "");
  return (
    <Link
      href={`/calls/${callId}`}
      className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      <Phone size={13} />
      View Call Transcript
      <ExternalLink size={11} className="text-primary/60" />
    </Link>
  );
}

function CompletedRfqTable({ order }: { order: Order }) {
  return (
    <div className="space-y-3">
      <CallTranscriptLink order={order} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          Parse Confidence:{" "}
          <span className="font-medium text-foreground/85">
            {order.parseConfidence ?? 0}%
          </span>
        </span>
        {order.dueDate && (
          <span>
            Due Date:{" "}
            <span className="font-medium text-foreground/85">
              {order.dueDate}
            </span>
          </span>
        )}
        {order.shipVia && (
          <span>
            Ship Via:{" "}
            <span className="font-medium text-foreground/85">
              {order.shipVia}
            </span>
          </span>
        )}
        {order.paymentTerms && (
          <span>
            Payment Terms:{" "}
            <span className="font-medium text-foreground/85">
              {order.paymentTerms}
            </span>
          </span>
        )}
      </div>

      <div className="border border-border">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {order.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 text-muted-foreground">{item.lineNumber}</td>
                <td className="px-3 py-2 font-medium text-foreground/85">{item.parsedProductName}</td>
                <td className="px-3 py-2 font-mono text-foreground/70">{item.parsedSku ?? "—"}</td>
                <td className="px-3 py-2 text-right text-foreground/70">{item.parsedQuantity} {item.parsedUom}</td>
                <td className="px-3 py-2 text-right text-foreground/70">
                  {item.parsedUnitPrice != null ? `$${item.parsedUnitPrice.toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RfqReceivedSection({ order, mode, demoCtx }: Props) {
  const [resolutions, setResolutions] = useState<Record<string, CatalogItem>>(
    () => {
      const initial: Record<string, CatalogItem> = {};
      for (const item of order.lineItems) {
        if (
          item.matchStatus === "confirmed" &&
          item.matchedCatalogItems.length > 0
        ) {
          initial[item.id] = item.matchedCatalogItems[0];
        }
      }
      return initial;
    }
  );

  const handleResolve = useCallback(
    (lineItemId: string, catalogItem: CatalogItem) => {
      setResolutions((prev) => ({ ...prev, [lineItemId]: catalogItem }));
    },
    []
  );

  const resolvedCount = Object.keys(resolutions).length;
  const totalCount = order.lineItems.length;
  const allResolved = resolvedCount === totalCount;
  const issueItems = order.lineItems.filter(
    (i) => i.matchStatus !== "confirmed"
  );

  const detectedQuestions = useMemo(() => {
    const qs: string[] = [];
    for (const item of issueItems) {
      for (const issue of item.issues) {
        qs.push(`Line ${item.lineNumber} (${item.parsedProductName}): ${issue}`);
      }
    }
    if (order.parseMissingFields && order.parseMissingFields.length > 0) {
      qs.push(
        `Missing order fields: ${order.parseMissingFields.join(", ")}`
      );
    }
    return qs;
  }, [issueItems, order.parseMissingFields]);

  const emailQuestions = useMemo(() => {
    return detectedQuestions.map((question) => {
      if (question.startsWith("Missing order fields:")) {
        return toCustomerQuestion(question);
      }

      const linePrefixMatch = question.match(/^Line \d+ \([^)]+\):\s*/);
      const linePrefix = linePrefixMatch?.[0] ?? "";
      const rawIssue = question.replace(/^Line \d+ \([^)]+\):\s*/, "");
      return `${linePrefix}${toCustomerQuestion(rawIssue)}`;
    });
  }, [detectedQuestions]);

  const customerName = order.customer.name.split(" ")[0];
  const isPhoneSource = order.source === "phone";
  const defaultBody = useMemo(() => {
    const greeting = `Dear ${customerName},`;
    const intro = isPhoneSource
      ? `Thank you for your call earlier regarding your requirements. We're putting your quote together now, but just need to quickly clarify one detail before we can finalise everything:`
      : `Thank you for your enquiry (ref: ${order.orderNumber}). We're reviewing your requirements and just need to clarify a few details before we can prepare your formal quotation:`;

    let body = `${greeting}\n\n${intro}\n\n`;
    emailQuestions.forEach((q, i) => {
      body += `${i + 1}. ${q}\n`;
    });
    body += `\nOnce we have your confirmation, we'll have the quote across to you promptly.\n\nIf you have any questions in the meantime, please don't hesitate to get in touch.\n\nKind regards,\nJames Morrison\nSales Team`;
    return body;
  }, [customerName, order.orderNumber, emailQuestions, isPhoneSource]);

  const [emailBody, setEmailBody] = useState(defaultBody);
  const [emailSubject, setEmailSubject] = useState(
    `${order.orderNumber} — Quick clarification needed before we finalise your quote`
  );
  const [emailSent, setEmailSent] = useState(false);
  const [clarificationAddedIds, setClarificationAddedIds] = useState<Set<string>>(new Set());

  const handleAddClarification = useCallback(
    (lineItemId: string, question: string) => {
      setClarificationAddedIds((prev) => {
        const next = new Set(prev);
        next.add(lineItemId);
        return next;
      });
      setEmailBody((prev) => {
        const lines = prev.split("\n");
        let lastNumberedIdx = -1;
        let highestNumber = 0;
        for (let i = 0; i < lines.length; i++) {
          const match = lines[i].match(/^(\d+)\.\s/);
          if (match) {
            lastNumberedIdx = i;
            highestNumber = Math.max(highestNumber, parseInt(match[1], 10));
          }
        }
        const newLine = `${highestNumber + 1}. ${question}`;
        if (lastNumberedIdx !== -1) {
          lines.splice(lastNumberedIdx + 1, 0, newLine);
          return lines.join("\n");
        }
        const signoffIdx = lines.findIndex((l) =>
          l.startsWith("Could you please confirm")
        );
        if (signoffIdx !== -1) {
          lines.splice(signoffIdx, 0, `${newLine}\n`);
          return lines.join("\n");
        }
        return prev + `\n${newLine}`;
      });
    },
    []
  );

  const handleSendClarification = useCallback(() => {
    setEmailSent(true);
    if (demoCtx && demoCtx.stepId === "clarification_sent") {
      demoCtx.advance();
    }
  }, [demoCtx]);

  if (mode === "completed") {
    return <CompletedRfqTable order={order} />;
  }

  return (
    <div className="space-y-4">
      <CallTranscriptLink order={order} />
      <div className="border border-border bg-muted/20 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-muted-foreground">
          <span>
            Parse Confidence:{" "}
            <span className="font-medium text-foreground/85">
              {order.parseConfidence ?? 0}%
            </span>
          </span>
          <span>
            Due Date:{" "}
            <span className="font-medium text-foreground/85">
              {order.dueDate || "Not parsed"}
            </span>
          </span>
          <span>
            Ship Via:{" "}
            <span className="font-medium text-foreground/85">
              {order.shipVia || "Not parsed"}
            </span>
          </span>
          <span>
            Payment Terms:{" "}
            <span className="font-medium text-foreground/85">
              {order.paymentTerms || "Not parsed"}
            </span>
          </span>
        </div>
        {order.parseMissingFields && order.parseMissingFields.length > 0 && (
          <p className="mt-1.5 text-[12px] text-amber-700">
            Missing fields: {order.parseMissingFields.join(", ")}
          </p>
        )}
      </div>

      {resolvedCount < totalCount && (
        <div className="flex items-center gap-4 border border-border bg-card px-4 py-3">
          <div className="h-1.5 flex-1 overflow-hidden bg-muted">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${(resolvedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-[12px] font-medium text-muted-foreground">
            {resolvedCount} of {totalCount} resolved
          </span>
        </div>
      )}

      <div className="border border-border bg-card p-5">
        <LineItemsPanel
          items={order.lineItems}
          resolutions={resolutions}
          onResolve={handleResolve}
          onAddClarification={handleAddClarification}
          clarificationAddedIds={clarificationAddedIds}
        />
      </div>

      {(detectedQuestions.length > 0 || clarificationAddedIds.size > 0) && (
        <div className="space-y-3 border border-border bg-muted/20 p-5">
          <h4 className="text-[12px] font-semibold uppercase tracking-wide text-amber-800">
            Clarification Questions Detected ({detectedQuestions.length})
          </h4>
          <ul className="space-y-1.5">
            {detectedQuestions.map((q, i) => (
              <li
                key={i}
                className="flex gap-2 text-[12px] text-amber-800/80"
              >
                <span className="shrink-0 font-medium">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border border-amber-500/20 bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Draft Clarification Email
            </p>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
              placeholder="Subject"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={8}
              className="w-full border border-border bg-background px-2.5 py-1.5 text-[12px]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendClarification}
                disabled={emailSent}
                className="inline-flex items-center gap-2 bg-foreground px-3 py-2 text-[12px] font-medium text-background hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {emailSent ? "Sent" : "Send to Customer"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[12px] font-medium text-foreground/70 hover:bg-accent/60"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
