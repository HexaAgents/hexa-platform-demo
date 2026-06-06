"use client";

import { Order, ShipmentStatus } from "@/lib/types";
import { TimelineSection } from "./orders/TimelineSection";
import { RfqReceivedSection } from "./orders/RfqReceivedSection";
import { ClarificationSection } from "./orders/ClarificationSection";
import { BomReviewSection } from "./orders/BomReviewSection";
import { InventoryCheckSection } from "./orders/InventoryCheckSection";
import { QuoteDraftSection } from "./orders/QuoteDraftSection";
import { QuoteSentSection } from "./orders/QuoteSentSection";
import { SkuRecommendationSection } from "./orders/SkuRecommendationSection";
import { PoReceivedSection } from "./orders/PoReceivedSection";
import { MrpPushSection } from "./orders/MrpPushSection";
import { OrderDeliveryBanner } from "./orders/OrderDeliveryBanner";
import ShipmentPanel from "./shipping/ShipmentPanel";

type SectionKey =
  | "delivery"
  | "shipping"
  | "mrp"
  | "po"
  | "quote"
  | "quote_draft"
  | "sku_advisory"
  | "inventory_check"
  | "bom_review"
  | "clarification"
  | "rfq";

export interface DemoContext {
  stepId: string;
  advance: () => void;
  advanceWith: (mutate: (order: Order) => Order) => void;
  isAutoProgressing: boolean;
}

interface SectionDef {
  key: SectionKey;
  shouldRender: (order: Order) => boolean;
  isActive: (order: Order) => boolean;
}

function isQuoteBuilder(o: Order): boolean {
  return o.orderType === "quote_builder";
}

const BOM_STAGES = new Set(["bom_review", "inventory_check", "quote_draft"]);

const STAGES_AFTER_BOM = new Set([
  "po_received", "po_mismatch", "po_validated", "pushed_to_mrp", "shipped", "delivered",
]);

function hasPassedBomStage(o: Order, stage: string): boolean {
  const pipeline = ["bom_review", "inventory_check", "quote_draft", "quote_sent"];
  const targetIdx = pipeline.indexOf(stage);
  if (targetIdx === -1) return false;
  const currentIdx = pipeline.indexOf(o.stage);
  if (currentIdx !== -1) return currentIdx > targetIdx;
  return STAGES_AFTER_BOM.has(o.stage);
}

function hasCompletedShipmentLifecycle(order: Order): boolean {
  const summary = order.shipmentSummary;
  const completedSubstepPriority: Partial<Record<ShipmentStatus, number>> = {
    shipment_created: 1,
    label_created: 2,
    picked_up: 3,
    in_transit: 4,
    out_for_delivery: 5,
    delivered: 6,
  };
  const finalSubstepPriority = 6;
  const currentPriority = summary?.status
    ? (completedSubstepPriority[summary.status] ?? 0)
    : 0;

  return (
    order.stage === "delivered" &&
    summary?.status === "delivered" &&
    currentPriority >= finalSubstepPriority &&
    Boolean(summary.latestEventAt)
  );
}

const SECTION_DEFS: SectionDef[] = [
  {
    key: "delivery",
    shouldRender: (o) => hasCompletedShipmentLifecycle(o),
    isActive: (o) => hasCompletedShipmentLifecycle(o),
  },
  {
    key: "shipping",
    shouldRender: (o) =>
      !!o.shipmentSummary ||
      o.stage === "shipped" ||
      o.stage === "delivered",
    isActive: (o) => o.stage === "shipped",
  },
  {
    key: "mrp",
    shouldRender: (o) =>
      !!o.mrpRoutedAt ||
      !!o.demoFlow?.mrpPush ||
      o.stage === "pushed_to_mrp",
    isActive: (o) => o.stage === "pushed_to_mrp",
  },
  {
    key: "po",
    shouldRender: (o) =>
      !!o.demoFlow?.poConfirmation ||
      !!o.demoFlow?.quoteComparison ||
      o.stage === "po_received" ||
      o.stage === "po_mismatch",
    isActive: (o) => o.stage === "po_received" || o.stage === "po_mismatch",
  },
  {
    key: "quote",
    shouldRender: (o) =>
      !!o.demoFlow?.quoteSummary ||
      o.stage === "quote_sent",
    isActive: (o) => o.stage === "quote_sent",
  },
  {
    key: "quote_draft",
    shouldRender: (o) =>
      isQuoteBuilder(o) && (
        o.stage === "quote_draft" ||
        hasPassedBomStage(o, "quote_draft")
      ),
    isActive: (o) => o.stage === "quote_draft",
  },
  {
    key: "sku_advisory",
    shouldRender: (o) =>
      !!o.demoFlow?.skuAdvisory &&
      o.stage !== "rfq_received" &&
      o.stage !== "clarification_requested",
    isActive: (o) =>
      !!o.demoFlow?.skuAdvisory && !o.demoFlow.skuAdvisory.selectedCandidateId,
  },
  {
    key: "inventory_check",
    shouldRender: (o) =>
      isQuoteBuilder(o) && (
        o.stage === "inventory_check" ||
        o.stage === "quote_draft" ||
        hasPassedBomStage(o, "inventory_check")
      ),
    isActive: (o) => o.stage === "inventory_check",
  },
  {
    key: "bom_review",
    shouldRender: (o) =>
      isQuoteBuilder(o) && (
        o.stage === "bom_review" ||
        o.stage === "inventory_check" ||
        o.stage === "quote_draft" ||
        hasPassedBomStage(o, "bom_review")
      ),
    isActive: (o) => o.stage === "bom_review",
  },
  {
    key: "clarification",
    shouldRender: (o) =>
      (o.demoFlow?.clarifications?.length ?? 0) > 0 ||
      o.stage === "needs_clarification" ||
      o.stage === "clarification_requested" ||
      o.stage === "clarification_received",
    isActive: (o) => {
      const inClarificationStage =
        o.stage === "needs_clarification" ||
        o.stage === "clarification_requested" ||
        o.stage === "clarification_received";
      if (!inClarificationStage) return false;
      const replyReceived = (o.demoFlow?.clarifications ?? []).some(
        (c) => !!c.replyReceived
      );
      return !replyReceived;
    },
  },
  {
    key: "rfq",
    shouldRender: () => true,
    isActive: (o) => o.stage === "rfq_received",
  },
];

