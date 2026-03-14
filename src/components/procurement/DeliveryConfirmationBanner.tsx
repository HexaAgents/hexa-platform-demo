"use client";

import { Check, Calendar, DollarSign, Clock, Building2 } from "lucide-react";

interface DeliveryConfirmationBannerProps {
  deliveredDate: string;
  totalCost: number;
  daysToDeliver: number;
  supplierName: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DeliveryConfirmationBanner({
  deliveredDate,
  totalCost,
  daysToDeliver,
  supplierName,
}: DeliveryConfirmationBannerProps) {
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
            Items received and checked in at dock
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-emerald-500/10">
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Calendar className="h-3 w-3" />
            Received
          </div>
          <p className="mt-1 text-[13px] font-medium text-emerald-900">
            {formatDate(deliveredDate)}
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <DollarSign className="h-3 w-3" />
            Total Cost
          </div>
          <p className="mt-1 text-[13px] font-semibold tabular-nums text-emerald-900">
            ${totalCost.toLocaleString()}
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Clock className="h-3 w-3" />
            Flag to Delivery
          </div>
          <p className="mt-1 text-[13px] font-medium tabular-nums text-emerald-900">
            {daysToDeliver} days
          </p>
        </div>
        <div className="bg-emerald-500/5 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-700/60">
            <Building2 className="h-3 w-3" />
            Supplier
          </div>
          <p className="mt-1 text-[13px] font-medium text-emerald-900">
            {supplierName}
          </p>
        </div>
      </div>
    </div>
  );
}
