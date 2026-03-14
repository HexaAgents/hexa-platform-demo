"use client";

import { useState, useMemo } from "react";
import { Eye, FileText, Paperclip, Mail, FileDown, Table2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import {
  getSupplier, getSupplierHistoriesForItem, getDaysOfStockRemaining,
} from "@/data/procurement-data";

type SendFormat = "email" | "pdf" | "csv";

const FORMAT_TABS: { key: SendFormat; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "pdf", label: "PDF", icon: FileDown },
  { key: "csv", label: "CSV", icon: Table2 },
];

interface DraftRFQSectionProps {
  item: ProcurementItem;
  selectedSupplierIds: string[];
  rfqRef: string;
  isReadOnly?: boolean;
  sentDate?: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DraftRFQSection({ item, selectedSupplierIds, rfqRef, isReadOnly = false, sentDate }: DraftRFQSectionProps) {
  const suppliers = useMemo(
    () => selectedSupplierIds.map((id) => getSupplier(id)).filter(Boolean) as NonNullable<ReturnType<typeof getSupplier>>[],
    [selectedSupplierIds]
  );

  const histories = useMemo(() => getSupplierHistoriesForItem(item.id), [item.id]);
  const defaultLeadTime = useMemo(() => {
    const preferred = histories.find((h) => selectedSupplierIds.includes(h.supplierId));
    return preferred?.avgLeadTimeDays ?? histories[0]?.avgLeadTimeDays ?? 14;
  }, [histories, selectedSupplierIds]);

  const daysRemaining = getDaysOfStockRemaining(item);
  const defaultDeliveryDate = useMemo(() => {
    const now = new Date("2026-03-09");
    now.setDate(now.getDate() + (daysRemaining === Infinity ? defaultLeadTime + 7 : Math.max(daysRemaining, defaultLeadTime)));
    return formatDate(now);
  }, [daysRemaining, defaultLeadTime]);

  const defaultQuantity = useMemo(() => {
    if (item.source === "engineering_request") return item.maxStock || 25;
    return Math.max(item.maxStock - item.currentStock, item.reorderPoint);
  }, [item]);

  const [quantity] = useState(defaultQuantity);
  const [deliveryDate] = useState(defaultDeliveryDate);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendFormat, setSendFormat] = useState<SendFormat>("email");

  const supplierName = suppliers.length > 0 ? suppliers[0].name : "—";
  const supplierEmail = suppliers.length > 0 ? suppliers[0].contactEmail : "—";
  const unitPrice = histories.find((h) => selectedSupplierIds.includes(h.supplierId))?.lastUnitPrice ?? histories[0]?.lastUnitPrice ?? 0;
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const defaultEmailBody = useMemo(() =>
    `Dear ${supplierName} Team,\n\nWe are requesting a quotation for the following item. Please review the details below and provide your best pricing and lead time.\n\nItem: ${item.name}\nSKU: ${item.sku}\nQuantity: ${quantity.toLocaleString()}\nEst. Unit Price: $${fmt(unitPrice)}\nEst. Total: $${fmt(unitPrice * quantity)}\n\nRequested delivery date: ${formatDisplayDate(deliveryDate)}\nPayment terms: Net 30\nDelivery address: 1500 Factory Lane, Dock 4, Milwaukee, WI 53201\n\nThis RFQ is valid for 14 days from the date of issue.\n\nBest regards,\nHexa Procurement Team`,
    [supplierName, item.name, item.sku, quantity, unitPrice, deliveryDate, fmt]
  );

  const [emailTo, setEmailTo] = useState(supplierEmail);
  const [emailSubject, setEmailSubject] = useState(`${rfqRef} — ${item.name}`);
  const [emailBody, setEmailBody] = useState(defaultEmailBody);

