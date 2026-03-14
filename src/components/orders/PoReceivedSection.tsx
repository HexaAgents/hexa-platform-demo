"use client";

import { Order, ComparisonField } from "@/lib/types";
import { Check, AlertTriangle, FileCheck, FileText } from "lucide-react";
import { PoQuoteComparisonPanel } from "./PoQuoteComparisonPanel";
import type { DemoContext } from "../OrderWorkspace";

interface Props {
  order: Order;
  mode: "active" | "completed";
  demoCtx?: DemoContext;
}

const FIELD_LABEL: Record<ComparisonField, string> = {
  price: "Price",
  quantity: "Quantity",
  dueDate: "Due Date",
  drawingRev: "Drawing Rev",
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function PoReceivedSection({ order, mode, demoCtx }: Props) {
  const flow = order.demoFlow;
  const poConf = flow?.poConfirmation;
  const comparison = flow?.quoteComparison;
  const hasMismatch = comparison ? !comparison.overallMatch : false;

  const poNumber =
    poConf?.poNumber ?? flow?.poNumber ?? order.poNumber ?? "PO";
  const quoteNumber = flow?.quoteNumber ?? "Quote";

  if (mode === "active") {
    return <PoQuoteComparisonPanel order={order} demoCtx={demoCtx} />;
  }

  if (!comparison) {
    return (
      <div className="flex items-center gap-2 border border-border bg-card px-4 py-3">
        <FileText className="h-4 w-4 text-foreground/50" />
        <p className="text-[12px] font-medium text-foreground/70">
          <span className="font-mono">{poNumber}</span> received
          {poConf?.receivedAt && (
            <span className="text-muted-foreground">
              {" "}on {new Date(poConf.receivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </p>
      </div>
    );
  }

  const qs = flow?.quoteSummary;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <FileCheck className="h-4 w-4 text-emerald-600" />
        <p className="text-[12px] font-medium text-emerald-700">
          <span className="font-mono">{poNumber}</span>{" "}
          {hasMismatch ? "has discrepancies against" : "confirmed against"}{" "}
          <span className="font-mono">{quoteNumber}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        {comparison.checks.map((check) => (
          <div
            key={check.field}
            className="flex items-center gap-2 text-[12px]"
          >
            {check.matches ? (
              <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                <Check className="h-2 w-2 text-emerald-600" strokeWidth={3} />
              </div>
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            )}
            <span className="font-medium text-foreground/85">
              {FIELD_LABEL[check.field]}
            </span>
            {!check.matches && (
              <span className="text-muted-foreground">
                — Quote: {check.quoteValue}, PO: {check.incomingValue}
              </span>
            )}
          </div>
        ))}
      </div>

      {qs && !hasMismatch && (
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
      )}

      {hasMismatch && flow?.correctionDraftEmail && (
        <div className="border border-border bg-muted/20 p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Correction email sent to {flow.correctionDraftEmail.to}
          </p>
          <p className="mt-1 text-[12px] text-foreground/70">
            {flow.correctionDraftEmail.subject}
          </p>
        </div>
      )}
    </div>
  );
}
