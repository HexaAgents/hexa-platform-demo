import type {
  ProcurementItem,
  ProcurementStatus,
  ProcurementDemoData,
  Supplier,
  SupplierQuote,
  RFQSupplierEntry,
  PurchaseOrder,
  DraftRFQ,
} from "./procurement-types";
import {
  getSupplier,
  getSupplierHistoriesForItem,
  getDaysOfStockRemaining,
} from "@/data/procurement-data";

export interface ProcurementDemoStep {
  id: string;
  type: "user" | "auto";
  delayMs?: number;
  resultStatus: ProcurementStatus;
  label: string;
  apply: (
    item: ProcurementItem,
    data: ProcurementDemoData,
    ctx: DemoContext
  ) => { item: ProcurementItem; data: ProcurementDemoData };
}

export interface DemoContext {
  selectedSupplierIds: string[];
  selectedQuoteId?: string;
}

function now(): string {
  return new Date().toISOString();
}

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function buildRfqForItem(
  item: ProcurementItem,
  supplierIds: string[],
): DraftRFQ {
  const histories = getSupplierHistoriesForItem(item.id);
  const preferred = histories.find((h) =>
    supplierIds.includes(h.supplierId),
  );
  const leadTime =
    preferred?.avgLeadTimeDays ?? histories[0]?.avgLeadTimeDays ?? 14;
  const days = getDaysOfStockRemaining(item);
  const deliveryDate = futureDate(
    days === Infinity ? leadTime + 7 : Math.max(days, leadTime),
  );
  const quantity =
    item.source === "engineering_request"
      ? item.maxStock || 25
      : Math.max(item.maxStock - item.currentStock, item.reorderPoint);

  return {
    id: `rfq-demo-${item.id}`,
    itemId: item.id,
    supplierIds,
    quantity,
    deliveryDate,
    specs: item.technicalSpecs ?? {},
    attachments: item.attachments,
    status: "sent",
    createdAt: now(),
    sentAt: now(),
    buyerCompany: "Hexa Manufacturing Co.",
    buyerContact: "James Morrison",
    buyerEmail: "procurement@hexamfg.com",
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    paymentTermsPreference: "Net 30",
    validityDays: 14,
    notes: "",
  };
}

function buildQuotesForRfq(
  item: ProcurementItem,
  rfq: DraftRFQ,
  supplierIds: string[],
): {
  quotes: (SupplierQuote & { supplier: Supplier })[];
  entries: (RFQSupplierEntry & { supplier: Supplier })[];
} {
  const histories = getSupplierHistoriesForItem(item.id);
  const quotes: (SupplierQuote & { supplier: Supplier })[] = [];
  const entries: (RFQSupplierEntry & { supplier: Supplier })[] = [];

  for (const sid of supplierIds) {
    const supplier = getSupplier(sid);
    if (!supplier) continue;
    const history = histories.find((h) => h.supplierId === sid);
    const basePrice = history?.lastUnitPrice ?? history?.avgUnitPrice ?? 10;
    const variation = 0.85 + Math.random() * 0.3;
    const unitPrice = +(basePrice * variation).toFixed(2);
    const leadBase = history?.avgLeadTimeDays ?? 10;
    const leadVariation = Math.floor(Math.random() * 5) - 2;
    const leadTimeDays = Math.max(2, leadBase + leadVariation);

    const quoteId = `sq-demo-${item.id}-${sid}`;
    quotes.push({
      id: quoteId,
      rfqId: rfq.id,
      supplierId: sid,
      unitPrice,
      totalPrice: +(unitPrice * rfq.quantity).toFixed(2),
      leadTimeDays,
      moq: history?.moq ?? 10,
      paymentTerms: history?.paymentTerms ?? supplier.paymentTerms,
      deliveryTerms: "FOB Origin",
      validUntil: futureDate(14),
      receivedAt: now(),
      notes: `Quote from ${supplier.name}. Lead time ${leadTimeDays} days.`,
      supplier,
    });

    entries.push({
      supplierId: sid,
      sentAt: rfq.sentAt!,
      responseStatus: "quote_received",
      quoteId,
      supplier,
    });
  }

  return { quotes, entries };
}