function getSectionTitle(key: SectionKey, order: Order): string {
  switch (key) {
    case "delivery": return "Delivery Confirmed";
    case "shipping": return "Shipment Tracking";
    case "mrp": return "Pushed to ERP";
    case "po": {
      const hasMismatch = order.demoFlow?.quoteComparison && !order.demoFlow.quoteComparison.overallMatch;
      return hasMismatch ? "PO Mismatch" : "PO Confirmed";
    }
    case "quote": {
      const qs = order.demoFlow?.quoteSummary;
      return qs && !qs.sentAt ? "Quote Draft" : "Quote Sent";
    }
    case "quote_draft": return "Quote Builder";
    case "sku_advisory": return "Product Recommendation";
    case "inventory_check": return "Inventory & Procurement";
    case "bom_review": return "BOM & Drawings";
    case "clarification": return "Clarification";
    case "rfq": return "RFQ Received";
    default: return "";
  }
}

function getSectionDate(key: SectionKey, order: Order): string | undefined {
  switch (key) {
    case "delivery":
      return order.shipmentSummary?.latestEventAt;
    case "shipping":
      return order.shipmentSummary?.latestEventAt;
    case "mrp":
      return order.demoFlow?.mrpPush?.pushedAt ?? order.mrpRoutedAt ?? undefined;
    case "po":
      return order.demoFlow?.poConfirmation?.receivedAt;
    case "quote":
      return order.demoFlow?.quoteSummary?.sentAt;
    case "sku_advisory":
      return order.demoFlow?.skuAdvisory?.selectedAt;
    case "quote_draft":
    case "inventory_check":
    case "bom_review":
      return order.createdAt;
    case "clarification": {
      const clarifications = order.demoFlow?.clarifications;
      if (!clarifications?.length) return undefined;
      const last = clarifications[clarifications.length - 1];
      return last.replyReceived?.receivedAt ?? last.emailSent.sentAt;
    }
    case "rfq":
      return order.createdAt;
    default:
      return undefined;
  }
}

