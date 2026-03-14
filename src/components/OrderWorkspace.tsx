"use client";

import { Order, ShipmentStatus } from "@/lib/types";
import { TimelineSection } from "./orders/TimelineSection";
import { RfqReceivedSection } from "./orders/RfqReceivedSection";
import { ClarificationSection } from "./orders/ClarificationSection";
import { QuoteSentSection } from "./orders/QuoteSentSection";
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
  | "clarification"
  | "rfq";

export interface DemoContext {
  stepId: string;
  advance: () => void;
  isAutoProgressing: boolean;
}

interface SectionDef {
  key: SectionKey;
  shouldRender: (order: Order) => boolean;
  isActive: (order: Order) => boolean;
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
    key: "clarification",
    shouldRender: (o) =>
      (o.demoFlow?.clarifications?.length ?? 0) > 0 ||
      o.stage === "needs_clarification" ||
      o.stage === "clarification_requested" ||
      o.stage === "clarification_received",
    isActive: (o) =>
      o.stage === "needs_clarification" ||
      o.stage === "clarification_requested" ||
      o.stage === "clarification_received",
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
    case "mrp": return "Pushed to MRP";
    case "po": {
      const hasMismatch = order.demoFlow?.quoteComparison && !order.demoFlow.quoteComparison.overallMatch;
      return hasMismatch ? "PO Mismatch" : "PO Confirmed";
    }
    case "quote": {
      const qs = order.demoFlow?.quoteSummary;
      return qs && !qs.sentAt ? "Quote Draft" : "Quote Sent";
    }
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
      return erpId ? `Pushed to ERP ${erpId}` : "Order pushed to MRP/ERP system";
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

interface OrderWorkspaceProps {
  order: Order;
  demoCtx?: DemoContext;
}

export function OrderWorkspace({ order, demoCtx }: OrderWorkspaceProps) {
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
      {demoCtx && (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            Live Demo
          </span>
          {demoCtx.isAutoProgressing && (
            <span className="text-[11px] text-muted-foreground animate-pulse">
              Waiting for response...
            </span>
          )}
        </div>
      )}
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
            {renderSection(key, order, mode, demoCtx)}
          </TimelineSection>
        );
      })}
    </div>
  );
}

function renderSection(key: SectionKey, order: Order, mode: "active" | "completed", demoCtx?: DemoContext) {
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
    case "clarification":
      return <ClarificationSection order={order} mode={mode} />;
    case "rfq":
      return <RfqReceivedSection order={order} mode={mode} demoCtx={demoCtx} />;
    default:
      return null;
  }
}
