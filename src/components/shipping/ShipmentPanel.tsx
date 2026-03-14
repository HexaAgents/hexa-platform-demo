"use client";

import { useCallback, useEffect, useState } from "react";
import { Order, Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/types";
import ShipmentTrackingPanel, {
  ShipmentTrackingLoading,
  ShipmentTrackingEmpty,
  type TrackingStage,
} from "./ShipmentTrackingPanel";

type ShipmentWithEvents = {
  shipment: Shipment;
  events: ShipmentEvent[];
};

const ORDERS_STAGES: TrackingStage[] = [
  {
    id: "in_production",
    label: "In Production",
    eventStatus: "shipment_created",
    description:
      "Order is being manufactured and prepared for shipment.",
  },
  {
    id: "ready_for_collection",
    label: "Ready for Shipping Collection",
    eventStatus: "label_created",
    description:
      "Production complete — packaged and staged for carrier pickup.",
  },
  {
    id: "picked_up",
    label: "Carrier Pickup Confirmed",
    eventStatus: "picked_up",
    description: "Carrier has collected the shipment from the facility.",
  },
  {
    id: "in_transit",
    label: "In Transit",
    eventStatus: "in_transit",
    description: "Shipment is moving through the carrier network.",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    eventStatus: "out_for_delivery",
    description:
      "On the local delivery vehicle for final drop-off today.",
  },
  {
    id: "delivered",
    label: "Delivered",
    eventStatus: "delivered",
    description: "Shipment has been delivered and signed for.",
  },
];

function buildSummaryEvents(
  status: ShipmentStatus,
  latestEventAt: string,
): ShipmentEvent[] {
  const STATUS_PRIORITY: Record<string, number> = {
    shipment_created: 1,
    label_created: 2,
    picked_up: 3,
    in_transit: 4,
    out_for_delivery: 5,
    delivered: 6,
  };
  const currentPriority = STATUS_PRIORITY[status] ?? 0;
  const events: ShipmentEvent[] = [];
  const baseTime = new Date(latestEventAt).getTime();

  for (const stage of ORDERS_STAGES) {
    const stagePriority = STATUS_PRIORITY[stage.eventStatus] ?? 0;
    if (stagePriority > currentPriority) break;
    const offset = (currentPriority - stagePriority) * 2000;
    events.push({
      id: `summary-evt-${stage.eventStatus}`,
      shipmentId: "summary",
      type: "shipment_status_updated",
      status: stage.eventStatus,
      source: "carrier_api",
      occurredAt: new Date(baseTime - offset).toISOString(),
      idempotencyKey: `summary-${stage.eventStatus}`,
      message: stage.label,
    });
  }
  return events;
}

export default function ShipmentPanel({ order }: { order: Order }) {
  const [data, setData] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(false);

  const showTrackingSection =
    order.stage === "pushed_to_mrp" ||
    order.stage === "shipped" ||
    order.stage === "delivered";

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipments?orderId=${order.id}&withEvents=true`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const payload = (await res.json()) as {
        shipments: ShipmentWithEvents[];
      };
      if (payload.shipments?.length > 0) {
        setData(payload.shipments[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [order.id]);

  useEffect(() => {
    if (showTrackingSection) {
      void loadShipments();
    }
  }, [loadShipments, showTrackingSection]);

  if (!showTrackingSection) return null;

  if (loading && !data) {
    return <ShipmentTrackingLoading />;
  }

  const shipTo = order.shipTo || order.customer.shippingAddress;

  if (!data) {
    const summary = order.shipmentSummary;

    if (!summary) {
      return (
        <ShipmentTrackingEmpty message="Shipment tracking will appear here once the order is dispatched from the warehouse." />
      );
    }

    return (
      <ShipmentTrackingPanel
        stages={ORDERS_STAGES}
        shipmentStatus={summary.status}
        carrier={summary.carrier}
        trackingNumber={summary.trackingNumber}
        estimatedDelivery={summary.estimatedDelivery}
        shipTo={shipTo}
        events={buildSummaryEvents(summary.status, summary.latestEventAt)}
      />
    );
  }

  const { shipment, events } = data;

  return (
    <ShipmentTrackingPanel
      stages={ORDERS_STAGES}
      shipmentStatus={shipment.status}
      carrier={shipment.carrier}
      carrierService={shipment.carrierService}
      trackingNumber={shipment.trackingNumber}
      trackingUrl={shipment.trackingUrl}
      estimatedDelivery={shipment.estimatedDelivery}
      shipTo={shipTo}
      events={events}
    />
  );
}