function getSectionSummary(key: SectionKey, order: Order): string {
  const flow = order.demoFlow;
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  switch (key) {
    case "delivery": {
      const carrier = order.shipmentSummary?.carrier?.toUpperCase() ?? "Carrier";
      return `Delivered — ${carrier}`;
    }
    case "shipping": {
      const s = order.shipmentSummary;
      if (!s) return "Awaiting shipment";
      const carrier = s.carrier?.toUpperCase() ?? "Carrier";
      const statusLabelMap: Partial<Record<ShipmentStatus, string>> = {
        shipment_created: "In Production",
        label_created: "Ready for Shipping Collection",
        picked_up: "Carrier Pickup Confirmed",
        in_transit: "In Transit",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
      };
      const currentStep = statusLabelMap[s.status] ?? "Processing";
      const parts = [currentStep, `via ${carrier}`];
      if (s.trackingNumber) parts.push(`tracking ${s.trackingNumber}`);
      if (s.estimatedDelivery) {
        parts.push(`ETA ${new Date(s.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      }
      return parts.join(" — ");
    }
    case "mrp": {
      const erpId = flow?.mrpPush?.erpOrderId;
      return erpId ? `Pushed to ERP ${erpId}` : "Order pushed to ERP system";
    }
    case "po": {
      const poNum = flow?.poConfirmation?.poNumber ?? flow?.poNumber ?? order.poNumber ?? "PO";
      const quoteNum = flow?.quoteNumber ?? "Quote";
      const hasMismatch = flow?.quoteComparison && !flow.quoteComparison.overallMatch;
      return hasMismatch
        ? `${poNum} has discrepancies against ${quoteNum}`
        : `${poNum} confirmed against ${quoteNum}`;
    }
    case "quote": {
      const qs = flow?.quoteSummary;
      if (!qs) return `Quote prepared for ${order.customer.company}`;
      return `${qs.quoteNumber} — ${qs.items.length} items, $${fmt(qs.subtotal)} — Sent to ${qs.sentTo}`;
    }
    case "quote_draft": {
      const inv = order.inventoryStatus ?? [];
      const inStock = inv.filter((i) => i.status === "in_stock").length;
      const total = inv.length;
      return `Quote built from ${order.lineItems.length} items — ${inStock} of ${total} components in stock`;
    }
    case "sku_advisory": {
      const sa = flow?.skuAdvisory;
      if (!sa) return "Product recommendation";
      const chosen = sa.candidates.find((c) => c.id === sa.selectedCandidateId);
      if (chosen) return `${chosen.sku} selected — ${chosen.name}`;
      return `${sa.candidates.length} candidate SKUs — 1 recommended`;
    }
    case "inventory_check": {
      const inv = order.inventoryStatus ?? [];
      const inStock = inv.filter((i) => i.status === "in_stock").length;
      const low = inv.filter((i) => i.status === "low").length;
      const out = inv.filter((i) => i.status === "out_of_stock").length;
      return `${inStock} in stock, ${low} low, ${out} out of stock`;
    }
    case "bom_review": {
      const totalComponents = order.lineItems.reduce(
        (sum, li) => sum + (li.bomComponents?.length ?? 0), 0
      );
      const drawings = order.drawings?.length ?? 0;
      return `${order.lineItems.length} items → ${totalComponents} components${drawings > 0 ? `, ${drawings} drawings linked` : ""}`;
    }
    case "clarification": {
      const cl = flow?.clarifications;
      if (!cl?.length) return "Clarification";
      const totalQ = cl.reduce((s, c) => s + c.questions.length, 0);
      const totalA = cl.reduce((s, c) => s + (c.replyReceived?.parsedAnswers.length ?? 0), 0);
      return `${totalQ} questions asked, ${totalA} answered over ${cl.length} round${cl.length > 1 ? "s" : ""}`;
    }
    case "rfq": {
      const total = order.lineItems.length;
      const confirmed = order.lineItems.filter((i) => i.matchStatus === "confirmed").length;
      const needReview = total - confirmed;
      return `${total} items parsed — ${confirmed} confirmed, ${needReview} need review`;
    }
    default:
      return "";
  }
}

export type StageChangeHandler = (newStage: import("@/lib/types").OrderStage, data?: Partial<Order>) => Promise<void>;

interface OrderWorkspaceProps {
  order: Order;
  demoCtx?: DemoContext;
  onStageChange?: StageChangeHandler;
}

export function OrderWorkspace({ order, demoCtx, onStageChange }: OrderWorkspaceProps) {
  const sections: { key: SectionKey; active: boolean }[] = [];
  for (const def of SECTION_DEFS) {
    if (def.shouldRender(order)) {
      sections.push({
        key: def.key,
        active: def.isActive(order),
      });
    }
  }

  return (
    <div>
      {sections.map(({ key, active }, idx) => {
        const isLast = idx === sections.length - 1;
        const title = getSectionTitle(key, order);
        const date = !active ? getSectionDate(key, order) : undefined;
        const summary = !active ? getSectionSummary(key, order) : undefined;
        const mode = active ? "active" : "completed";

        return (
          <TimelineSection
            key={key}
            title={title}
            isActive={active}
            isLast={isLast}
            completedDate={date}
            summary={summary}
          >
            {renderSection(key, order, mode, demoCtx, onStageChange)}
          </TimelineSection>
        );
      })}
    </div>
  );
}

function renderSection(key: SectionKey, order: Order, mode: "active" | "completed", demoCtx?: DemoContext, onStageChange?: StageChangeHandler) {
  switch (key) {
    case "delivery":
      return <OrderDeliveryBanner order={order} />;
    case "shipping":
      return <ShipmentPanel order={order} />;
    case "mrp":
      return <MrpPushSection order={order} mode={mode} />;
    case "po":
      return <PoReceivedSection order={order} mode={mode} demoCtx={demoCtx} />;
    case "quote":
      return <QuoteSentSection order={order} mode={mode} demoCtx={demoCtx} />;
    case "sku_advisory":
      return <SkuRecommendationSection order={order} mode={mode} demoCtx={demoCtx} />;
    case "quote_draft":
      return <QuoteDraftSection order={order} mode={mode} onStageChange={onStageChange} />;
    case "inventory_check":
      return <InventoryCheckSection order={order} mode={mode} onStageChange={onStageChange} />;
    case "bom_review":
      return <BomReviewSection order={order} mode={mode} onStageChange={onStageChange} />;
    case "clarification":
      return <ClarificationSection order={order} mode={mode} />;
    case "rfq":
      return <RfqReceivedSection order={order} mode={mode} demoCtx={demoCtx} onStageChange={onStageChange} />;
    default:
      return null;
  }
}
