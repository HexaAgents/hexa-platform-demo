"use client";

import { useState, useCallback, useMemo } from "react";
import { CatalogItem, Order } from "@/lib/types";
import { QuotePanel, ResolvedItem } from "../QuotePanel";
import { CheckCircle2, Clock, Send, FileText, Download } from "lucide-react";
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
  const handleSendQuote = useCallback(() => {
    if (demoCtx.stepId === "quote_sent") {
      demoCtx.advance();
    }
  }, [demoCtx]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-violet-600" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Draft Quote — {qs.quoteNumber}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Auto-generated from resolved line items — review before sending
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <Download className="h-3 w-3" />
          Export CSV
        </button>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
            <span className="text-muted-foreground">
              To: <span className="font-medium text-foreground/85">{qs.sentTo}</span>
            </span>
            <span className="text-muted-foreground">
              Company: <span className="font-medium text-foreground/85">{order.customer.company}</span>
            </span>
            {order.dueDate && (
              <span className="text-muted-foreground">
                Due: <span className="font-medium text-foreground/85">{order.dueDate}</span>
              </span>
            )}
            {order.paymentTerms && (
              <span className="text-muted-foreground">
                Terms: <span className="font-medium text-foreground/85">{order.paymentTerms ?? "Net 30"}</span>
              </span>
            )}
          </div>
        </div>

        <table className="w-full text-[12px]">
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
            {qs.items.map((item, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2.5 font-medium text-foreground/85">{item.name}</td>
                <td className="px-3 py-2.5 font-mono text-foreground/70">{item.sku}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-foreground/70">{item.qty}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-foreground/70">${item.unitPrice.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground/85">${fmt(item.unitPrice * item.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td colSpan={5} className="px-3 py-3 text-right text-[12px] font-medium text-foreground/70">Subtotal</td>
              <td className="px-3 py-3 text-right text-[14px] font-semibold text-foreground">${fmt(qs.subtotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border border-border bg-muted/10 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Quote Email Preview</p>
        <div className="text-[12px] text-foreground/75 leading-relaxed space-y-2">
          <p>Dear {order.customer.name.split(" ")[0]},</p>
          <p>
            Please find attached our quotation <span className="font-mono font-medium">{qs.quoteNumber}</span> for
            {" "}{qs.items.length} items totaling <span className="font-medium">${fmt(qs.subtotal)}</span>.
          </p>
          <p>This quote is valid for 14 days. Please reply with a PO to confirm.</p>
          <p className="text-muted-foreground">Best regards, Hexa Sales Team</p>
        </div>
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
          {qs.items.length} items &middot; ${fmt(qs.subtotal)} &middot; to {qs.sentTo}
        </p>
      </div>
    </div>
  );
}

export function QuoteSentSection({ order, mode, demoCtx }: Props) {
  const qs = order.demoFlow?.quoteSummary;

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

  const resolvedItems: ResolvedItem[] = useMemo(
    () =>
      order.lineItems
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .filter((item) => resolutions[item.id])
        .map((item) => ({
          lineItem: item,
          catalogItem: resolutions[item.id],
        })),
    [order.lineItems, resolutions]
  );

  const resolvedCount = Object.keys(resolutions).length;
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
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
