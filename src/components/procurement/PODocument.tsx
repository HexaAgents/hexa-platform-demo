"use client";

import type { ProcurementItem } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

export interface PODocumentLineItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  uom?: string;
}

interface PODocumentProps {
  poNumber: string;
  status: "draft" | "sent";
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  shipTo: string;
  lineItems: PODocumentLineItem[];
  paymentTerms: string;
  /** ISO date, yyyy-mm-dd, or pre-formatted display string */
  expectedDelivery: string;
  /** ISO date, yyyy-mm-dd, or pre-formatted display string */
  issuedDate: string;
  /** Short, case-specific subject line */
  subject: string;
  /** Customised, case-specific sentence describing why the order was raised */
  caseNote: string;
  /** Optional extra note rendered in the footer (e.g. sent confirmation) */
  footerNote?: string;
  className?: string;
}

const NAVY = "#1f2a44";

const BUYER = {
  name: "HEXA MANUFACTURING CO.",
  email: "procurement@hexamfg.com",
  phone: "(414) 555-0142",
  address: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
};

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(value: string) {
  if (!value) return "—";
  const d = value.length <= 10 ? new Date(value + "T00:00:00") : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Short subject line that obviously ties the PO to the specific case. */
export function buildPOSubject(item: ProcurementItem): string {
  switch (item.source) {
    case "erp_alert":
      return `Inventory Restock — ${item.name}`;
    case "engineering_request":
      return `Engineering Request — ${item.name}`;
    case "manual_request":
      return `Procurement Request — ${item.name}`;
    default:
      return `Purchase Order — ${item.name}`;
  }
}

/** Sentence that obviously ties the PO to the specific case + distributor. */
export function buildPOCaseNote(item: ProcurementItem): string {
  switch (item.source) {
    case "erp_alert":
      return `Auto-generated from an ERP inventory alert — on-hand stock for ${item.name} (${item.sku}) fell to ${item.currentStock.toLocaleString()} units, at or below the reorder point of ${item.reorderPoint.toLocaleString()}.`;
    case "engineering_request":
      return `Raised from an engineering request submitted by ${item.requestedBy} for ${item.name} (${item.sku}).`;
    case "manual_request":
      return `Raised from a manual procurement request submitted by ${item.requestedBy} for ${item.name} (${item.sku}).`;
    default:
      return `Issued for ${item.name} (${item.sku}).`;
  }
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-[78px] shrink-0 font-bold text-neutral-700">{label}</span>
      <span className="text-neutral-600">{value}</span>
    </div>
  );
}

