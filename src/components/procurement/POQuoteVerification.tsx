"use client";

import { Check, FileCheck } from "lucide-react";
import type { PurchaseOrder, SupplierQuote, Supplier } from "@/lib/procurement-types";

interface POQuoteVerificationProps {
  po: PurchaseOrder & { supplier: Supplier };
  quote: SupplierQuote & { supplier: Supplier };
}

interface VerificationRow {
  label: string;
  poValue: string;
  quoteValue: string;
  matches: boolean;
}

export default function POQuoteVerification({ po, quote }: POQuoteVerificationProps) {
  const rows: VerificationRow[] = [
    {
      label: "Unit Price",
      poValue: `$${po.unitPrice.toFixed(2)}`,
      quoteValue: `$${quote.unitPrice.toFixed(2)}`,
      matches: po.unitPrice === quote.unitPrice,
    },
    {
      label: "Quantity",
      poValue: po.quantity.toLocaleString(),
      quoteValue: quote.moq.toLocaleString() + " (MOQ)",
      matches: po.quantity >= quote.moq,
    },
    {
      label: "Payment Terms",
      poValue: po.paymentTerms,
      quoteValue: quote.paymentTerms,
      matches: po.paymentTerms === quote.paymentTerms,
    },
    {
      label: "Delivery Terms",
      poValue: "FOB Origin",
      quoteValue: quote.deliveryTerms,
      matches: true,
    },
  ];

  const allMatch = rows.every((r) => r.matches);

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
        <FileCheck className="h-4 w-4 text-foreground/70" />
        <div className="flex-1">
          <h4 className="text-[12px] font-semibold text-foreground">
            PO-Quote Verification
          </h4>
          <p className="text-[11px] text-muted-foreground">
            PO terms matched against selected quote from {quote.supplier.name}
          </p>
        </div>
        {allMatch && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <div className="flex h-[16px] w-[16px] items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
              <Check className="h-2 w-2 text-emerald-600" strokeWidth={3} />
            </div>
            All terms match
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 px-5 py-2.5"
          >
            <div className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-none border ${
                row.matches ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"
              }`}>
              <Check className={`h-2 w-2 ${row.matches ? "text-emerald-600" : "text-amber-600"}`} strokeWidth={3} />
            </div>
            <span className="w-28 shrink-0 text-[11px] font-medium text-muted-foreground">
              {row.label}
            </span>
            <span className="flex-1 text-[12px] text-foreground/85">
              {row.poValue}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Quote: {row.quoteValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
