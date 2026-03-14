"use client";

import { Check } from "lucide-react";
import type { ProcurementStatus } from "@/lib/procurement-types";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  status: ProcurementStatus;
  label: string;
  date?: string;
  detail?: string;
}

interface ProcurementTimelineProps {
  currentStatus: ProcurementStatus;
  events: TimelineEvent[];
}

const STATUS_ORDER: ProcurementStatus[] = [
  "flagged",
  "rfq_sent",
  "quotes_received",
  "po_sent",
  "shipped",
  "delivered",
];

const STATUS_LABELS: Record<ProcurementStatus, string> = {
  flagged: "Flagged",
  rfq_sent: "RFQ Sent",
  quotes_received: "Quotes Received",
  po_sent: "PO Sent",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function ProcurementTimeline({ currentStatus, events }: ProcurementTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const eventMap = new Map(events.map((e) => [e.status, e]));

  const stages = STATUS_ORDER
    .filter((s) => {
      const ev = eventMap.get(s);
      if (ev) return true;
      const idx = STATUS_ORDER.indexOf(s);
      return idx <= currentIdx;
    })
    .map((s) => {
      const ev = eventMap.get(s);
      return {
        status: s,
        label: ev?.label ?? STATUS_LABELS[s],
        date: ev?.date,
        detail: ev?.detail,
      };
    });

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-foreground">Procurement Timeline</h3>
        <p className="text-[11px] text-muted-foreground">Full lifecycle from flag to completion</p>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-0">
          {[...stages].reverse().map((stage, idx, arr) => {
            const stageIdx = STATUS_ORDER.indexOf(stage.status);
            const isCompleted = stageIdx < currentIdx;
            const isActive = stage.status === currentStatus;
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
                    <p className={cn(
                      "text-[13px] font-medium leading-5",
                      !isCompleted && !isActive ? "text-muted-foreground/50" : "text-foreground/85"
                    )}>
                      {stage.label}
                    </p>
                    {stage.date && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(stage.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {stage.detail && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{stage.detail}</p>
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
      </div>
    </div>
  );
}
