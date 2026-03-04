export type MatchStatus = "confirmed" | "partial" | "conflict" | "unmatched";
export type OrderStatus = "pending" | "fulfilled";

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
  matchStatus: MatchStatus;
  confidence: number;
  matchedCatalogItems: CatalogItem[];
  issues: string[];
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

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  customer: Customer;
  attachments: Attachment[];
  lineItems: LineItem[];
  emailSubject: string;
  totalItems: number;
}
