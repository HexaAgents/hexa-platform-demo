"use client";

import { Order } from "@/lib/types";
import { Package, Calendar, DollarSign, Clock, Truck, MapPin } from "lucide-react";

const CARRIER_LABELS: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  shipstation: "ShipStation",
  manual: "Manual",
  other: "Other",
};

export function OrderDeliveryBanner({ order }: { order: Order }) {
  const s = order.shipmentSummary;
  const deliveredDate = s?.latestEventAt ?? order.createdAt;
  const carrier = s?.carrier ? (CARRIER_LABELS[s.carrier] ?? s.carrier) : "Carrier";
  const daysToDeliver = Math.max(
    1,
    Math.round(
      (new Date(deliveredDate).getTime() - new Date(order.createdAt).getTime()) / 86400000
    )
  );

  const totalValue = order.lineItems.reduce((sum, li) => {
    const price = li.parsedUnitPrice ?? 0;
    return sum + price * li.parsedQuantity;
  }, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const shipTo = order.shipTo || order.customer.shippingAddress;

  return (
    <div className="border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent">
      <div className="grid grid-cols-2 gap-px bg-emerald-500/10">
        <div className="flex items-center gap-3 bg-emerald-500/[0.03] px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/50">
              Delivered on
            </p>
            <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-emerald-900">
              {new Date(deliveredDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-500/[0.03] px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/50">
              Order Value
            </p>
            <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-emerald-900">
              ${fmt(totalValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-500/[0.03] px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Truck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/50">
              Carrier
            </p>
            <p className="mt-0.5 text-[14px] font-semibold text-emerald-900">
              {carrier}
            </p>
            {s?.trackingNumber && (
              <p className="mt-0.5 text-[11px] font-mono text-emerald-700/60">
                {s.trackingNumber}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-500/[0.03] px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/50">
              Fulfillment Time
            </p>
            <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-emerald-900">
              {daysToDeliver} {daysToDeliver === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>

      {shipTo && (
        <div className="flex items-center gap-2 border-t border-emerald-500/15 px-5 py-3">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600/50" />
          <p className="text-[12px] text-emerald-700/70 truncate">
            {shipTo}
          </p>
        </div>
      )}
    </div>
  );
}
