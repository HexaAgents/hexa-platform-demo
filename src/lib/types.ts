export type MatchStatus = "confirmed" | "partial" | "conflict" | "unmatched";
export type OrderSource = "email" | "ecommerce" | "phone";
export type OrderType = "standard" | "quote_builder";
export type OrderStage =
  | "needs_clarification"
  | "clarification_requested"
  | "clarification_received"
  | "rfq_received"
  | "bom_review"
  | "inventory_check"
  | "quote_draft"
  | "quote_sent"
  | "quote_prepared"
  | "po_received"
  | "po_validated"
  | "po_mismatch"
  | "pushed_to_mrp"
  | "shipped"
  | "delivered";
export type ParsedFieldKey =
  | "partNumber"
  | "price"
  | "qty"
  | "dueDate"
  | "shipTo"
  | "shipVia"
  | "paymentTerms";
export type ShippingCarrier =
  | "ups"
  | "fedex"
  | "dhl"
  | "shipstation"
  | "manual"
  | "other";
export type ShipmentSource = "carrier_api" | "manual" | "mrp_event" | "webhook";
export type ShipmentStatus =
  | "draft"
  | "shipment_created"
  | "label_created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "delayed"
  | "returned"
  | "cancelled";
export type ShipmentEventType =
  | "shipment_created"
  | "shipment_status_updated"
  | "shipment_eta_changed"
  | "shipment_delivered"
  | "shipment_exception"
  | "notification_sent"
  | "notification_failed";
export type NotificationStatus =
  | "queued"
  | "sent"
  | "failed"
  | "suppressed_duplicate";
export type DemoOrderStage =
  | "rfq_received"
  | "quote_prepared"
  | "po_received"
  | "po_validated";
export type DemoOrderScenario =
  | "rfq_csv"
  | "rfq_handwritten"
  | "rfq_quick"
  | "po_match"
  | "po_mismatch"
  | "dynamic";
export type ComparisonField = "price" | "quantity" | "dueDate" | "drawingRev";
export type ErpSyncState = "queued" | "sent" | "acknowledged" | "blocked";

export type InventoryStockStatus = "in_stock" | "low" | "out_of_stock" | "custom";

export interface BomComponent {
  id: string;
  catalogSku: string | null;
  name: string;
  quantity: number;
  uom: string;
  unitCost: number | null;
  isCustom: boolean;
}

export interface InventoryStatus {
  catalogSku: string;
  componentName: string;
  required: number;
  inStock: number;
  shortfall: number;
  status: InventoryStockStatus;
  leadTimeDays?: number;
  procurementItemId?: string;
}

export interface DrawingRef {
  id: string;
  fileName: string;
  revision: string;
  attachmentId: string;
  linkedLineItemIds: string[];
}

export interface CatalogItem {
  catalogSku: string;
  catalogName: string;
  catalogDescription: string;
  catalogPrice: number;
  catalogUom: string;
}

export interface LineItem {
  id: string;
  lineNumber: number;
  rawText: string;
  parsedSku: string | null;
  parsedProductName: string;
  parsedQuantity: number;
  parsedUom: string;
  parsedUnitPrice: number | null;
  requestedDueDate?: string | null;
  matchStatus: MatchStatus;
  confidence: number;
  matchedCatalogItems: CatalogItem[];
  issues: string[];
  bomComponents?: BomComponent[];
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  content?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  billingAddress: string;
  shippingAddress: string;
}

export interface ShipmentSummary {
  shipmentId: string;
  status: ShipmentStatus;
  carrier: ShippingCarrier;
  trackingNumber?: string;
  estimatedDelivery?: string;
  latestEventAt: string;
}

export interface ShipmentNotification {
  id: string;
  shipmentId: string;
  status: NotificationStatus;
  eventType: ShipmentEventType;
  recipient: string;
  errorMessage?: string;
  sentAt?: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  type: ShipmentEventType;
  status: ShipmentStatus;
  source: ShipmentSource;
  occurredAt: string;
  idempotencyKey: string;
  carrierEventId?: string;
  message?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  rawPayload?: Record<string, unknown>;
}

export interface Shipment {
  id: string;
  orderId?: string;
  poId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  carrier: ShippingCarrier;
  carrierService?: string;
  status: ShipmentStatus;
  source: ShipmentSource;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  lastEventAt: string;
  createdAt: string;
  updatedAt: string;
  notificationStatus: NotificationStatus;
}

export interface ShippingMetrics {
  shipmentEventsProcessed: number;
  notificationSent: number;
  notificationFailed: number;
  duplicateSuppressed: number;
  lastUpdatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  stage: OrderStage;
  source: OrderSource;
  createdAt: string;
  customer: Customer;
  attachments: Attachment[];
  lineItems: LineItem[];
  emailSubject: string;
  totalItems: number;
  orderType?: OrderType;
  drawings?: DrawingRef[];
  inventoryStatus?: InventoryStatus[];
  poNumber?: string | null;
  dueDate?: string | null;
  shipTo?: string | null;
  shipVia?: string | null;
  paymentTerms?: string | null;
  parseConfidence?: number;
  parseFieldConfidence?: Partial<Record<ParsedFieldKey, number>>;
  parseMissingFields?: ParsedFieldKey[];
  mrpRoutedAt?: string | null;
  ingestionSourceLabel?: string | null;
  shipmentSummary?: ShipmentSummary;
  demoFlow?: {
    scenario: DemoOrderScenario;
    stage: DemoOrderStage;
    quoteNumber?: string;
    poNumber?: string;
    quoteComparison?: {
      overallMatch: boolean;
      checks: Array<{
        field: ComparisonField;
        matches: boolean;
        quoteValue: string;
        incomingValue: string;
        note?: string;
      }>;
    };
    correctionDraftEmail?: {
      to: string;
      subject: string;
      body: string;
    };
    erpSync?: {
      state: ErpSyncState;
      timeline: Array<{
        label: string;
        state: ErpSyncState;
        at: string;
      }>;
    };
    clarifications?: Array<{
      questions: string[];
      emailSent: { to: string; subject: string; body: string; sentAt: string };
      replyReceived?: { body: string; receivedAt: string; parsedAnswers: string[] };
    }>;
    quoteSummary?: {
      quoteNumber: string;
      items: Array<{ sku: string; name: string; qty: number; unitPrice: number }>;
      subtotal: number;
      sentAt: string;
      sentTo: string;
    };
    poConfirmation?: {
      poNumber: string;
      receivedAt: string;
      matchesQuote: boolean;
    };
    mrpPush?: {
      pushedAt: string;
      erpOrderId?: string;
    };
  };
}
