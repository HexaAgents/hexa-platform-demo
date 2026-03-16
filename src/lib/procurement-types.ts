export type ProcurementSource = "erp_alert" | "engineering_request" | "manual_request";
export type ProcurementStatus =
  | "flagged"
  | "rfq_sent"
  | "quotes_received"
  | "po_sent"
  | "shipped"
  | "delivered";
export type ProcurementPriority = "critical" | "high" | "medium" | "low";
export type RequestUrgency = "routine" | "urgent" | "critical";
export type RequestCategory = "raw_material" | "standard_component" | "custom_part" | "tooling" | "consumable" | "other";
export type RFQStatus = "draft" | "sent";
export type RFQResponseStatus = "sent" | "no_response" | "quote_received";
export type ScanFrequency = "15min" | "1hr" | "4hr" | "daily";
export type ReorderPointSource = "erp" | "custom";

export interface TechnicalSpecs {
  material?: string;
  dimensions?: string;
  tolerances?: string;
  grade?: string;
  finish?: string;
  compliance?: string;
  [key: string]: string | undefined;
}

export interface ProcurementAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface ProcurementItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  source: ProcurementSource;
  status: ProcurementStatus;
  priority: ProcurementPriority;
  currentStock: number;
  reorderPoint: number;
  maxStock: number;
  avgDailyConsumption: number;
  avgDailyConsumption30d: number;
  avgDailyConsumption90d: number;
  flaggedAt: string;
  requestedBy: string;
  category: RequestCategory;
  technicalSpecs?: TechnicalSpecs;
  attachments: ProcurementAttachment[];
  preferredSupplierId: string;
  stockHistory: StockHistoryPoint[];
  activeRfqId?: string;
  selectedQuoteId?: string;
  purchaseOrderId?: string;
}

export interface StockHistoryPoint {
  date: string;
  level: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  paymentTerms: string;
  address: string;
  notes: string;
}

export interface SupplierItemHistory {
  id: string;
  supplierId: string;
  itemId: string;
  lastOrderDate: string;
  totalOrders12mo: number;
  avgUnitPrice: number;
  lastUnitPrice: number;
  previousUnitPrice: number;
  avgLeadTimeDays: number;
  onTimeDeliveryRate: number;
  defectRate: number;
  reliabilityScore: number;
  moq: number;
  paymentTerms: string;
  notes: string;
}

export interface CoOrderPattern {
  id: string;
  itemId: string;
  coItemId: string;
  coOrderFrequencyPct: number;
}

export interface EngineeringRequest {
  id: string;
  itemId: string;
  requesterName: string;
  requesterTeam: string;
  description: string;
  urgency: RequestUrgency;
  specs: TechnicalSpecs;
  attachments: ProcurementAttachment[];
  submittedAt: string;
  classificationTags: string[];
}

export interface DraftRFQ {
  id: string;
  itemId: string;
  supplierIds: string[];
  quantity: number;
  deliveryDate: string;
  specs: TechnicalSpecs;
  attachments: ProcurementAttachment[];
  status: RFQStatus;
  createdAt: string;
  sentAt: string | null;
  buyerCompany: string;
  buyerContact: string;
  buyerEmail: string;
  deliveryAddress: string;
  paymentTermsPreference: string;
  validityDays: number;
  notes: string;
}

export interface ERPScanConfig {
  scanFrequency: ScanFrequency;
  reorderPointSource: ReorderPointSource;
  alertInApp: boolean;
  alertEmail: boolean;
  watchedItemIds: string[];
  customReorderPoints: Record<string, { reorderPoint: number; maxStock: number }>;
}

export type OpenPOStatus =
  | "confirmed"
  | "shipped"
  | "partial_shipped"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "exception"
  | "cancelled";

export interface OpenPO {
  id: string;
  itemId: string;
  supplierId: string;
  quantity: number;
  orderDate: string;
  expectedDelivery: string;
  status: OpenPOStatus;
  trackingRef?: string;
  carrier?: "ups" | "fedex" | "dhl" | "shipstation" | "manual" | "other";
  latestUpdateAt?: string;
  exceptionReason?: string;
}

export interface RFQSupplierEntry {
  supplierId: string;
  sentAt: string;
  responseStatus: RFQResponseStatus;
  quoteId?: string;
}

export interface SupplierQuote {
  id: string;
  rfqId: string;
  supplierId: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  moq: number;
  paymentTerms: string;
  deliveryTerms: string;
  validUntil: string;
  receivedAt: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  itemId: string;
  supplierId: string;
  quoteId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentTerms: string;
  deliveryAddress: string;
  expectedDelivery: string;
  status: "draft" | "sent";
  createdAt: string;
  sentAt: string | null;
  shipmentId?: string;
}

export interface ProcurementFilters {
  source: "all" | ProcurementSource;
  statuses: ProcurementStatus[];
  priorities: ProcurementPriority[];
  supplierId: string | null;
  dateRange: { start: string | null; end: string | null };
  search: string;
}

export interface ProcurementDemoShipment {
  shipmentId: string;
  status: "draft" | "shipment_created" | "label_created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  latestEventAt: string;
}

export interface ProcurementDemoData {
  rfq?: DraftRFQ;
  rfqEntries?: (RFQSupplierEntry & { supplier: Supplier })[];
  quotes?: (SupplierQuote & { supplier: Supplier })[];
  selectedQuoteId?: string;
  po?: PurchaseOrder & { supplier: Supplier };
  shipment?: ProcurementDemoShipment;
  confirmationReceived?: boolean;
}