  if (selectedSupplierIds.length === 0) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Draft RFQ</h4>
        <div className="flex items-center justify-center border border-dashed border-border py-8">
          <p className="text-[12px] text-muted-foreground">Select a supplier above to generate an RFQ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Draft RFQ</h3>
            <p className="text-[12px] text-muted-foreground">{rfqRef}</p>
          </div>
        </div>
        {isReadOnly && sentDate ? (
          <p className="text-[11px] text-muted-foreground">
            Sent {formatDisplayDate(sentDate)}
          </p>
        ) : (
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <Eye className="h-3 w-3" />
            Full Preview
          </button>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-1 border-b border-border px-6 py-2">
          {FORMAT_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSendFormat(key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors",
                sendFormat === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {sendFormat === "email" ? "Send as email body" : sendFormat === "pdf" ? "Attach as PDF document" : "Attach as CSV spreadsheet"}
          </span>
        </div>
      )}

      <div className="p-6">
        {sendFormat === "email" ? (
          <div>
            <div className="border border-border bg-card">
              <div className="space-y-1.5 border-b border-border px-5 py-3.5">
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
                  {isReadOnly ? (
                    <span className="text-foreground/85">{supplierEmail}</span>
                  ) : (
                    <input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="flex-1 bg-transparent text-foreground/85 outline-none focus:underline"
                    />
                  )}
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
                  <span className="text-foreground/85">procurement@hexamfg.com</span>
                </div>
                <div className="flex items-baseline gap-3 text-[12px]">
                  <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
                  {isReadOnly ? (
                    <span className="font-medium text-foreground/85">{rfqRef} &mdash; {item.name}</span>
                  ) : (
                    <input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="flex-1 bg-transparent font-medium text-foreground/85 outline-none focus:underline"
                    />
                  )}
                </div>
              </div>

              {isReadOnly ? (
                <div className="px-5 py-5 text-[12px] leading-relaxed text-foreground/75">
                  <p>Dear {supplierName} Team,</p>
                  <p className="mt-3">
                    We are requesting a quotation for the following item. Please review the details below and provide your best pricing and lead time.
                  </p>
                  <div className="my-4 border border-border">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Item</th>
                          <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">SKU</th>
                          <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Qty</th>
                          <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Unit Price</th>
                          <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2.5 py-1.5 text-foreground/80">{item.name}</td>
                          <td className="px-2.5 py-1.5 font-mono text-muted-foreground">{item.sku}</td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">{quantity.toLocaleString()}</td>
                          <td className="px-2.5 py-1.5 text-right text-foreground/70">${fmt(unitPrice)}</td>
                          <td className="px-2.5 py-1.5 text-right font-medium text-foreground/80">${fmt(unitPrice * quantity)}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                          <td colSpan={4} className="px-2.5 py-1.5 text-right font-medium">Estimated Total</td>
                          <td className="px-2.5 py-1.5 text-right font-semibold">${fmt(unitPrice * quantity)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="mt-3">
                    Requested delivery date: <span className="font-medium text-foreground/85">{formatDisplayDate(deliveryDate)}</span>
                  </p>
                  <p className="mt-1">
                    Payment terms: <span className="font-medium text-foreground/85">Net 30</span>
                  </p>
                  <p className="mt-1">
                    Delivery address: <span className="text-foreground/85">1500 Factory Lane, Dock 4, Milwaukee, WI 53201</span>
                  </p>
                  <p className="mt-3">This RFQ is valid for 14 days from the date of issue.</p>
                  <p className="mt-5">
                    Best regards,<br />
                    <span className="font-medium text-foreground/85">Hexa Procurement Team</span>
                  </p>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={16}
                    className="w-full resize-y bg-transparent text-[12px] leading-relaxed text-foreground/75 outline-none"
                  />
                </div>
              )}
            </div>

            {!isReadOnly && item.attachments.length > 0 && (
              <div className="mt-3 flex items-center gap-2.5 border border-dashed border-border bg-muted/20 px-3.5 py-3">
                <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="text-[12px]">
                  <span className="font-medium text-foreground/85">{item.attachments.length} attachment{item.attachments.length > 1 ? "s" : ""}</span>
                  <span className="ml-2 text-muted-foreground">
                    {item.attachments.map((a) => a.fileName).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : sendFormat === "pdf" ? (
          <div className="border border-border bg-card">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-semibold text-foreground">Request for Quotation</h4>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{rfqRef} &middot; {formatDisplayDate("2026-03-14")}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">PDF PREVIEW</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-border px-5 py-4 text-[12px]">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">From</p>
                <p className="mt-1 font-medium text-foreground/85">Hexa Manufacturing Co.</p>
                <p className="text-muted-foreground">procurement@hexamfg.com</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">To</p>
                <p className="mt-1 font-medium text-foreground/85">{supplierName}</p>
                <p className="text-muted-foreground">{supplierEmail}</p>
              </div>
            </div>
            <div className="border-b border-border px-5 py-4">
              <div className="border border-border">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">Item</th>
                      <th className="px-2.5 py-1.5 text-left font-medium text-muted-foreground">SKU</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Qty</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Unit Price</th>
                      <th className="px-2.5 py-1.5 text-right font-medium text-muted-foreground">Est. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2.5 py-1.5 text-foreground/80">{item.name}</td>
                      <td className="px-2.5 py-1.5 font-mono text-muted-foreground">{item.sku}</td>
                      <td className="px-2.5 py-1.5 text-right text-foreground/70">{quantity.toLocaleString()}</td>
                      <td className="px-2.5 py-1.5 text-right text-foreground/70">${fmt(unitPrice)}</td>
                      <td className="px-2.5 py-1.5 text-right font-medium text-foreground/80">${fmt(unitPrice * quantity)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="px-2.5 py-1.5 text-right font-medium">Estimated Total</td>
                      <td className="px-2.5 py-1.5 text-right font-semibold">${fmt(unitPrice * quantity)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 px-5 py-4 text-[12px]">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Delivery By</p>
                <p className="mt-1 font-medium text-foreground/85">{formatDisplayDate(deliveryDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Payment Terms</p>
                <p className="mt-1 font-medium text-foreground/85">Net 30</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Valid For</p>
                <p className="mt-1 font-medium text-foreground/85">14 days</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border bg-card">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-foreground/85">
                  {rfqRef}.csv
                </p>
                <span className="text-[11px] font-medium text-muted-foreground">CSV PREVIEW</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">rfq_ref</th>
                    <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">item_name</th>
                    <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">sku</th>
                    <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">quantity</th>
                    <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">est_unit_price</th>
                    <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">est_total</th>
                    <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">delivery_date</th>
                    <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">supplier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 font-mono text-foreground/70">{rfqRef}</td>
                    <td className="px-3 py-2 text-foreground/80">{item.name}</td>
                    <td className="px-3 py-2 font-mono text-foreground/70">{item.sku}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground/70">{quantity}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground/70">{unitPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground/70">{(unitPrice * quantity).toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono text-foreground/70">{deliveryDate}</td>
                    <td className="px-3 py-2 text-foreground/70">{supplierName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>RFQ Preview</DialogTitle></DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto border border-border bg-card p-5 space-y-4">
            <div className="border-b border-border pb-3">
              <h4 className="text-base font-semibold">Request for Quotation</h4>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{rfqRef} &middot; {formatDisplayDate("2026-03-09")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">From</p>
                <p className="mt-1 font-medium">Hexa Manufacturing Co.</p>
                <p className="text-muted-foreground">procurement@hexamfg.com</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">To</p>
                <p className="mt-1 font-medium">{supplierName}</p>
                <p className="text-muted-foreground">{supplierEmail}</p>
              </div>
            </div>
            <div className="border-t border-border pt-3 text-[12px]">
              <p className="font-medium">{item.name}</p>
              <p className="font-mono text-muted-foreground">{item.sku}</p>
              <p className="mt-1 text-muted-foreground">{item.description}</p>
              <p className="mt-2">Quantity: <span className="font-medium tabular-nums">{quantity.toLocaleString()}</span></p>
              <p>Delivery by: <span className="font-medium">{formatDisplayDate(deliveryDate)}</span></p>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
