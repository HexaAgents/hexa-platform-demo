"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Package, Wrench, Calendar, Mail, Clock, Star, FileText, ArrowLeftRight, FileDown, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  ProcurementItem,
  ProcurementStatus,
} from "@/lib/procurement-types";
import {
  getSupplier,
  getSupplierHistoriesForItem,
  getDaysOfStockRemaining,
  getRFQSupplierEntries,
  getQuotesForRFQ,
  getPurchaseOrder,
  getDraftRFQ,
  getDraftRFQForItem,
  getQuoteById,
} from "@/data/procurement-data";
import UrgencyBanner from "./UrgencyBanner";
import InventorySection from "./InventorySection";
import StockTrendChart from "./StockTrendChart";
import SupplierComparisonTable from "./SupplierComparisonTable";
import CoOrderSection from "./CoOrderSection";
import EngineeringRequestDetails from "./EngineeringRequestDetails";
import OrderQuantitySection from "./OrderQuantitySection";
import DraftRFQSection from "./DraftRFQSection";
import RFQTrackerSection from "./RFQTrackerSection";
import QuoteComparisonSection from "./QuoteComparisonSection";
import POPreviewSection from "./POPreviewSection";
import ProcurementShipmentPanel from "./ProcurementShipmentPanel";
import StageSection from "./StageSection";
import DeliveryConfirmationBanner from "./DeliveryConfirmationBanner";
import POQuoteVerification from "./POQuoteVerification";
import ActionBar from "./ActionBar";

const statusLabels: Record<ProcurementStatus, string> = {
  flagged: "Flagged",
  rfq_sent: "RFQ Sent",
  quotes_received: "Quotes In",
  po_sent: "PO Sent",
  shipped: "Shipped",
  delivered: "Delivered",
};

const stageDisplayNames: Record<ProcurementStatus, string> = {
  flagged: "Original Flag",
  rfq_sent: "RFQ Sent to Suppliers",
  quotes_received: "Quotes Received",
  po_sent: "PO Sent & Confirmed",
  shipped: "Shipment Tracking",
  delivered: "Delivery Confirmed",
};

const statusBadgeClass: Record<ProcurementStatus, string> = {
  flagged: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  rfq_sent: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  quotes_received: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  po_sent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  shipped: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
};

interface ItemDetailPanelProps {
  item: ProcurementItem;
  onClose: () => void;
}

