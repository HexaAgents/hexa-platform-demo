"use client";

import type { ShipmentEvent, ShipmentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Package,
  ExternalLink,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TrackingStage = {
  id: string;
  label: string;
  eventStatus: ShipmentStatus;
  description?: string;
};

export interface ShipmentTrackingPanelProps {
  stages: TrackingStage[];
  shipmentStatus: ShipmentStatus;
  carrier: string;
  carrierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shipTo: string;
  events: ShipmentEvent[];
}

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

export const CARRIER_LABELS: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  shipstation: "ShipStation",
  manual: "Manual",
  other: "Other",
};

function prettyStatus(status: ShipmentStatus): string {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getCurrentStage(
  stages: TrackingStage[],
  status?: ShipmentStatus,
): TrackingStage | undefined {
  if (!status) return undefined;
  return stages.find((s) => s.eventStatus === status);
}

function CurrentStepCard({
  stages,
  status,
  carrier,
  trackingNumber,
  eta,
}: {
  stages: TrackingStage[];
  status?: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  eta?: string;
}) {
  const stage = getCurrentStage(stages, status);
  if (!stage) return null;

  const description = stage.description ?? "";
  const stepNumber = stages.indexOf(stage) + 1;
  const totalSteps = stages.length;
  const isDelivered = stage.eventStatus === "delivered";

  const badgeClass = isDelivered
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-blue-500/30 bg-blue-500/10 text-blue-700";

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="text-[14px] font-semibold text-foreground">
          {stage.label}
        </h4>
        <Badge
          variant="outline"
          className={cn("text-[10px] font-semibold", badgeClass)}
        >
          {stepNumber}/{totalSteps}
        </Badge>
      </div>
      {description && (
        <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        {carrier && <span>{carrier}</span>}
        {trackingNumber && <span className="font-mono">{trackingNumber}</span>}
        {eta && (
          <span>
            ETA{" "}
            {new Date(eta).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export function ShipmentTrackingLoading() {
  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Truck className="h-4 w-4" />
        Loading shipment data...
      </div>
    </div>
  );
}

export function ShipmentTrackingEmpty({
  message,
}: {
  message?: string;
}) {
  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">
            Awaiting Shipment
          </h3>
          <p className="text-[12px] text-muted-foreground">
            {message ??
              "Shipment tracking will appear here once the order is dispatched."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentTrackingPanel({
  stages,
  shipmentStatus,
  carrier,
  carrierService,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  shipTo,
  events,
}: ShipmentTrackingPanelProps) {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  const latestEtaEvent = [...sortedEvents]
    .reverse()
    .find((e) => e.estimatedDelivery);

  const carrierLabel = CARRIER_LABELS[carrier] ?? carrier;

  return (
    <div className="border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-foreground/70" />
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">
              Shipment Tracking
            </h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {carrierLabel}
              {carrierService ? ` — ${carrierService}` : ""}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-semibold",
            statusBadgeClass[shipmentStatus],
          )}
        >
          {prettyStatus(shipmentStatus)}
        </Badge>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-px border-b border-border bg-border md:grid-cols-3">
        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tracking Number
          </p>
          {trackingNumber ? (
            trackingUrl ? (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-700 hover:underline"
              >
                {trackingNumber}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="mt-1 text-[13px] font-medium font-mono text-foreground/85">
                {trackingNumber}
              </p>
            )
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">Pending</p>
          )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Estimated Delivery
          </p>
          {estimatedDelivery ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-foreground/85">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(estimatedDelivery).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">TBD</p>
          )}
          {latestEtaEvent &&
            latestEtaEvent.estimatedDelivery !== estimatedDelivery && (
              <p className="mt-0.5 text-[11px] text-amber-700">
                Updated from{" "}
                {new Date(
                  latestEtaEvent.estimatedDelivery!,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
        </div>

        <div className="bg-card px-6 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Ship To
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-foreground/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{shipTo}</span>
          </p>
        </div>
      </div>

      {/* Current step card */}
      <div className="px-6 py-5">
        <CurrentStepCard
          stages={stages}
          status={shipmentStatus}
          carrier={carrierLabel}
          trackingNumber={trackingNumber}
          eta={estimatedDelivery}
        />

        {(shipmentStatus === "exception" || shipmentStatus === "delayed") && (
          <div className="mt-4 flex items-start gap-2 border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium text-amber-800">
                {shipmentStatus === "exception"
                  ? "Shipment Exception"
                  : "Shipment Delayed"}
              </p>
              {sortedEvents
                .filter(
                  (e) => e.status === "exception" || e.status === "delayed",
                )
                .slice(-1)
                .map((e) => (
                  <p
                    key={e.id}
                    className="mt-0.5 text-[11px] text-amber-700/80"
                  >
                    {e.message ||
                      `Status changed to ${prettyStatus(e.status)}`}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
