import { createHash, randomUUID } from "crypto";
import {
  NotificationStatus,
  Shipment,
  ShipmentEvent,
  ShipmentEventType,
  ShipmentSource,
  ShipmentStatus,
  ShippingCarrier,
} from "@/lib/types";
import {
  addShipmentEvent,
  addShipmentNotification,
  getShipmentById,
  getShipmentEvents,
  getShippingMetrics,
  hasIdempotencyKey,
  incrementShippingMetric,
  markIdempotencyKey,
  saveShipment,
} from "@/lib/shipping-store";
import { getOrderById, setOrderShipmentSummary, updateOrder } from "@/lib/store";
import { OrderStage } from "@/lib/types";

const STAGE_PRIORITY: Record<OrderStage, number> = {
  needs_clarification: 0,
  clarification_requested: 1,
  clarification_received: 2,
  rfq_received: 3,
  quote_sent: 4,
  po_received: 5,
  po_mismatch: 5,
  pushed_to_mrp: 6,
  shipped: 8,
  delivered: 9,
};

function orderStageForShipmentStatus(status: ShipmentStatus): OrderStage | null {
  if (status === "delivered") return "delivered";
  if (
    status === "shipment_created" ||
    status === "label_created" ||
    status === "picked_up" ||
    status === "in_transit" ||
    status === "out_for_delivery"
  ) {
    return "shipped";
  }
  return null;
}

const STATUS_PRIORITY: Record<ShipmentStatus, number> = {
  draft: 0,
  shipment_created: 1,
  label_created: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
  exception: 5,
  delayed: 5,
  returned: 6,
  cancelled: 6,
};

function eventTypeForStatus(status: ShipmentStatus): ShipmentEventType {
  if (status === "delivered") return "shipment_delivered";
  if (status === "exception" || status === "delayed") return "shipment_exception";
  return "shipment_status_updated";
}

function shouldNotify(status: ShipmentStatus): boolean {
  return [
    "shipment_created",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "exception",
    "delayed",
  ].includes(status);
}

function createIdempotencyKey(input: Record<string, unknown>): string {
  const payload = JSON.stringify(input);
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

export function getTrackingUrl(
  carrier: ShippingCarrier,
  trackingNumber?: string
): string | undefined {
  if (!trackingNumber) return undefined;
  const encoded = encodeURIComponent(trackingNumber);
  if (carrier === "ups") return `https://www.ups.com/track?tracknum=${encoded}`;
  if (carrier === "fedex")
    return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  if (carrier === "dhl")
    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encoded}`;
  if (carrier === "shipstation")
    return `https://ss.shipstation.com/track/${encoded}`;
  return undefined;
}

function validateTransition(current: ShipmentStatus, next: ShipmentStatus): void {
  if (current === next) return;
  if (current === "cancelled" || current === "returned" || current === "delivered") {
    throw new Error(`Cannot transition from terminal state '${current}'`);
  }
  if (next === "delivered" && STATUS_PRIORITY[current] < STATUS_PRIORITY.in_transit) {
    throw new Error("Cannot mark shipment as delivered before in_transit");
  }
}

type UpsertShipmentInput = {
  shipmentId?: string;
  orderId?: string;
  poId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  carrier: ShippingCarrier;
  carrierService?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  status: ShipmentStatus;
  source: ShipmentSource;
  occurredAt?: string;
  carrierEventId?: string;
  idempotencyKey?: string;
  message?: string;
  rawPayload?: Record<string, unknown>;
};

