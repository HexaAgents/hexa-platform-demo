"use client";

import { useCallback, useEffect, useState } from "react";
import type { Shipment, ShipmentEvent, ShipmentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Package,
  Check,
  ExternalLink,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShipmentWithEvents = {
  shipment: Shipment;
  events: ShipmentEvent[];
};

const SHIPMENT_STAGES: { status: ShipmentStatus; label: string }[] = [
  { status: "shipment_created", label: "Shipment Created" },
  { status: "label_created", label: "Label Created" },
  { status: "picked_up", label: "Picked Up" },
  { status: "in_transit", label: "In Transit" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_PRIORITY: Record<string, number> = {
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

const statusBadgeClass: Record<ShipmentStatus, string> = {
  draft: "border-border bg-muted/50 text-foreground/70",
  shipment_created: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  label_created: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  picked_up: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  in_transit: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  out_for_delivery: "border-orange-500/30 bg-orange-500/10 text-orange-700",
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  exception: "border-red-500/30 bg-red-500/10 text-red-700",
  delayed: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
  returned: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700",
};

function prettyStatus(status: ShipmentStatus): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

const CARRIER_LABELS: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  shipstation: "ShipStation",
  manual: "Manual",
  other: "Other",
};

interface ProcurementShipmentPanelProps {
  poId: string;
  deliveryAddress: string;
}

export default function ProcurementShipmentPanel({ poId, deliveryAddress }: ProcurementShipmentPanelProps) {
  const [data, setData] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipments?poId=${poId}&withEvents=true`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const payload = (await res.json()) as { shipments: ShipmentWithEvents[] };
      if (payload.shipments?.length > 0) {
        setData(payload.shipments[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  if (loading && !data) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Truck className="h-4 w-4" />
          Loading shipment data...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Awaiting Shipment</h3>
            <p className="text-[12px] text-muted-foreground">
              Shipment tracking will appear here once the supplier dispatches the order.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { shipment, events } = data;
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );
  const currentPriority = STATUS_PRIORITY[shipment.status] ?? 0;

  const eventByStatus = new Map<string, ShipmentEvent>();
  for (const ev of sortedEvents) {
    if (!eventByStatus.has(ev.status)) {
      eventByStatus.set(ev.status, ev);
    }
  }

  const latestEtaEvent = [...sortedEvents].reverse().find((e) => e.estimatedDelivery);

  return (
    <div className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-foreground/70" />
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Shipment Tracking</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {CARRIER_LABELS[shipment.carrier] ?? shipment.carrier}
              {shipment.carrierService ? ` — ${shipment.carrierService}` : ""}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] font-semibold", statusBadgeClass[shipment.status])}>
          {prettyStatus(shipment.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-px border-b border-border bg-border md:grid-cols-3">
        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tracking Number</p>
          {shipment.trackingNumber ? (
            shipment.trackingUrl ? (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-700 hover:underline"
              >
                {shipment.trackingNumber}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="mt-1 text-[13px] font-medium font-mono text-foreground/85">
                {shipment.trackingNumber}
              </p>
            )
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">Pending</p>
          )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Estimated Delivery</p>
          {shipment.estimatedDelivery ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-foreground/85">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric",
              })}
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">TBD</p>
          )}
          {latestEtaEvent && latestEtaEvent.estimatedDelivery !== shipment.estimatedDelivery && (
            <p className="mt-0.5 text-[11px] text-amber-700">
              Updated from {new Date(latestEtaEvent.estimatedDelivery!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Ship To</p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-foreground/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{deliveryAddress}</span>
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tracking Timeline</p>
        <div className="space-y-0">
          {[...SHIPMENT_STAGES].reverse().map((stage, idx, arr) => {
            const stagePriority = STATUS_PRIORITY[stage.status] ?? 0;
            const matchedEvent = eventByStatus.get(stage.status);
            const isCompleted = stagePriority < currentPriority;
            const isActive = stage.status === shipment.status;
            const isPending = stagePriority > currentPriority;
            const isLast = idx === arr.length - 1;

            return (
              <div key={stage.status}>
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
                        <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                      </div>
                    ) : isActive ? (
                      <div className="h-[18px] w-[18px]" />
                    ) : (
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-none border border-muted-foreground/20 bg-muted/30" />
                    )}
                  </div>
                  <div>
                    <p className={cn("text-[13px] font-medium leading-5", isPending ? "text-muted-foreground/50" : "text-foreground/85")}>
                      {stage.label}
                    </p>
                    {matchedEvent && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(matchedEvent.occurredAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    )}
                    {matchedEvent?.message && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{matchedEvent.message}</p>
                    )}
                    {matchedEvent?.trackingNumber && stage.status === "label_created" && (
                      <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                        Tracking: {matchedEvent.trackingNumber}
                      </p>
                    )}
                    {matchedEvent?.estimatedDelivery && stage.status === "in_transit" && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Est. delivery: {new Date(matchedEvent.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className="ml-[8px] h-5">
                    <div className="h-full border-l-[1.5px] border-dashed border-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(shipment.status === "exception" || shipment.status === "delayed") && (
          <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-amber-800">
                {shipment.status === "exception" ? "Shipment Exception" : "Shipment Delayed"}
              </p>
              {sortedEvents
                .filter((e) => e.status === "exception" || e.status === "delayed")
                .slice(-1)
                .map((e) => (
                  <p key={e.id} className="mt-0.5 text-[11px] text-amber-700/80">
                    {e.message || `Status changed to ${prettyStatus(e.status)}`}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
