"use client";

import { useMemo } from "react";
import { AlertTriangle, Clock, Shield, Wrench, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import {
  getDaysOfStockRemaining,
  getBestLeadTime,
  getOpenPOsForItem,
  getEngineeringRequest,
} from "@/data/procurement-data";

type RiskLevel = "stockout" | "low_buffer" | "ok";

function getRiskLevel(buffer: number): RiskLevel {
  if (buffer <= 0) return "stockout";
  if (buffer <= 5) return "low_buffer";
  return "ok";
}

const riskConfig: Record<RiskLevel, { label: string; className: string; icon: typeof AlertTriangle }> = {
  stockout: {
    label: "Stockout Risk",
    className: "border-red-500/30 bg-red-500/8 text-red-700",
    icon: AlertTriangle,
  },
  low_buffer: {
    label: "Low Buffer",
    className: "border-amber-500/30 bg-amber-500/8 text-amber-700",
    icon: Clock,
  },
  ok: {
    label: "On Track",
    className: "border-emerald-500/30 bg-emerald-500/8 text-emerald-700",
    icon: Shield,
  },
};

const bannerBg: Record<RiskLevel, string> = {
  stockout: "border-red-500/20 bg-red-500/5",
  low_buffer: "border-amber-500/20 bg-amber-500/5",
  ok: "border-border bg-card",
};

export default function UrgencyBanner({ item }: { item: ProcurementItem }) {
  const isEngineering = item.source === "engineering_request";

  const { daysRemaining, bestLeadTime, buffer, riskLevel, openPOCount } = useMemo(() => {
    const days = getDaysOfStockRemaining(item);
    const lead = getBestLeadTime(item.id);
    const buf = days === Infinity || lead === Infinity ? Infinity : days - lead;
    const pos = getOpenPOsForItem(item.id);
    return {
      daysRemaining: days,
      bestLeadTime: lead === Infinity ? null : lead,
      buffer: buf === Infinity ? null : buf,
      riskLevel: buf === Infinity ? ("ok" as RiskLevel) : getRiskLevel(buf),
      openPOCount: pos.length,
    };
  }, [item]);

  const engRequest = useMemo(
    () => (isEngineering ? getEngineeringRequest(item.id) : null),
    [isEngineering, item.id]
  );

  if (isEngineering && engRequest) {
    const urgencyClass =
      engRequest.urgency === "critical"
        ? "border-red-500/30 bg-red-500/10 text-red-700"
        : engRequest.urgency === "urgent"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
          : "border-border bg-muted/50 text-foreground/70";

    return (
      <div className="flex items-center gap-6 border border-border bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-[11px] text-muted-foreground">Urgency</p>
            <Badge variant="outline" className={cn("mt-0.5 text-[11px] font-semibold capitalize", urgencyClass)}>
              {engRequest.urgency}
            </Badge>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-[11px] text-muted-foreground">Requester</p>
            <p className="text-[13px] font-medium text-foreground/85">{engRequest.requesterName}</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-[11px] text-muted-foreground">Team</p>
          <p className="text-[13px] font-medium text-foreground/85">{engRequest.requesterTeam}</p>
        </div>
        {bestLeadTime !== null && (
          <>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-[11px] text-muted-foreground">Best lead time</p>
              <p className="text-[13px] font-medium tabular-nums text-foreground/85">{bestLeadTime}d</p>
            </div>
          </>
        )}
      </div>
    );
  }

  const risk = riskConfig[riskLevel];
  const RiskIcon = risk.icon;

  return (
    <div className={cn("flex items-center gap-6 border px-6 py-4", bannerBg[riskLevel])}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center", risk.className)}>
          <RiskIcon className="h-4.5 w-4.5" />
        </div>
        <div>
          <Badge variant="outline" className={cn("text-[11px] font-semibold", risk.className)}>
            {risk.label}
          </Badge>
          {buffer !== null && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {buffer <= 0 ? "Order immediately" : `${buffer}d buffer before stockout`}
            </p>
          )}
        </div>
      </div>

      <div className="h-8 w-px bg-border" />

      <div>
        <p className="text-[11px] text-muted-foreground">Days of stock</p>
        <p className={cn(
          "text-lg font-semibold tabular-nums",
          daysRemaining <= 7 ? "text-amber-700" : "text-foreground"
        )}>
          {daysRemaining === Infinity ? "—" : daysRemaining}
          {daysRemaining !== Infinity && <span className="ml-1 text-[12px] font-normal text-muted-foreground">days</span>}
        </p>
      </div>

      <div className="h-8 w-px bg-border" />

      <div>
        <p className="text-[11px] text-muted-foreground">Best lead time</p>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {bestLeadTime ?? "—"}
          {bestLeadTime !== null && <span className="ml-1 text-[12px] font-normal text-muted-foreground">days</span>}
        </p>
      </div>

      <div className="h-8 w-px bg-border" />

      <div>
        <p className="text-[11px] text-muted-foreground">Buffer</p>
        <p className={cn(
          "text-lg font-semibold tabular-nums",
          buffer !== null && buffer <= 0 ? "text-red-700" : buffer !== null && buffer <= 5 ? "text-amber-700" : "text-foreground"
        )}>
          {buffer ?? "—"}
          {buffer !== null && <span className="ml-1 text-[12px] font-normal text-muted-foreground">days</span>}
        </p>
      </div>

      {openPOCount > 0 && (
        <>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-[11px] text-muted-foreground">Open POs</p>
            <p className="text-[13px] font-medium text-emerald-600">
              {openPOCount} in progress
            </p>
          </div>
        </>
      )}
    </div>
  );
}
