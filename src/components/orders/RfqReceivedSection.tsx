"use client";

import { useState, useCallback, useMemo } from "react";
import { CatalogItem, Order } from "@/lib/types";
import { LineItemsPanel } from "../LineItemsPanel";
import { Send, Save } from "lucide-react";
import type { DemoContext } from "../OrderWorkspace";

interface Props {
  order: Order;
  mode: "active" | "completed";
  demoCtx?: DemoContext;
}

function CompletedRfqTable({ order }: { order: Order }) {
  return (
    <div className="space-y-3">
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

  const customerName = order.customer.name.split(" ")[0];
  const defaultBody = useMemo(() => {
    let body = `Hi ${customerName},\n\nThank you for your request (${order.orderNumber}). We need a few clarifications before we can prepare your quote:\n\n`;
    detectedQuestions.forEach((q, i) => {
      body += `${i + 1}. ${q}\n`;
    });
    body += `\nCould you please confirm or provide the missing details?\n\nBest regards,\nHexa Sales Team`;
    return body;
  }, [customerName, order.orderNumber, detectedQuestions]);

  const [emailBody, setEmailBody] = useState(defaultBody);
  const [emailSubject, setEmailSubject] = useState(
    `${order.orderNumber} — Clarification needed for your request`
  );
  const [emailSent, setEmailSent] = useState(false);

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
        />
      </div>

      {detectedQuestions.length > 0 && (
        <div className="space-y-3 border border-amber-500/30 bg-amber-500/5 p-5">
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
