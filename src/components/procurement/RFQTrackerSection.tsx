"use client";

import { Mail, Clock, Check, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RFQSupplierEntry, Supplier, DraftRFQ } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

interface RFQTrackerSectionProps {
  rfq: DraftRFQ;
  entries: (RFQSupplierEntry & { supplier: Supplier })[];
  isReadOnly?: boolean;
}

const responseLabels: Record<string, { label: string; class: string }> = {
  sent: { label: "Sent", class: "border-blue-500/30 bg-blue-500/10 text-blue-700" },
  no_response: { label: "No Response", class: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  quote_received: { label: "Quote Received", class: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
};

export default function RFQTrackerSection({ rfq, entries, isReadOnly = false }: RFQTrackerSectionProps) {
  const quotesIn = entries.filter((e) => e.responseStatus === "quote_received").length;

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Mail className="h-4 w-4 text-foreground/70" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">RFQ Status</h3>
            <p className="text-[11px] text-muted-foreground">
              {quotesIn} of {entries.length} supplier{entries.length !== 1 ? "s" : ""} responded
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Sent {rfq.sentAt ? new Date(rfq.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
        </p>
      </div>

      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const style = responseLabels[entry.responseStatus] ?? responseLabels.sent;
          return (
            <div key={entry.supplierId} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                {entry.responseStatus === "quote_received" ? (
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                    <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                  </div>
                ) : entry.responseStatus === "no_response" ? (
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-amber-500/40 bg-amber-500/10">
                    <Clock className="h-2.5 w-2.5 text-amber-600" />
                  </div>
                ) : (
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-blue-500/40 bg-blue-500/10">
                    <Mail className="h-2.5 w-2.5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-foreground/85">{entry.supplier.name}</p>
                  <p className="text-[11px] text-muted-foreground">{entry.supplier.contactEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className={cn("text-[10px] font-semibold", style.class)}>
                  {style.label}
                </Badge>
                {!isReadOnly && entry.responseStatus === "no_response" && (
                  <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCw className="h-3 w-3" />
                    Resend
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>Qty requested: <span className="font-medium text-foreground/70">{rfq.quantity.toLocaleString()}</span></span>
          <span>Delivery by: <span className="font-medium text-foreground/70">{new Date(rfq.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></span>
        </div>
      </div>
    </div>
  );
}
