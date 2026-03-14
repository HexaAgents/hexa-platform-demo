"use client";

import { CheckCircle2, Circle } from "lucide-react";
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
              <div key={stage.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : isActive ? (
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute h-5 w-5 animate-ping rounded-full bg-blue-400/30" />
                      <span className="relative h-3 w-3 rounded-full bg-blue-600" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
                  )}
                  {!isLast && (
                    <div
                      className={cn(
                        "my-1 w-px flex-1 min-h-[24px]",
                        isCompleted ? "bg-emerald-400" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <div className={cn("pb-5", isLast && "pb-0")}>
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
