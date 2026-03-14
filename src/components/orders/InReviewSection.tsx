"use client";

import { Order } from "@/lib/types";
import { Check, ArrowRight } from "lucide-react";

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function InReviewSection({ order }: { order: Order }) {
  const totalCount = order.lineItems.length;

  const poNum = order.demoFlow?.poConfirmation?.poNumber ?? order.poNumber;
  const quoteNum = order.demoFlow?.quoteNumber;
  const hasPOMatch = order.demoFlow?.quoteComparison?.overallMatch;
  const qs = order.demoFlow?.quoteSummary;

  return (
    <div className="space-y-4">
      {poNum && hasPOMatch && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
            <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
          </div>
          <p className="text-[12px] font-medium text-emerald-700">
            <span className="font-mono">{poNum}</span> confirmed
            {quoteNum && (
              <> against <span className="font-mono">{quoteNum}</span></>
            )}
            {" "}— {totalCount} items ready for final review
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          Items: <span className="font-medium text-foreground/85">{totalCount}</span>
        </span>
        {order.dueDate && (
          <span>
            Due: <span className="font-medium text-foreground/85">{order.dueDate}</span>
          </span>
        )}
        {order.paymentTerms && (
          <span>
            Payment: <span className="font-medium text-foreground/85">{order.paymentTerms}</span>
          </span>
        )}
        {order.shipVia && (
          <span>
            Ship Via: <span className="font-medium text-foreground/85">{order.shipVia}</span>
          </span>
        )}
      </div>

      {qs ? (
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
      ) : (
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
              {order.lineItems.map((item, i) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
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
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Push to MRP
        </button>
        <p className="text-[11px] text-muted-foreground">
          Review items and push to MRP when ready
        </p>
      </div>
    </div>
  );
}
