"use client";

import { useCallback, useEffect, useState } from "react";
import type { Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/types";
import type { ProcurementDemoShipment } from "@/lib/procurement-types";
import ShipmentTrackingPanel, {
  ShipmentTrackingLoading,
  ShipmentTrackingEmpty,
  type TrackingStage,
} from "@/components/shipping/ShipmentTrackingPanel";

type ShipmentWithEvents = {
  shipment: Shipment;
  events: ShipmentEvent[];
};

export const PROCUREMENT_STAGES: TrackingStage[] = [
  {
    id: "po_sent",
    label: "PO Sent",
    eventStatus: "draft",
    description: "Purchase order sent to supplier — awaiting shipment.",
  },
  {
    id: "shipment_created",
    label: "Shipment Created",
    eventStatus: "shipment_created",
    description: "Supplier has created a shipment for this order.",
  },
  {
    id: "label_created",
    label: "Label Created",
    eventStatus: "label_created",
    description: "Shipping label generated — awaiting carrier pickup.",
  },
  {
    id: "picked_up",
    label: "Picked Up",
    eventStatus: "picked_up",
    description: "Carrier has picked up the shipment from the supplier.",
  },
  {
    id: "in_transit",
    label: "In Transit",
    eventStatus: "in_transit",
    description: "Shipment is in transit to your facility.",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    eventStatus: "out_for_delivery",
    description: "On the local delivery vehicle for final drop-off today.",
  },
  {
    id: "delivered",
    label: "Delivered",
    eventStatus: "delivered",
    description: "Shipment has been delivered and received at your dock.",
  },
];

const STATUS_PRIORITY: Record<string, number> = {
  draft: 0,
  shipment_created: 1,
  label_created: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
};

function buildSyntheticEvents(
  demo: ProcurementDemoShipment,
): ShipmentEvent[] {
  const currentPriority = STATUS_PRIORITY[demo.status] ?? 0;
  const events: ShipmentEvent[] = [];
  const baseTime = new Date(demo.latestEventAt).getTime();

  for (const stage of PROCUREMENT_STAGES) {
    const stagePriority = STATUS_PRIORITY[stage.eventStatus] ?? 0;
    if (stagePriority > currentPriority) break;
    const offset = (currentPriority - stagePriority) * 2000;
    events.push({
      id: `demo-evt-${stage.eventStatus}`,
      shipmentId: demo.shipmentId,
      type: "shipment_status_updated",
      status: stage.eventStatus,
      source: "carrier_api",
      occurredAt: new Date(baseTime - offset).toISOString(),
      idempotencyKey: `demo-${stage.eventStatus}-${demo.shipmentId}`,
      message: stage.label,
    });
  }

  return events;
}

interface ProcurementShipmentPanelProps {
  poId: string;
  deliveryAddress: string;
  demoShipment?: ProcurementDemoShipment;
}

export default function ProcurementShipmentPanel({
  poId,
  deliveryAddress,
  demoShipment,
}: ProcurementShipmentPanelProps) {
  const [data, setData] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(!demoShipment);

  const loadShipments = useCallback(async () => {
    if (demoShipment) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipments?poId=${poId}&withEvents=true`,
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
  }, [poId, demoShipment]);

  useEffect(() => {
    if (!demoShipment) {
      void loadShipments();
    }
  }, [loadShipments, demoShipment]);

  const hasData = demoShipment || data;

  if (loading && !hasData) {
    return <ShipmentTrackingLoading />;
  }

  if (!hasData) {
    return (
      <ShipmentTrackingEmpty message="Shipment tracking will appear here once the supplier dispatches the order." />
    );
  }

  const shipmentStatus: ShipmentStatus =
    demoShipment?.status ?? data?.shipment.status ?? "draft";
  const carrier = demoShipment?.carrier ?? data?.shipment.carrier ?? "";
  const trackingNumber =
    demoShipment?.trackingNumber ?? data?.shipment.trackingNumber;
  const estimatedDelivery =
    demoShipment?.estimatedDelivery ?? data?.shipment.estimatedDelivery;
  const trackingUrl = data?.shipment.trackingUrl;
  const carrierService = data?.shipment.carrierService;
  const events: ShipmentEvent[] = demoShipment
    ? buildSyntheticEvents(demoShipment)
    : data?.events ?? [];

  return (
    <ShipmentTrackingPanel
      stages={PROCUREMENT_STAGES}
      shipmentStatus={shipmentStatus}
      carrier={carrier}
      carrierService={carrierService}
      trackingNumber={trackingNumber}
      trackingUrl={trackingUrl}
      estimatedDelivery={estimatedDelivery}
      shipTo={deliveryAddress}
      events={events}
    />
  );
}