export default function PODocument({
  poNumber,
  status,
  supplierName,
  supplierEmail,
  supplierPhone,
  supplierAddress,
  shipTo,
  lineItems,
  paymentTerms,
  expectedDelivery,
  issuedDate,
  subject,
  caseNote,
  footerNote,
  className,
}: PODocumentProps) {
  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);
  const isSent = status === "sent";

  return (
    <div
      className={cn(
        "overflow-hidden border border-neutral-300 bg-white text-neutral-900 shadow-sm",
        className
      )}
    >
      {/* Header banner */}
      <div
        className="flex items-start justify-between gap-4 px-6 py-4 text-white"
        style={{ backgroundColor: NAVY }}
      >
        <div>
          <div className="text-[14px] font-bold tracking-tight">{BUYER.name}</div>
          <div className="mt-1 text-[7.5px] text-white/70">{BUYER.address}</div>
        </div>
        <div className="pt-0.5 text-[12px] font-bold tracking-wide">PURCHASE ORDER</div>
      </div>

      <div className="px-6 py-5">
        {/* Metadata */}
        <div className="space-y-1 text-[8.5px]">
          <MetaRow label="PO Number:" value={poNumber} />
          <MetaRow label="Date:" value={fmtDate(issuedDate)} />
          <MetaRow label="Prepared By:" value="Hexa Procurement Team" />
          <MetaRow label="Payment:" value={paymentTerms} />
          <MetaRow label="Status:" value={isSent ? "Issued to vendor" : "Draft — pending"} />
        </div>

        {/* To */}
        <div className="mt-4 text-[8.5px] leading-relaxed">
          <p className="font-bold" style={{ color: NAVY }}>
            TO:
          </p>
          <p className="text-neutral-700">{supplierName}</p>
          {supplierAddress && <p className="text-neutral-500">{supplierAddress}</p>}
          {supplierEmail && <p className="text-neutral-500">{supplierEmail}</p>}
          {supplierPhone && <p className="text-neutral-500">{supplierPhone}</p>}
        </div>

        {/* Subject */}
        <p className="mt-4 text-[9.5px] font-bold text-neutral-900">
          SUBJECT: {subject}
        </p>

        {/* Intro */}
        <p className="mt-2 text-[8px] leading-[1.6] text-neutral-600">
          {BUYER.name.replace(/\.$/, ".")} is placing the following purchase order with{" "}
          <span className="font-semibold text-neutral-800">{supplierName}</span>. Delivery is
          required to our Milwaukee facility, Dock 4. Payment terms: {paymentTerms}.
        </p>

        {/* Items */}
        <table className="mt-3 w-full border-collapse text-[7.5px]">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-100 text-[6.5px] uppercase tracking-wide text-neutral-500">
              <th className="px-1.5 py-1.5 text-left font-semibold">#</th>
              <th className="px-1.5 py-1.5 text-left font-semibold">Description</th>
              <th className="px-1.5 py-1.5 text-left font-semibold">SKU</th>
              <th className="px-1.5 py-1.5 text-right font-semibold">Qty</th>
              <th className="px-1.5 py-1.5 text-left font-semibold">UOM</th>
              <th className="px-1.5 py-1.5 text-right font-semibold">Unit Price</th>
              <th className="px-1.5 py-1.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, i) => (
              <tr key={`${li.sku}-${i}`} className="border-b border-neutral-200 align-top">
                <td className="px-1.5 py-1.5 text-neutral-400">{i + 1}</td>
                <td className="px-1.5 py-1.5 font-medium text-neutral-800">{li.name}</td>
                <td className="px-1.5 py-1.5 text-neutral-500">{li.sku || "—"}</td>
                <td className="px-1.5 py-1.5 text-right tabular-nums text-neutral-700">
                  {li.quantity.toLocaleString()}
                </td>
                <td className="px-1.5 py-1.5 text-neutral-500">{li.uom ?? "units"}</td>
                <td className="px-1.5 py-1.5 text-right tabular-nums text-neutral-700">
                  ${fmtMoney(li.unitPrice)}
                </td>
                <td className="px-1.5 py-1.5 text-right font-semibold tabular-nums text-neutral-900">
                  ${fmtMoney(li.unitPrice * li.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-2 flex justify-end">
          <div className="w-[150px] text-[8px]">
            <div className="flex justify-between py-0.5 text-neutral-500">
              <span>Subtotal</span>
              <span className="tabular-nums text-neutral-700">${fmtMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-neutral-500">
              <span>Shipping</span>
              <span className="text-neutral-400">Quoted sep.</span>
            </div>
            <div
              className="mt-0.5 flex justify-between border-t pt-1 font-bold"
              style={{ borderColor: NAVY }}
            >
              <span>Order Total</span>
              <span className="tabular-nums" style={{ color: NAVY }}>
                ${fmtMoney(subtotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <p className="text-[8.5px] font-bold text-neutral-900">NOTES:</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[8px] leading-[1.5] text-neutral-600">
            <li>{caseNote}</li>
            <li>Required delivery by {fmtDate(expectedDelivery)}.</li>
            <li>
              Reference{" "}
              <span className="font-semibold text-neutral-800">{poNumber}</span> on all packing
              slips, shipping labels, and invoices.
            </li>
            <li>Please confirm pricing, availability, and ship date on receipt of this order.</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-5 border-t border-neutral-200 pt-3 text-[7.5px] leading-[1.6] text-neutral-500">
          <p>
            Please confirm acceptance of this purchase order. Contact the Hexa Procurement Team at{" "}
            {BUYER.email} with any questions.
          </p>
          {footerNote && <p className="mt-1.5 text-neutral-600">{footerNote}</p>}
          <p className="mt-2 text-neutral-400">Hexa Manufacturing Co. — Confidential</p>
        </div>
      </div>
    </div>
  );
}
