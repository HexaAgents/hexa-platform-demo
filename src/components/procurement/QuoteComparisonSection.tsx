"use client";

import { BarChart3, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SupplierQuote, Supplier, SupplierItemHistory } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

interface QuoteComparisonSectionProps {
  quotes: (SupplierQuote & { supplier: Supplier })[];
  supplierHistories: (SupplierItemHistory & { supplier: Supplier })[];
  selectedQuoteId: string | null;
  onSelectQuote: (id: string) => void;
  isReadOnly?: boolean;
}

export default function QuoteComparisonSection({
  quotes,
  supplierHistories,
  selectedQuoteId,
  onSelectQuote,
  isReadOnly = false,
}: QuoteComparisonSectionProps) {
  const lowestPrice = Math.min(...quotes.map((q) => q.unitPrice));
  const shortestLead = Math.min(...quotes.map((q) => q.leadTimeDays));

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <BarChart3 className="h-4 w-4 text-foreground/70" />
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Compare Quotes</h3>
          <p className="text-[11px] text-muted-foreground">
            {quotes.length} quote{quotes.length !== 1 ? "s" : ""} received{isReadOnly ? "" : " — select the best option"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground w-8" />
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Supplier</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Unit Price</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Total</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Lead Time</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">MOQ</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Terms</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Reliability</th>
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">Valid Until</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((quote) => {
              const isSelected = selectedQuoteId === quote.id;
              const history = supplierHistories.find((h) => h.supplierId === quote.supplierId);
              const isBestPrice = quote.unitPrice === lowestPrice;
              const isFastest = quote.leadTimeDays === shortestLead;

              return (
                <tr
                  key={quote.id}
                  onClick={isReadOnly ? undefined : () => onSelectQuote(quote.id)}
                  className={cn(
                    "transition-colors",
                    isReadOnly
                      ? isSelected ? "bg-emerald-500/5 border-l-2 border-l-emerald-500" : ""
                      : cn("cursor-pointer", isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-accent/30")
                  )}
                >
                  <td className="px-5 py-3">
                    {isReadOnly ? (
                      isSelected ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] px-1.5 py-0">
                          Selected
                        </Badge>
                      ) : null
                    ) : (
                      <div className={cn(
                        "h-4 w-4 rounded-none border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-foreground/85">{quote.supplier.name}</p>
                    {quote.notes && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground max-w-[200px] truncate">{quote.notes}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("text-[13px] font-medium tabular-nums", isBestPrice && "text-emerald-700")}>
                      ${quote.unitPrice.toFixed(2)}
                    </span>
                    {isBestPrice && (
                      <Badge variant="outline" className="ml-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] px-1 py-0">
                        Best
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[13px] font-medium tabular-nums text-foreground/70">
                      ${quote.totalPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn("text-[13px] font-medium tabular-nums", isFastest && "text-emerald-700")}>
                      {quote.leadTimeDays}d
                    </span>
                    {isFastest && (
                      <Badge variant="outline" className="ml-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] px-1 py-0">
                        Fastest
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-[13px] text-foreground/70 tabular-nums">{quote.moq.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[12px] text-foreground/70">{quote.paymentTerms}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {history ? (
                      <span className={cn(
                        "text-[13px] font-medium tabular-nums",
                        history.reliabilityScore >= 90 ? "text-emerald-700" :
                        history.reliabilityScore >= 75 ? "text-foreground/70" : "text-amber-700"
                      )}>
                        {history.reliabilityScore}%
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[12px] text-muted-foreground">
                      {new Date(quote.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