function getItemStages(item: ProcurementItem): ProcurementStatus[] {
  const hasRfqPath = !!item.activeRfqId;
  const allStages: ProcurementStatus[] = hasRfqPath
    ? ["flagged", "rfq_sent", "quotes_received", "po_sent", "shipped", "delivered"]
    : ["flagged", "po_sent", "shipped", "delivered"];
  const currentIdx = allStages.indexOf(item.status);
  if (currentIdx === -1) return ["flagged"];
  return allStages.slice(0, currentIdx + 1).reverse();
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(
    item.preferredSupplierId ? [item.preferredSupplierId] : []
  );
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    item.selectedQuoteId ?? null
  );
  const [orderMode, setOrderMode] = useState<"po" | "rfq">(
    item.preferredSupplierId ? "po" : "rfq"
  );

  const [rfqRef] = useState(
    () => `RFQ-${item.id.replace("pi-", "").toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isEngineering = item.source === "engineering_request";
  const SourceIcon = isEngineering ? Wrench : Package;
  const days = getDaysOfStockRemaining(item);

  const po = useMemo(() => {
    if (!item.purchaseOrderId) return null;
    return getPurchaseOrder(item.purchaseOrderId) ?? null;
  }, [item.purchaseOrderId]);

  const rfq = useMemo(() => {
    if (item.activeRfqId) return getDraftRFQ(item.activeRfqId) ?? null;
    return getDraftRFQForItem(item.id) ?? null;
  }, [item.activeRfqId, item.id]);

  const rfqEntries = useMemo(() => {
    if (!item.activeRfqId) return [];
    return getRFQSupplierEntries(item.activeRfqId);
  }, [item.activeRfqId]);

  const quotes = useMemo(() => {
    if (!item.activeRfqId) return [];
    return getQuotesForRFQ(item.activeRfqId);
  }, [item.activeRfqId]);

  const selectedQuote = useMemo(() => {
    const qid = item.selectedQuoteId ?? selectedQuoteId;
    if (!qid) return null;
    return getQuoteById(qid) ?? null;
  }, [item.selectedQuoteId, selectedQuoteId]);

  const supplierHistories = useMemo(() => getSupplierHistoriesForItem(item.id), [item.id]);

  const stages = useMemo(() => getItemStages(item), [item]);

  const handleToggleSupplier = (id: string) => {
    setSelectedSupplierIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      if (next.length > 1) {
        setOrderMode("rfq");
      } else if (next.length === 1 && next[0] === item.preferredSupplierId) {
        setOrderMode("po");
      }
      return next;
    });
  };

  const buildRFQPayload = useCallback(() => {
    if (selectedSupplierIds.length === 0) return;
    const supplier = getSupplier(selectedSupplierIds[0]);
    if (!supplier) return;
    const preferred = supplierHistories.find((h) => selectedSupplierIds.includes(h.supplierId));
    const leadTime = preferred?.avgLeadTimeDays ?? supplierHistories[0]?.avgLeadTimeDays ?? 14;
    const daysRemaining = getDaysOfStockRemaining(item);
    const deliveryDate = (() => {
      const d = new Date("2026-03-09");
      d.setDate(d.getDate() + (daysRemaining === Infinity ? leadTime + 7 : Math.max(daysRemaining, leadTime)));
      return d.toISOString().split("T")[0];
    })();
    const quantity = item.source === "engineering_request"
      ? item.maxStock || 25
      : Math.max(item.maxStock - item.currentStock, item.reorderPoint);
    const unitPrice = preferred?.lastUnitPrice ?? supplierHistories[0]?.lastUnitPrice ?? 0;
    return {
      rfqRef,
      itemName: item.name,
      itemSku: item.sku,
      itemDescription: item.description,
      technicalSpecs: item.technicalSpecs,
      attachments: item.attachments,
      supplierName: supplier.name,
      supplierEmail: supplier.contactEmail,
      quantity,
      unitPrice,
      deliveryDate,
    };
  }, [rfqRef, item, selectedSupplierIds, supplierHistories]);

  const handleSendRFQ = useCallback(async () => {
    const payload = buildRFQPayload();
    if (!payload) return;
    const res = await fetch("/api/procurement/send-rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to send RFQ");
    }
  }, [buildRFQPayload]);

  function getStageSummary(stage: ProcurementStatus): string {
    switch (stage) {
      case "delivered":
        return po
          ? `Received at dock — $${po.totalPrice.toLocaleString()} total, ${Math.round((new Date("2026-03-13").getTime() - new Date(item.flaggedAt).getTime()) / 86400000)}d from flag`
          : "Delivery confirmed";
      case "shipped":
        return po ? `Shipment in transit — ${po.supplier.name}` : "Shipment tracking";
      case "po_sent":
        return po
          ? `$${po.totalPrice.toLocaleString()} to ${po.supplier.name} on ${formatShortDate(po.sentAt ?? po.createdAt)}`
          : "PO sent to supplier";
      case "quotes_received": {
        const winner = selectedQuote ?? quotes.find((q) => q.id === item.selectedQuoteId);
        return winner
          ? `${quotes.length} quotes — selected ${winner.supplier.name}`
          : `${quotes.length} quotes received`;
      }
      case "rfq_sent":
        return rfq
          ? `RFQ sent to ${rfqEntries.length} supplier${rfqEntries.length !== 1 ? "s" : ""} on ${rfq.sentAt ? formatShortDate(rfq.sentAt) : "—"}`
          : "RFQ sent to suppliers";
      case "flagged":
        return item.source === "erp_alert"
          ? `ERP Flag — ${item.priority} priority${days !== Infinity ? `, ${days}d of stock` : ""}`
          : `Engineering request — ${item.priority} priority, by ${item.requestedBy}`;
      default:
        return "";
    }
  }

  function getStageDate(stage: ProcurementStatus): string | undefined {
    switch (stage) {
      case "delivered":
        return "2026-03-04T14:10:00Z";
      case "shipped":
        return po?.sentAt ?? po?.createdAt;
      case "po_sent":
        return po?.sentAt ?? po?.createdAt;
      case "quotes_received":
        return quotes.length > 0 ? quotes[quotes.length - 1].receivedAt : undefined;
      case "rfq_sent":
        return rfq?.sentAt ?? undefined;
      case "flagged":
        return item.flaggedAt;
      default:
        return undefined;
    }
  }

  function renderStageContent(stage: ProcurementStatus, isActive: boolean) {
    switch (stage) {
      case "delivered":
        return renderDelivered();
      case "shipped":
        return renderShipped();
      case "po_sent":
        return renderPOSent(isActive);
      case "quotes_received":
        return renderQuotesReceived(isActive);
      case "rfq_sent":
        return renderRFQSent(isActive);
      case "flagged":
        return renderFlagged(isActive);
      default:
        return null;
    }
  }

  function renderDelivered() {
    if (!po) return <p className="text-[13px] text-muted-foreground">Delivery data not available</p>;
    const daysToDeliver = Math.round(
      (new Date("2026-03-04").getTime() - new Date(item.flaggedAt).getTime()) / 86400000
    );
    return (
      <DeliveryConfirmationBanner
        deliveredDate="2026-03-04T14:10:00Z"
        totalCost={po.totalPrice}
        daysToDeliver={daysToDeliver}
        supplierName={po.supplier.name}
      />
    );
  }

  function renderShipped() {
    if (!po) return <p className="text-[13px] text-muted-foreground">PO data not available</p>;
    return (
      <ProcurementShipmentPanel
        poId={po.id}
        deliveryAddress={po.deliveryAddress}
      />
    );
  }

  function renderPOSent(isActive: boolean) {
    if (!po) return <p className="text-[13px] text-muted-foreground">PO data not available</p>;
    return (
      <div className="space-y-4">
        <POPreviewSection po={po} item={item} isReadOnly />
        {po.quoteId && selectedQuote && (
          <POQuoteVerification po={po} quote={selectedQuote} />
        )}
        {isActive && (
          <div className="flex items-center gap-3 border border-indigo-500/20 bg-indigo-500/5 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-indigo-900">Awaiting Shipment</h4>
              <p className="text-[12px] text-indigo-700/70">
                Expected delivery by {new Date(po.expectedDelivery).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        )}
        {isActive && (
          <div className="border border-border bg-card px-5 py-4">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Supplier Contact</h4>
            <p className="text-[13px] font-medium text-foreground/85">{po.supplier.name}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{po.supplier.contactEmail}</p>
            <p className="text-[12px] text-muted-foreground">{po.supplier.contactPhone}</p>
          </div>
        )}
      </div>
    );
  }

  function renderQuotesReceived(isActive: boolean) {
    return (
      <div className="space-y-4">
        {isActive && days !== Infinity && (
          <div className="flex items-center gap-2.5 border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-[12px] text-amber-800">
              <span className="font-medium">{days} days</span> of stock remaining — factor lead time when choosing a supplier
            </p>
          </div>
        )}
        <QuoteComparisonSection
          quotes={quotes}
          supplierHistories={supplierHistories}
          selectedQuoteId={item.selectedQuoteId ?? selectedQuoteId}
          onSelectQuote={setSelectedQuoteId}
          isReadOnly={!isActive}
        />
      </div>
    );
  }

  function renderRFQSent(isActive: boolean) {
    return (
      <div className="space-y-4">
        {isActive && days !== Infinity && (
          <div className="flex items-center gap-2.5 border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-[12px] text-amber-800">
              <span className="font-medium">{days} days</span> of stock remaining at current consumption rate
            </p>
          </div>
        )}
        {rfq && (
          <RFQTrackerSection rfq={rfq} entries={rfqEntries} isReadOnly={!isActive} />
        )}
        {!isActive && rfq && (
          <DraftRFQSection
            item={item}
            selectedSupplierIds={rfq.supplierIds}
            rfqRef={rfq.id.toUpperCase()}
            isReadOnly
            sentDate={rfq.sentAt ?? undefined}
          />
        )}
      </div>
    );
  }

  function renderFlagged(isActive: boolean) {
    if (!isActive) {
      const chosenSupplierIds = rfq
        ? rfq.supplierIds
        : po
          ? [po.supplierId]
          : item.preferredSupplierId
            ? [item.preferredSupplierId]
            : [];

      return (
        <div className="space-y-4">
          {isEngineering ? (
            <EngineeringRequestDetails itemId={item.id} />
          ) : (
            <InventorySection item={item} />
          )}

          {supplierHistories.length > 0 && (
            <SupplierComparisonTable
              itemId={item.id}
              selectedSupplierIds={chosenSupplierIds}
              onToggleSupplier={() => {}}
              isReadOnly
            />
          )}

          {rfq && (
            <DraftRFQSection
              item={item}
              selectedSupplierIds={rfq.supplierIds}
              rfqRef={rfq.id.toUpperCase()}
              isReadOnly
              sentDate={rfq.sentAt ?? undefined}
            />
          )}

          {!rfq && po && (
            <POPreviewSection po={po} item={item} isReadOnly />
          )}
        </div>
      );
    }

    const hasPreferredSupplier = !!item.preferredSupplierId && supplierHistories.some(h => h.supplierId === item.preferredSupplierId);

    if (isEngineering) {
      return (
        <div className="space-y-5">
          <EngineeringRequestDetails itemId={item.id} />
          <SupplierComparisonTable
            itemId={item.id}
            selectedSupplierIds={selectedSupplierIds}
            onToggleSupplier={handleToggleSupplier}
          />
          {selectedSupplierIds.length > 0 && (
            <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
          )}
          {selectedSupplierIds.length > 0 && (
            <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} rfqRef={rfqRef} />
          )}
        </div>
      );
    }

    const preferredHistory = supplierHistories.find(h => h.supplierId === item.preferredSupplierId);
    const activeHistory = supplierHistories.find(h => h.supplierId === selectedSupplierIds[0]);
    const showPoMode = orderMode === "po" && selectedSupplierIds.length === 1 && activeHistory;

    const leadTime = activeHistory?.avgLeadTimeDays ?? preferredHistory?.avgLeadTimeDays ?? 14;
    const unitPrice = activeHistory?.lastUnitPrice ?? preferredHistory?.lastUnitPrice ?? 0;
    const orderQty = Math.max(item.maxStock - item.currentStock, item.reorderPoint);
    const deliveryDate = (() => {
      const d = new Date("2026-03-09");
      d.setDate(d.getDate() + Math.max(days === Infinity ? leadTime + 7 : days, leadTime));
      return d.toISOString().split("T")[0];
    })();

    return (
      <div className="space-y-5">
        <InventorySection item={item} />
        <StockTrendChart item={item} />

        <SupplierComparisonTable
          itemId={item.id}
          selectedSupplierIds={selectedSupplierIds}
          onToggleSupplier={handleToggleSupplier}
        />

        {selectedSupplierIds.length > 0 && (
          <CoOrderSection item={item} />
        )}

        {selectedSupplierIds.length > 0 && (
          <OrderQuantitySection item={item} selectedSupplierIds={selectedSupplierIds} />
        )}

        {selectedSupplierIds.length > 0 && (
          <>
            <div className="flex items-center justify-between border border-border bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-foreground/70" />
                <span className="text-[13px] font-semibold text-foreground">
                  {showPoMode ? "Draft Purchase Order" : "Draft RFQ"}
                </span>
                {selectedSupplierIds.length > 1 && (
                  <span className="text-[11px] text-muted-foreground">
                    ({selectedSupplierIds.length} suppliers selected — RFQ mode)
                  </span>
                )}
              </div>
              {selectedSupplierIds.length === 1 && (
                <button
                  type="button"
                  onClick={() => setOrderMode(prev => prev === "po" ? "rfq" : "po")}
                  className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Switch to {orderMode === "po" ? "RFQ" : "PO"}
                </button>
              )}
            </div>

            {showPoMode && activeHistory ? (
              <DraftPOInline
                item={item}
                supplier={activeHistory.supplier}
                supplierEmail={activeHistory.supplier.contactEmail}
                unitPrice={unitPrice}
                quantity={orderQty}
                paymentTerms={activeHistory.paymentTerms}
                deliveryDate={deliveryDate}
              />
            ) : (
              <DraftRFQSection item={item} selectedSupplierIds={selectedSupplierIds} rfqRef={rfqRef} />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative z-10 flex h-full w-[85vw] flex-col border-l border-border bg-background shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex-none border-b border-border bg-card px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-[22px] font-medium leading-none text-foreground">
                    {item.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] font-semibold", statusBadgeClass[item.status])}
                  >
                    {statusLabels[item.status]}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <SourceIcon className="h-3.5 w-3.5" />
                    {item.sku}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.flaggedAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {isEngineering && item.requestedBy && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Requested by {item.requestedBy}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground/80 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-xs p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Urgency Banner (only for flagged state) */}
          {item.status === "flagged" && (
            <div className="flex-none px-7 pt-5">
              <UrgencyBanner item={item} />
            </div>
          )}

          {/* Stacked stage content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="px-7 py-5">
              <div className="max-w-4xl">
                {stages.map((stage, idx) => {
                  const isActive = idx === 0;
                  const isLast = idx === stages.length - 1;
                  return (
                    <StageSection
                      key={stage}
                      stageName={stageDisplayNames[stage]}
                      isActive={isActive}
                      completedDate={!isActive ? getStageDate(stage) : undefined}
                      summary={!isActive ? getStageSummary(stage) : undefined}
                      isLast={isLast}
                    >
                      {renderStageContent(stage, isActive)}
                    </StageSection>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Stage-aware action bar */}
          <ActionBar
            status={item.status}
            hasSupplierSelected={selectedSupplierIds.length > 0}
            selectedQuoteId={selectedQuoteId}
            supplierEmail={po?.supplier.contactEmail}
            orderMode={orderMode}
            onClose={onClose}
            onSendRFQ={handleSendRFQ}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

type POSendFormat = "email" | "pdf" | "csv";

const PO_FORMAT_TABS: { key: POSendFormat; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "pdf", label: "PDF", icon: FileDown },
  { key: "csv", label: "CSV", icon: Table2 },
];

function DraftPOInline({
  item,
  supplier,
  supplierEmail,
  unitPrice,
  quantity,
  paymentTerms,
  deliveryDate,
}: {
  item: ProcurementItem;
  supplier: { name: string; contactEmail: string; contactPhone: string };
  supplierEmail: string;
  unitPrice: number;
  quantity: number;
  paymentTerms: string;
  deliveryDate: string;
}) {
  const total = unitPrice * quantity;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [poFormat, setPOFormat] = useState<POSendFormat>("email");
  const deliveryFormatted = new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const defaultPOBody = `Dear ${supplier.name} Team,\n\nPlease find the purchase order details below.\n\nItem: ${item.name}\nSKU: ${item.sku}\nQuantity: ${quantity.toLocaleString()}\nUnit Price: $${fmt(unitPrice)}\nTotal: $${fmt(total)}\n\nPayment terms: ${paymentTerms}\nExpected delivery: ${deliveryFormatted}\nDelivery address: 1500 Factory Lane, Dock 4, Milwaukee, WI 53201\n\nPlease confirm receipt and expected ship date.\n\nBest regards,\nHexa Procurement Team`;

  const [poEmailTo, setPOEmailTo] = useState(supplierEmail);
  const [poEmailSubject, setPOEmailSubject] = useState(`Purchase Order — ${item.name} (${item.sku})`);
  const [poEmailBody, setPOEmailBody] = useState(defaultPOBody);

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-1 border-b border-border px-5 py-2">
        {PO_FORMAT_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPOFormat(key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors",
              poFormat === key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {poFormat === "email" ? "Send as email body" : poFormat === "pdf" ? "Attach as PDF document" : "Attach as CSV spreadsheet"}
        </span>
      </div>

      {poFormat === "email" ? (
        <>
          <div className="space-y-1.5 border-b border-border px-5 py-3.5">
            <div className="flex items-baseline gap-3 text-[12px]">
              <span className="w-12 shrink-0 text-right text-muted-foreground">To</span>
              <input
                value={poEmailTo}
                onChange={(e) => setPOEmailTo(e.target.value)}
                className="flex-1 bg-transparent text-foreground/85 outline-none focus:underline"
              />
            </div>
            <div className="flex items-baseline gap-3 text-[12px]">
              <span className="w-12 shrink-0 text-right text-muted-foreground">From</span>
              <span className="text-foreground/85">procurement@hexamfg.com</span>
            </div>
            <div className="flex items-baseline gap-3 text-[12px]">
              <span className="w-12 shrink-0 text-right text-muted-foreground">Subject</span>
              <input
                value={poEmailSubject}
                onChange={(e) => setPOEmailSubject(e.target.value)}
                className="flex-1 bg-transparent font-medium text-foreground/85 outline-none focus:underline"
              />
            </div>
          </div>
          <div className="px-5 py-4">
            <textarea
              value={poEmailBody}
              onChange={(e) => setPOEmailBody(e.target.value)}
              rows={14}
              className="w-full resize-y bg-transparent text-[12px] leading-relaxed text-foreground/75 outline-none"
            />
          </div>
        </>
      ) : poFormat === "pdf" ? (
        <>
          <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
            <div className="bg-card px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Supplier</p>
              <p className="mt-1.5 text-[13px] font-medium text-foreground/85">{supplier.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{supplierEmail}</p>
              <p className="text-[11px] text-muted-foreground">{supplier.contactPhone}</p>
            </div>
            <div className="bg-card px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ship To</p>
              <p className="mt-1.5 text-[13px] text-foreground/85">1500 Factory Lane, Dock 4, Milwaukee, WI 53201</p>
            </div>
          </div>
          <div className="border-b border-border px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">Line Items</p>
            <div className="border border-border">
              <div className="flex items-center bg-muted/30 px-4 py-2">
                <span className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Item</span>
                <span className="w-24 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Qty</span>
                <span className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Unit Price</span>
                <span className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
              </div>
              <div className="flex items-center border-t border-border px-4 py-3">
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-foreground/85">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sku}</p>
                </div>
                <span className="w-24 text-center text-[13px] font-medium tabular-nums text-foreground/70">{quantity.toLocaleString()}</span>
                <span className="w-28 text-right text-[13px] font-medium tabular-nums text-foreground/70">${fmt(unitPrice)}</span>
                <span className="w-28 text-right text-[13px] font-semibold tabular-nums text-foreground">${fmt(total)}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border">
            <div className="bg-card px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Payment Terms</p>
              <p className="mt-1 text-[13px] font-medium text-foreground/85">{paymentTerms}</p>
            </div>
            <div className="bg-card px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Expected Delivery</p>
              <p className="mt-1 text-[13px] font-medium text-foreground/85">{deliveryFormatted}</p>
            </div>
            <div className="bg-card px-5 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Value</p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">${fmt(total)}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="border-b border-border bg-muted/30 px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-foreground/85">purchase-order-{item.sku.toLowerCase()}.csv</p>
              <span className="text-[11px] font-medium text-muted-foreground">CSV PREVIEW</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">item_name</th>
                  <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">sku</th>
                  <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">quantity</th>
                  <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">unit_price</th>
                  <th className="px-3 py-2 text-right font-mono font-medium text-muted-foreground">total</th>
                  <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">delivery_date</th>
                  <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">supplier</th>
                  <th className="px-3 py-2 text-left font-mono font-medium text-muted-foreground">payment_terms</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-foreground/80">{item.name}</td>
                  <td className="px-3 py-2 font-mono text-foreground/70">{item.sku}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground/70">{quantity}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground/70">{unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground/70">{total.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono text-foreground/70">{deliveryDate}</td>
                  <td className="px-3 py-2 text-foreground/70">{supplier.name}</td>
                  <td className="px-3 py-2 text-foreground/70">{paymentTerms}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
