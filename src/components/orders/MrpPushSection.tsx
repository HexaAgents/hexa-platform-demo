"use client";

import { Order } from "@/lib/types";
import { Check } from "lucide-react";

interface Props {
  order: Order;
  mode: "active" | "completed";
}

export function MrpPushSection({ order, mode }: Props) {
  const mrp = order.demoFlow?.mrpPush;
  const erpSync = order.demoFlow?.erpSync;

  const pushedAt = mrp?.pushedAt ?? order.mrpRoutedAt;
  const erpOrderId = mrp?.erpOrderId;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
        </div>
        <div>
          <p className="text-[12px] font-medium text-emerald-700">
            Order synced to ERP
            {erpOrderId && (
              <span className="ml-1 font-mono text-emerald-600">
                ({erpOrderId})
              </span>
            )}
          </p>
          {pushedAt && (
            <p className="text-[11px] text-emerald-600/70">
              {new Date(pushedAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {erpSync && erpSync.timeline.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            ERP Sync Timeline
          </p>
          {erpSync.timeline.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="text-foreground/80">{entry.label}</span>
              <span className="text-muted-foreground">
                {new Date(entry.at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