function buildPOFromQuote(
  item: ProcurementItem,
  quote: SupplierQuote & { supplier: Supplier },
  rfqQuantity?: number,
): PurchaseOrder & { supplier: Supplier } {
  const quantity = rfqQuantity ?? quote.moq;
  return {
    id: `pur-demo-${item.id}`,
    itemId: item.id,
    supplierId: quote.supplierId,
    quoteId: quote.id,
    quantity,
    unitPrice: quote.unitPrice,
    totalPrice: +(quote.unitPrice * quantity).toFixed(2),
    paymentTerms: quote.paymentTerms,
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: futureDate(quote.leadTimeDays),
    status: "sent",
    createdAt: now(),
    sentAt: now(),
    supplier: quote.supplier,
  };
}

function buildPODirect(
  item: ProcurementItem,
  supplierIds: string[],
): PurchaseOrder & { supplier: Supplier } {
  const histories = getSupplierHistoriesForItem(item.id);
  const preferred =
    histories.find((h) => supplierIds.includes(h.supplierId)) ?? histories[0];
  const supplier = getSupplier(preferred?.supplierId ?? supplierIds[0])!;
  const unitPrice = preferred?.lastUnitPrice ?? preferred?.avgUnitPrice ?? 10;
  const quantity =
    item.source === "engineering_request"
      ? item.maxStock || 25
      : Math.max(item.maxStock - item.currentStock, item.reorderPoint);
  const leadTime = preferred?.avgLeadTimeDays ?? 10;

  return {
    id: `pur-demo-${item.id}`,
    itemId: item.id,
    supplierId: supplier.id,
    quantity,
    unitPrice,
    totalPrice: +(unitPrice * quantity).toFixed(2),
    paymentTerms: preferred?.paymentTerms ?? supplier.paymentTerms,
    deliveryAddress: "1500 Factory Lane, Dock 4, Milwaukee, WI 53201",
    expectedDelivery: futureDate(leadTime),
    status: "sent",
    createdAt: now(),
    sentAt: now(),
    supplier,
  };
}

const CONFIRMATION_STEP: ProcurementDemoStep = {
  id: "po_confirmation",
  type: "auto",
  delayMs: 4000,
  resultStatus: "po_sent",
  label: "Supplier Confirmation",
  apply: (item, data) => ({
    item,
    data: { ...data, confirmationReceived: true },
  }),
};

const SHIPPING_STEPS: ProcurementDemoStep[] = [
  {
    id: "shipping_created",
    type: "auto",
    delayMs: 3000,
    resultStatus: "shipped",
    label: "Shipment Created",
    apply: (item, data) => ({
      item: { ...item, status: "shipped" },
      data: {
        ...data,
        shipment: data.shipment
          ? { ...data.shipment, status: "shipment_created", latestEventAt: now() }
          : {
              shipmentId: `shp-demo-${item.id}`,
              status: "shipment_created",
              carrier: "fedex",
              trackingNumber: "794644790188",
              estimatedDelivery: data.po?.expectedDelivery ?? futureDate(10),
              latestEventAt: now(),
            },
      },
    }),
  },
  {
    id: "shipping_label_created",
    type: "auto",
    delayMs: 3500,
    resultStatus: "shipped",
    label: "Label Created",
    apply: (item, data) => ({
      item,
      data: {
        ...data,
        shipment: data.shipment
          ? { ...data.shipment, status: "label_created", latestEventAt: now() }
          : undefined,
      },
    }),
  },
  {
    id: "shipping_picked_up",
    type: "auto",
    delayMs: 4000,
    resultStatus: "shipped",
    label: "Picked Up",
    apply: (item, data) => ({
      item,
      data: {
        ...data,
        shipment: data.shipment
          ? { ...data.shipment, status: "picked_up", latestEventAt: now() }
          : undefined,
      },
    }),
  },
  {
    id: "shipping_in_transit",
    type: "auto",
    delayMs: 4500,
    resultStatus: "shipped",
    label: "In Transit",
    apply: (item, data) => ({
      item,
      data: {
        ...data,
        shipment: data.shipment
          ? { ...data.shipment, status: "in_transit", latestEventAt: now() }
          : undefined,
      },
    }),
  },
  {
    id: "shipping_out_for_delivery",
    type: "auto",
    delayMs: 5000,
    resultStatus: "shipped",
    label: "Out for Delivery",
    apply: (item, data) => ({
      item,
      data: {
        ...data,
        shipment: data.shipment
          ? {
              ...data.shipment,
              status: "out_for_delivery",
              latestEventAt: now(),
            }
          : undefined,
      },
    }),
  },
  {
    id: "shipping_delivered",
    type: "auto",
    delayMs: 5000,
    resultStatus: "delivered",
    label: "Delivered",
    apply: (item, data) => ({
      item: { ...item, status: "delivered" },
      data: {
        ...data,
        shipment: data.shipment
          ? { ...data.shipment, status: "delivered", latestEventAt: now() }
          : undefined,
      },
    }),
  },
];

