import { skuCatalog } from "./sku-catalog";
import type { SkuCatalogEntry } from "./sku-catalog";
import type { LineItem } from "./types";

export interface CartItem {
  catalogSku: string;
  catalogName: string;
  catalogDescription: string;
  catalogPrice: number;
  catalogUom: string;
  category: string;
  quantity: number;
}

const CART_KEY = "apex-cart";

export function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function clearCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_KEY);
  }
}

export function getDefaultCartItems(): CartItem[] {
  return [
    toCartItem("IBK-400", 24),
    toCartItem("SF-3-150", 60),
    toCartItem("HB-M12-50", 100),
    toCartItem("VA-200", 15),
    toCartItem("SG-CLR-12", 10),
    toCartItem("OR-KIT-200", 8),
  ].filter((c): c is CartItem => c !== null);
}

export interface RecentUpload {
  id: string;
  label: string;
  description: string;
  type: "pdf" | "csv" | "image" | "text";
  timestamp: string;
}

export const RECENT_UPLOADS: RecentUpload[] = [
  {
    id: "pdf-po",
    label: "Purchase_Order_4829.pdf",
    description: "Bearings, valves & pump impellers — 8 line items",
    type: "pdf",
    timestamp: "Today, 9:42 AM",
  },
  {
    id: "csv-order",
    label: "warehouse_restock_Q1.csv",
    description: "Fasteners, hardware & electrical — 7 line items",
    type: "csv",
    timestamp: "Today, 8:15 AM",
  },
  {
    id: "note-img",
    label: "handwritten_note_scan.jpg",
    description: "Seals, gaskets & plumbing fittings — 5 line items",
    type: "image",
    timestamp: "Yesterday, 4:30 PM",
  },
  {
    id: "text-list",
    label: "Safety compliance re-order",
    description: "PPE, safety glasses & fire extinguisher — 6 line items",
    type: "text",
    timestamp: "Yesterday, 11:00 AM",
  },
];

export function getCartItemsForSample(sampleId: string): CartItem[] {
  switch (sampleId) {
    case "pdf-po":
      return [
        toCartItem("IBK-400", 24),
        toCartItem("IBK-300", 12),
        toCartItem("VA-200", 15),
        toCartItem("VA-300", 8),
        toCartItem("PI-CEN-6", 4),
        toCartItem("PI-CEN-4", 6),
        toCartItem("PS-KIT-STD", 10),
        toCartItem("BB-6205", 50),
      ].filter((c): c is CartItem => c !== null);

    case "csv-order":
      return [
        toCartItem("HB-M12-50", 100),
        toCartItem("HB-M10-40", 80),
        toCartItem("SS-SCR-200", 40),
        toCartItem("LN-M10-50", 60),
        toCartItem("DH-SS-4", 24),
        toCartItem("EW-12-100", 10),
        toCartItem("CB-20A-10", 5),
      ].filter((c): c is CartItem => c !== null);

    case "note-img":
      return [
        toCartItem("OR-KIT-400", 12),
        toCartItem("GK-STD-25", 20),
        toCartItem("RS-HD-10", 15),
        toCartItem("PTFE-TAPE-12", 30),
        toCartItem("CT-HALF", 50),
      ].filter((c): c is CartItem => c !== null);

    case "text-list":
      return [
        toCartItem("SG-CLR-12", 20),
        toCartItem("SG-TNT-12", 10),
        toCartItem("WG-NIT-100", 8),
        toCartItem("WG-LTH-12", 6),
        toCartItem("HR-STD", 25),
        toCartItem("FR-EXTING-5", 4),
      ].filter((c): c is CartItem => c !== null);

    default:
      return getDefaultCartItems();
  }
}

function toCartItem(sku: string, qty: number): CartItem | null {
  const entry = skuCatalog.find((e) => e.catalogSku === sku);
  if (!entry) return null;
  return { ...entryToCartFields(entry), quantity: qty };
}

function entryToCartFields(e: SkuCatalogEntry) {
  return {
    catalogSku: e.catalogSku,
    catalogName: e.catalogName,
    catalogDescription: e.catalogDescription,
    catalogPrice: e.catalogPrice,
    catalogUom: e.catalogUom,
    category: e.category,
  };
}

export function simulateMatching(input: string): CartItem[] {
  const items: CartItem[] = [];
  const segments = input.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);

  for (const seg of segments) {
    const qtyMatch = seg.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const text = seg.toLowerCase();

    const skuMatch = skuCatalog.find(
      (e) => text.includes(e.catalogSku.toLowerCase())
    );
    if (skuMatch) {
      items.push({ ...entryToCartFields(skuMatch), quantity: qty });
      continue;
    }

    const scored = skuCatalog
      .map((e) => {
        let score = 0;
        const words = [
          ...e.catalogName.toLowerCase().split(/\s+/),
          ...e.tags.map((t) => t.toLowerCase()),
          e.category.toLowerCase(),
        ];
        for (const w of words) {
          if (w.length > 2 && text.includes(w)) score++;
        }
        return { entry: e, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const best = scored[0].entry;
      if (!items.some((i) => i.catalogSku === best.catalogSku)) {
        items.push({ ...entryToCartFields(best), quantity: qty });
      }
    }
  }

  if (items.length === 0) {
    return getDefaultCartItems();
  }
  return items;
}

export function cartItemsToLineItems(items: CartItem[]): LineItem[] {
  return items.map((item, i) => ({
    id: `li-cart-${Date.now()}-${i + 1}`,
    lineNumber: i + 1,
    rawText: `${item.quantity}x ${item.catalogName} (${item.catalogSku})`,
    parsedSku: item.catalogSku,
    parsedProductName: item.catalogName,
    parsedQuantity: item.quantity,
    parsedUom: item.catalogUom,
    parsedUnitPrice: item.catalogPrice,
    matchStatus: "confirmed" as const,
    confidence: 95,
    matchedCatalogItems: [
      {
        catalogSku: item.catalogSku,
        catalogName: item.catalogName,
        catalogDescription: item.catalogDescription,
        catalogPrice: item.catalogPrice,
        catalogUom: item.catalogUom,
      },
    ],
    issues: [],
  }));
}
