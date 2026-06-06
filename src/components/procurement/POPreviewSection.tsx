"use client";

import type { PurchaseOrder, Supplier, ProcurementItem } from "@/lib/procurement-types";
import PODocument, { buildPOCaseNote, buildPOSubject } from "./PODocument";

interface POPreviewSectionProps {
  po: PurchaseOrder & { supplier: Supplier };
  item: ProcurementItem;
  isReadOnly?: boolean;
}

export default function POPreviewSection({ po, item, isReadOnly = false }: POPreviewSectionProps) {
  const footerNote =
    isReadOnly && po.status === "sent"
      ? `Sent to ${po.supplier.name} on ${
          po.sentAt
            ? new Date(po.sentAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "—"
        }. Awaiting supplier confirmation and shipment.`
      : undefined;

  return (
    <div className="border border-border bg-muted/30 px-5 py-5">
      <PODocument
        className="mx-auto max-w-[440px]"
        poNumber={po.id.toUpperCase()}
        status={po.status}
        supplierName={po.supplier.name}
        supplierEmail={po.supplier.contactEmail}
        supplierPhone={po.supplier.contactPhone}
        supplierAddress={po.supplier.address}
        shipTo={po.deliveryAddress}
        lineItems={[
          { name: item.name, sku: item.sku, quantity: po.quantity, unitPrice: po.unitPrice },
        ]}
        paymentTerms={po.paymentTerms}
        expectedDelivery={po.expectedDelivery}
        issuedDate={po.sentAt ?? po.createdAt}
        subject={buildPOSubject(item)}
        caseNote={buildPOCaseNote(item)}
        footerNote={footerNote}
      />
    </div>
  );
}