export const RFQ_PATH_STEPS: ProcurementDemoStep[] = [
  {
    id: "send_rfq",
    type: "user",
    resultStatus: "rfq_sent",
    label: "Send RFQ",
    apply: (item, data, ctx) => {
      const rfq = buildRfqForItem(item, ctx.selectedSupplierIds);
      const supplierEntries: (RFQSupplierEntry & { supplier: Supplier })[] =
        ctx.selectedSupplierIds
          .map((sid) => {
            const supplier = getSupplier(sid);
            if (!supplier) return null;
            return {
              supplierId: sid,
              sentAt: rfq.sentAt!,
              responseStatus: "sent" as const,
              supplier,
            };
          })
          .filter(Boolean) as (RFQSupplierEntry & { supplier: Supplier })[];

      return {
        item: { ...item, status: "rfq_sent", activeRfqId: rfq.id },
        data: { ...data, rfq, rfqEntries: supplierEntries },
      };
    },
  },
  {
    id: "quotes_arrive",
    type: "auto",
    delayMs: 5000,
    resultStatus: "quotes_received",
    label: "Quotes Arriving",
    apply: (item, data, ctx) => {
      const rfq = data.rfq!;
      const supplierIds =
        ctx.selectedSupplierIds.length > 0
          ? ctx.selectedSupplierIds
          : rfq.supplierIds;
      const { quotes, entries } = buildQuotesForRfq(item, rfq, supplierIds);
      return {
        item: { ...item, status: "quotes_received" },
        data: { ...data, quotes, rfqEntries: entries },
      };
    },
  },
  {
    id: "send_po_from_quote",
    type: "user",
    resultStatus: "po_sent",
    label: "Send PO",
    apply: (item, data, ctx) => {
      const qid = ctx.selectedQuoteId ?? data.quotes?.[0]?.id;
      const quote = data.quotes?.find((q) => q.id === qid) ?? data.quotes?.[0];
      if (!quote) return { item, data };
      const po = buildPOFromQuote(item, quote, data.rfq?.quantity);
      return {
        item: {
          ...item,
          status: "po_sent",
          selectedQuoteId: quote.id,
          purchaseOrderId: po.id,
        },
        data: {
          ...data,
          po,
          selectedQuoteId: quote.id,
          shipment: {
            shipmentId: `shp-demo-${item.id}`,
            status: "draft",
            carrier: "fedex",
            trackingNumber: "794644790188",
            estimatedDelivery: po.expectedDelivery,
            latestEventAt: now(),
          },
        },
      };
    },
  },
  CONFIRMATION_STEP,
  ...SHIPPING_STEPS,
];

export const DIRECT_PO_PATH_STEPS: ProcurementDemoStep[] = [
  {
    id: "send_po_direct",
    type: "user",
    resultStatus: "po_sent",
    label: "Send PO",
    apply: (item, data, ctx) => {
      const po = buildPODirect(item, ctx.selectedSupplierIds);
      return {
        item: { ...item, status: "po_sent", purchaseOrderId: po.id },
        data: {
          ...data,
          po,
          shipment: {
            shipmentId: `shp-demo-${item.id}`,
            status: "draft",
            carrier: "fedex",
            trackingNumber: "794644790188",
            estimatedDelivery: po.expectedDelivery,
            latestEventAt: now(),
          },
        },
      };
    },
  },
  CONFIRMATION_STEP,
  ...SHIPPING_STEPS,
];

const STATUS_TO_RFQ_STEP_INDEX: Record<string, number> = {
  flagged: 0,
  rfq_sent: 1,
  quotes_received: 2,
  po_sent: 3,
  shipped: 4,
  delivered: 10,
};

const STATUS_TO_PO_STEP_INDEX: Record<string, number> = {
  flagged: 0,
  po_sent: 1,
  shipped: 2,
  delivered: 8,
};

export function getStartingStepIndex(
  path: "rfq" | "po",
  currentStatus: ProcurementStatus,
): number {
  const map =
    path === "rfq" ? STATUS_TO_RFQ_STEP_INDEX : STATUS_TO_PO_STEP_INDEX;
  return map[currentStatus] ?? 0;
}

export function detectPath(item: ProcurementItem): "rfq" | "po" {
  if (item.activeRfqId) return "rfq";
  if (item.status === "rfq_sent" || item.status === "quotes_received")
    return "rfq";
  return "po";
}
