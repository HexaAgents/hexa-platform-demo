"use client";

import { Order } from "@/lib/types";
import { Check, Calendar, DollarSign, Clock, Truck } from "lucide-react";

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

  return (
    <div className="border border-emerald-500/30 bg-emerald-500/5">
      <div className="flex items-center gap-3 border-b border-emerald-500/20 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-emerald-900">
            Delivery Confirmed
          </h3>
          <p className="text-[12px] text-emerald-700/70">
            Order fulfilled and delivered to customer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-emerald-500/10">
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Calendar className="h-3 w-3" />
            Delivered
          </div>
          <p className="mt-1 text-[13px] font-medium text-emerald-900">
            {new Date(deliveredDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <DollarSign className="h-3 w-3" />
            Order Value
          </div>
          <p className="mt-1 text-[13px] font-semibold tabular-nums text-emerald-900">
            ${fmt(totalValue)}
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Clock className="h-3 w-3" />
            Order to Delivery
          </div>
          <p className="mt-1 text-[13px] font-medium tabular-nums text-emerald-900">
            {daysToDeliver} days
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Truck className="h-3 w-3" />
            Carrier
          </div>
          <p className="mt-1 text-[13px] font-medium text-emerald-900">
            {carrier}
          </p>
        </div>
      </div>
    </div>
  );
}