export async function upsertShipmentFromEvent(input: UpsertShipmentInput): Promise<{
  shipment: Shipment;
  event: ShipmentEvent;
  duplicate: boolean;
}> {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const idempotencyKey =
    input.idempotencyKey ??
    createIdempotencyKey({
      shipmentId: input.shipmentId,
      orderId: input.orderId,
      poId: input.poId,
      carrierEventId: input.carrierEventId,
      status: input.status,
      trackingNumber: input.trackingNumber,
      estimatedDelivery: input.estimatedDelivery,
      occurredAt: occurredAt.slice(0, 16),
    });

  const isDuplicate = await hasIdempotencyKey(idempotencyKey);
  if (isDuplicate) {
    await incrementShippingMetric("duplicateSuppressed");
    let existing: Shipment | undefined;
    if (input.shipmentId) existing = await getShipmentById(input.shipmentId);
    if (!existing && input.orderId) {
      const events = await getShipmentEvents();
      const match = events.find(
        (event) =>
          event.idempotencyKey === idempotencyKey || event.trackingNumber === input.trackingNumber
      );
      if (match) existing = await getShipmentById(match.shipmentId);
    }
    if (!existing) {
      throw new Error("Duplicate event received but shipment was not found");
    }
    const duplicateEvent: ShipmentEvent = {
      id: `se-${randomUUID()}`,
      shipmentId: existing.id,
      type: eventTypeForStatus(input.status),
      status: existing.status,
      source: input.source,
      occurredAt,
      idempotencyKey,
      carrierEventId: input.carrierEventId,
      message: "Duplicate event suppressed",
      trackingNumber: existing.trackingNumber,
      estimatedDelivery: existing.estimatedDelivery,
      rawPayload: input.rawPayload,
    };
    return { shipment: existing, event: duplicateEvent, duplicate: true };
  }

  const now = new Date().toISOString();
  const shipmentId = input.shipmentId ?? `shp-${randomUUID()}`;
  const existing = await getShipmentById(shipmentId);
  if (existing) {
    validateTransition(existing.status, input.status);
  }

  const shipment: Shipment = {
    id: shipmentId,
    orderId: input.orderId ?? existing?.orderId,
    poId: input.poId ?? existing?.poId,
    orderNumber: input.orderNumber ?? existing?.orderNumber ?? "UNKNOWN",
    customerName: input.customerName ?? existing?.customerName ?? "Customer",
    customerEmail: input.customerEmail ?? existing?.customerEmail,
    carrier: input.carrier ?? existing?.carrier ?? "manual",
    carrierService: input.carrierService ?? existing?.carrierService,
    status: input.status,
    source: input.source,
    trackingNumber: input.trackingNumber ?? existing?.trackingNumber,
    trackingUrl: getTrackingUrl(
      input.carrier ?? existing?.carrier ?? "manual",
      input.trackingNumber ?? existing?.trackingNumber
    ),
    estimatedDelivery: input.estimatedDelivery ?? existing?.estimatedDelivery,
    lastEventAt: occurredAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    notificationStatus: "queued",
  };

  const event: ShipmentEvent = {
    id: `se-${randomUUID()}`,
    shipmentId: shipment.id,
    type: input.status === "shipment_created" ? "shipment_created" : eventTypeForStatus(input.status),
    status: input.status,
    source: input.source,
    occurredAt,
    idempotencyKey,
    carrierEventId: input.carrierEventId,
    message: input.message,
    trackingNumber: shipment.trackingNumber,
    estimatedDelivery: shipment.estimatedDelivery,
    rawPayload: input.rawPayload,
  };

  await saveShipment(shipment);
  await addShipmentEvent(event);
  await markIdempotencyKey(idempotencyKey);
  await incrementShippingMetric("shipmentEventsProcessed");

  if (shipment.orderId) {
    await setOrderShipmentSummary(shipment.orderId, {
      shipmentId: shipment.id,
      status: shipment.status,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      estimatedDelivery: shipment.estimatedDelivery,
      latestEventAt: shipment.lastEventAt,
    });

    const newStage = orderStageForShipmentStatus(shipment.status);
    if (newStage) {
      const order = await getOrderById(shipment.orderId);
      if (order && STAGE_PRIORITY[newStage] > STAGE_PRIORITY[order.stage]) {
        await updateOrder({ ...order, stage: newStage });
      }
    }
  }

  return { shipment, event, duplicate: false };
}

export async function markNotificationOutcome(params: {
  shipmentId: string;
  recipient: string;
  eventType: ShipmentEventType;
  status: NotificationStatus;
  errorMessage?: string;
}): Promise<void> {
  await addShipmentNotification({
    id: `sn-${randomUUID()}`,
    shipmentId: params.shipmentId,
    status: params.status,
    recipient: params.recipient,
    eventType: params.eventType,
    errorMessage: params.errorMessage,
    sentAt: new Date().toISOString(),
  });

  if (params.status === "sent") {
    await incrementShippingMetric("notificationSent");
  } else if (params.status === "failed") {
    await incrementShippingMetric("notificationFailed");
  } else if (params.status === "suppressed_duplicate") {
    await incrementShippingMetric("duplicateSuppressed");
  }
}

export function shouldSendNotificationForStatus(status: ShipmentStatus): boolean {
  return shouldNotify(status);
}

export async function getShippingHealthSnapshot() {
  const metrics = await getShippingMetrics();
  const notificationsFailedRate =
    metrics.notificationSent + metrics.notificationFailed > 0
      ? metrics.notificationFailed /
        (metrics.notificationSent + metrics.notificationFailed)
      : 0;
  return {
    metrics,
    notificationsFailedRate,
  };
}
