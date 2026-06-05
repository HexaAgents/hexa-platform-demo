"use client";

import { useState, useCallback, useEffect } from "react";
import { OrderWorkspace } from "@/components/OrderWorkspace";
import type { DemoContext } from "@/components/OrderWorkspace";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { OrderProcessBar } from "./OrderProcessBar";
import { useOrderDemoFlow } from "@/hooks/useOrderDemoFlow";
import type { Order, OrderStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api-base";
import {
  AlertTriangle,
  Calendar,
  Mail,
  Truck,
  CreditCard,
} from "lucide-react";

const DETAIL_STAGE_CONFIG: Record<OrderStage, { label: string; dot: string }> = {
  needs_clarification:     { label: "Needs Clarification",    dot: "bg-red-500" },
  clarification_requested: { label: "Clarification Requested", dot: "bg-amber-500" },
  clarification_received:  { label: "Clarification Received",  dot: "bg-blue-500" },
  rfq_received:            { label: "RFQ Received",            dot: "bg-blue-500" },
  bom_review:              { label: "BOM Review",              dot: "bg-violet-500" },
  inventory_check:         { label: "Inventory Check",         dot: "bg-amber-500" },
  quote_draft:             { label: "Quote Draft",             dot: "bg-violet-500" },
  quote_sent:              { label: "Quote Sent",              dot: "bg-violet-500" },
  quote_prepared:          { label: "Quote Prepared",          dot: "bg-violet-500" },
  po_received:             { label: "PO Received",             dot: "bg-blue-500" },
  po_validated:            { label: "PO Validated",            dot: "bg-emerald-500" },
  po_mismatch:             { label: "PO Mismatch",            dot: "bg-red-500" },
  pushed_to_mrp:           { label: "Pushed to MRP",          dot: "bg-emerald-500" },
  shipped:                 { label: "Shipped",                 dot: "bg-emerald-500" },
  delivered:               { label: "Delivered",               dot: "bg-emerald-500" },
};

const DEMO_BADGE_MAP: Record<string, { label: string; dot: string }> = {
  create_quote:                  { label: "RFQ Received",          dot: "bg-blue-500" },
  clarification_sent:            { label: "RFQ Received",          dot: "bg-blue-500" },
  clarification_reply:           { label: "Awaiting Clarification", dot: "bg-amber-500" },
  adv_select_sku:                { label: "Sourcing SKUs",         dot: "bg-blue-500" },
  quote_sent:                    { label: "Quote Draft",           dot: "bg-violet-500" },
  po_received_mismatch:          { label: "Quote Sent",            dot: "bg-violet-500" },
  correction_sent:               { label: "PO Mismatch",          dot: "bg-red-500" },
  po_received_match:             { label: "Awaiting Revised PO",   dot: "bg-amber-500" },
  pushed_to_mrp:                 { label: "PO Confirmed",         dot: "bg-emerald-500" },
  shipping_in_production:        { label: "In Production",         dot: "bg-emerald-500" },
  shipping_ready_for_collection: { label: "In Production",         dot: "bg-blue-500" },
  shipping_pickup:               { label: "Ready for Collection",  dot: "bg-blue-500" },
  shipping_in_transit:           { label: "Pickup Confirmed",      dot: "bg-blue-500" },
  shipping_out_for_delivery:     { label: "In Transit",            dot: "bg-amber-500" },
  shipping_delivered:            { label: "Out for Delivery",      dot: "bg-amber-500" },
  complete:                      { label: "Delivered",             dot: "bg-emerald-500" },
};

interface Props {
  order: Order;
  showLeftPanel?: boolean;
}

export function OrderDetailClient({ order: initialOrder, showLeftPanel = false }: Props) {
  const [currentOrder, setCurrentOrder] = useState<Order>(initialOrder);
  const [manualStage, setManualStage] = useState(false);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const demo = useOrderDemoFlow(currentOrder);
  const order = manualStage ? currentOrder : (demo.isDemoActive ? demo.order : currentOrder);

  const handleStageChange = useCallback(async (newStage: OrderStage, data?: Partial<Order>) => {
    const payload = { stage: newStage, ...data };
    await fetch(apiUrl(`/api/orders/${currentOrder.id}/stage`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setCurrentOrder((prev) => ({ ...prev, ...payload, stage: newStage }));
    setManualStage(true);
    setWorkspaceKey((k) => k + 1);
  }, [currentOrder.id]);

  useEffect(() => {
    if (demo.isDemoActive && manualStage && !demo.isComplete) {
      setManualStage(false);
    }
  }, [demo.isDemoActive, demo.isComplete, manualStage]);

  const demoBadge = demo.isDemoActive ? DEMO_BADGE_MAP[demo.currentStepId] : undefined;
  const config = demoBadge ?? DETAIL_STAGE_CONFIG[order.stage] ?? {
    label: order.stage ?? "Unknown",
    dot: "bg-muted-foreground",
  };
  const itemsNeedingAction = (order.lineItems ?? []).filter(
    (i) => i.matchStatus !== "confirmed"
  ).length;

  const demoCtx: DemoContext | undefined = demo.isDemoActive
    ? { stepId: demo.currentStepId, advance: demo.advance, advanceWith: demo.advanceWith, isAutoProgressing: demo.isAutoProgressing }
    : undefined;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[18px] font-medium leading-none text-foreground">
              {order.customer?.company ?? "Unknown Company"}
            </h1>
            <span className="inline-flex items-center gap-2 border border-border bg-muted/40 px-2.5 py-1 text-[12px] font-medium text-foreground/80">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
              {config.label}
            </span>
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

      <OrderProcessBar order={order} onStageChange={handleStageChange} />

      {showLeftPanel ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <div className="border border-border bg-card p-6 shadow-sm">
              <AttachmentViewer attachments={order.attachments ?? []} />
            </div>
          </div>
          <div className="xl:col-span-3">
            <OrderWorkspace key={workspaceKey} order={order} demoCtx={demoCtx} onStageChange={handleStageChange} />
          </div>
        </div>
      ) : (
        <div>
          <OrderWorkspace key={workspaceKey} order={order} demoCtx={demoCtx} onStageChange={handleStageChange} />
        </div>
      )}
    </>
  );
}
