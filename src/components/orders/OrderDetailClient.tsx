"use client";

import { Badge } from "@/components/ui/badge";
import { OrderWorkspace } from "@/components/OrderWorkspace";
import type { DemoContext } from "@/components/OrderWorkspace";
import { useOrderDemoFlow } from "@/hooks/useOrderDemoFlow";
import type { Order, OrderStage } from "@/lib/types";
import {
  AlertTriangle,
  Calendar,
  Mail,
  Truck,
  CreditCard,
} from "lucide-react";

const DETAIL_STAGE_CONFIG: Record<OrderStage, { label: string; className: string }> = {
  needs_clarification: {
    label: "Needs Clarification",
    className: "border-red-500/30 bg-red-500/10 text-red-700",
  },
  clarification_requested: {
    label: "Clarification Requested",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  clarification_received: {
    label: "Clarification Received",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  rfq_received: {
    label: "RFQ Received",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  quote_sent: {
    label: "Quote Sent",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  },
  quote_prepared: {
    label: "Quote Prepared",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  },
  po_received: {
    label: "PO Received",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  po_validated: {
    label: "PO Validated",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  po_mismatch: {
    label: "PO Mismatch",
    className: "border-red-500/30 bg-red-500/10 text-red-700",
  },
  pushed_to_mrp: {
    label: "Pushed to MRP",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  shipped: {
    label: "Shipped",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  delivered: {
    label: "Delivered",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
};

const DEMO_BADGE_MAP: Record<string, { label: string; className: string }> = {
  clarification_sent:   { label: "RFQ Received",         className: "border-blue-500/30 bg-blue-500/10 text-blue-700" },
  clarification_reply:  { label: "Awaiting Clarification", className: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  quote_sent:           { label: "Quote Draft",            className: "border-violet-500/30 bg-violet-500/10 text-violet-700" },
  po_received_mismatch: { label: "Quote Sent",             className: "border-violet-500/30 bg-violet-500/10 text-violet-700" },
  correction_sent:      { label: "PO Mismatch",            className: "border-red-500/30 bg-red-500/10 text-red-700" },
  po_received_match:    { label: "Awaiting Revised PO",    className: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  pushed_to_mrp:        { label: "PO Confirmed",           className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
  shipping_in_production:        { label: "In Production",          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
  shipping_ready_for_collection: { label: "In Production",          className: "border-blue-500/30 bg-blue-500/10 text-blue-700" },
  shipping_pickup:               { label: "Ready for Collection",   className: "border-blue-500/30 bg-blue-500/10 text-blue-700" },
  shipping_in_transit:           { label: "Pickup Confirmed",       className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700" },
  shipping_out_for_delivery:     { label: "In Transit",             className: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  shipping_delivered:            { label: "Out for Delivery",       className: "border-orange-500/30 bg-orange-500/10 text-orange-700" },
  complete:                      { label: "Delivered",              className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
};

interface Props {
  order: Order;
  leftPanel: React.ReactNode | null;
}

export function OrderDetailClient({ order: initialOrder, leftPanel }: Props) {
  const demo = useOrderDemoFlow(initialOrder);
  const order = demo.order;

  const demoBadge = demo.isDemoActive ? DEMO_BADGE_MAP[demo.currentStepId] : undefined;
  const config = demoBadge ?? DETAIL_STAGE_CONFIG[order.stage] ?? {
    label: order.stage ?? "Unknown",
    className: "border-border bg-muted/40 text-muted-foreground",
  };
  const itemsNeedingAction = (order.lineItems ?? []).filter(
    (i) => i.matchStatus !== "confirmed"
  ).length;

  const demoCtx: DemoContext | undefined = demo.isDemoActive
    ? { stepId: demo.currentStepId, advance: demo.advance, isAutoProgressing: demo.isAutoProgressing }
    : undefined;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[18px] font-medium leading-none text-foreground">
              {order.customer?.company ?? "Unknown Company"}
            </h1>
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
            <span className="font-mono">{order.orderNumber}</span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {order.emailSubject}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {order.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Due {order.dueDate}
              </span>
            )}
            {order.paymentTerms && (
              <span className="inline-flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                {order.paymentTerms}
              </span>
            )}
            {order.shipVia && (
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                {order.shipVia}
              </span>
            )}
          </div>
        </div>

        {order.stage !== "pushed_to_mrp" &&
          order.stage !== "shipped" &&
          order.stage !== "delivered" &&
          itemsNeedingAction > 0 && (
          <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-[13px] font-medium text-amber-700">
              {itemsNeedingAction} item{itemsNeedingAction !== 1 ? "s" : ""} need
              {itemsNeedingAction === 1 ? "s" : ""} your review
            </span>
          </div>
        )}
      </div>

      {leftPanel ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
          <div className="xl:col-span-2">
            {leftPanel}
          </div>
          <div className="xl:col-span-3">
            <OrderWorkspace order={order} demoCtx={demoCtx} />
          </div>
        </div>
      ) : (
        <div>
          <OrderWorkspace order={order} demoCtx={demoCtx} />
        </div>
      )}
    </>
  );
}
