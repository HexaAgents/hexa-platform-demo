"use client";

import { FileText, Building2, Package, MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PurchaseOrder, Supplier, ProcurementItem } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

interface POPreviewSectionProps {
  po: PurchaseOrder & { supplier: Supplier };
  item: ProcurementItem;
  isReadOnly?: boolean;
}

export default function POPreviewSection({ po, item, isReadOnly = false }: POPreviewSectionProps) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-foreground/70" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Purchase Order — {po.id.toUpperCase()}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {po.status === "sent" ? "Sent" : "Draft"} — Created{" "}
              {new Date(po.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-semibold",
            po.status === "sent"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700"
          )}
        >
          {po.status === "sent" ? "Sent" : "Draft"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
        <div className="bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3 w-3" />
            Supplier
          </div>
          <p className="mt-1.5 text-[13px] font-medium text-foreground/85">{po.supplier.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{po.supplier.contactEmail}</p>
          <p className="text-[11px] text-muted-foreground">{po.supplier.contactPhone}</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Ship To
          </div>
          <p className="mt-1.5 text-[13px] text-foreground/85">{po.deliveryAddress}</p>
        </div>
      </div>

      <div className="border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
          <Package className="h-3 w-3" />
          Line Items
        </div>
        <div className="border border-border">
          <div className="flex items-center bg-muted/30 px-4 py-2">
            <span className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Item</span>
            <span className="w-24 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Qty</span>
            <span className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Unit Price</span>
            <span className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center px-4 py-3 border-t border-border">
            <div className="flex-1">
              <p className="text-[13px] font-medium text-foreground/85">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">{item.sku}</p>
            </div>
            <span className="w-24 text-center text-[13px] font-medium tabular-nums text-foreground/70">{po.quantity.toLocaleString()}</span>
            <span className="w-28 text-right text-[13px] font-medium tabular-nums text-foreground/70">${po.unitPrice.toFixed(2)}</span>
            <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-foreground">${po.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border">
        <div className="bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            Payment Terms
          </div>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">{po.paymentTerms}</p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Expected Delivery
          </div>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">
            {new Date(po.expectedDelivery).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" />
            {po.sentAt ? "Sent On" : "Created On"}
          </div>
          <p className="mt-1 text-[13px] font-medium text-foreground/85">
            {new Date(po.sentAt ?? po.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {isReadOnly && po.status === "sent" && (
        <div className="border-t border-border bg-muted/20 px-5 py-3">
          <p className="text-[11px] text-muted-foreground">
            PO was sent to {po.supplier.name} on{" "}
            {po.sentAt ? new Date(po.sentAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}.
            Awaiting supplier confirmation and shipment.
          </p>
        </div>
      )}
    </div>
  );
}
