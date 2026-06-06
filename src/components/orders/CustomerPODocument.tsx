"use client";

import { cn } from "@/lib/utils";

export interface CustomerPOLineItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  uom?: string;
  /** Optional flag to visually highlight a corrected/disputed line */
  highlight?: boolean;
}

interface CustomerPODocumentProps {
  poNumber: string;
  /** ISO date, yyyy-mm-dd, or pre-formatted display string */
  issuedDate: string;
  /** Buyer (the customer raising the PO) shown in the header banner */
  buyerName: string;
  buyerAddress: string;
  preparedBy: string;
  buyerEmail: string;
  buyerPhone?: string;
  /** Recipient (the supplier being ordered from) shown under TO: */
  recipientName: string;
  recipientEmail?: string;
  shipTo: string;
  subject: string;
  intro: string;
  lineItems: CustomerPOLineItem[];
  paymentTerms: string;
  notes: string[];
  footerNote?: string;
  className?: string;
}

const NAVY = "#1f2a44";

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(value: string) {
  if (!value) return "—";
  const d = value.length <= 10 ? new Date(value + "T00:00:00") : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-[78px] shrink-0 font-bold text-neutral-700">{label}</span>
      <span className="text-neutral-600">{value}</span>
    </div>
  );
}

export default function CustomerPODocument({
  poNumber,
  issuedDate,
  buyerName,
  buyerAddress,
  preparedBy,
  buyerEmail,
  buyerPhone,
  recipientName,
  recipientEmail,
  shipTo,
  subject,
  intro,
  lineItems,
  paymentTerms,
  notes,
  footerNote,
  className,
}: CustomerPODocumentProps) {
  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);

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
          <div className="text-[14px] font-bold uppercase tracking-tight">{buyerName}</div>
          <div className="mt-1 text-[7.5px] text-white/70">{buyerAddress}</div>
        </div>
        <div className="pt-0.5 text-[12px] font-bold tracking-wide">PURCHASE ORDER</div>
      </div>

      <div className="px-6 py-5">
        {/* Metadata */}
        <div className="space-y-1 text-[8.5px]">
          <MetaRow label="PO Number:" value={poNumber} />
          <MetaRow label="Date:" value={fmtDate(issuedDate)} />
          <MetaRow label="Prepared By:" value={preparedBy} />
          <MetaRow label="Email:" value={buyerEmail} />
          {buyerPhone && <MetaRow label="Phone:" value={buyerPhone} />}
        </div>

        {/* To */}
        <div className="mt-4 text-[8.5px] leading-relaxed">
          <p className="font-bold" style={{ color: NAVY }}>
            TO:
          </p>
          <p className="text-neutral-700">{recipientName}</p>
          {recipientEmail && <p className="text-neutral-500">{recipientEmail}</p>}
        </div>

        {/* Subject */}
        <p className="mt-4 text-[9.5px] font-bold text-neutral-900">SUBJECT: {subject}</p>

        {/* Intro */}
        <p className="mt-2 text-[8px] leading-[1.6] text-neutral-600">{intro}</p>

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
              <tr
                key={`${li.sku}-${i}`}
                className={cn(
                  "border-b border-neutral-200 align-top",
                  li.highlight && "bg-amber-50"
                )}
              >
                <td className="px-1.5 py-1.5 text-neutral-400">{i + 1}</td>
                <td className="px-1.5 py-1.5 font-medium text-neutral-800">{li.name}</td>
                <td className="px-1.5 py-1.5 text-neutral-500">{li.sku || "—"}</td>
                <td
                  className={cn(
                    "px-1.5 py-1.5 text-right tabular-nums text-neutral-700",
                    li.highlight && "font-bold text-amber-700"
                  )}
                >
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
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-5 border-t border-neutral-200 pt-3 text-[7.5px] leading-[1.6] text-neutral-500">
          <p>
            Please confirm acceptance of this purchase order and advise pricing, availability, and
            ship date. Contact {preparedBy} with any questions.
          </p>
          {footerNote && <p className="mt-1.5 text-neutral-600">{footerNote}</p>}
          <p className="mt-2 text-neutral-400">Ship to: {shipTo}</p>
          <p className="mt-1 text-neutral-400">Payment terms: {paymentTerms} — {buyerName} — Confidential</p>
        </div>
      </div>
    </div>
  );
}
