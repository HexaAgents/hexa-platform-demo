"use client";

import { useMemo } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/lib/procurement-types";
import { getDaysOfStockRemaining, getStockColor } from "@/data/procurement-data";

function computeConsumption7d(item: ProcurementItem): number | null {
  if (item.stockHistory.length < 8) return null;
  const recent = item.stockHistory.slice(-8);
  let totalConsumed = 0;
  for (let i = 1; i < recent.length; i++) {
    const drop = recent[i - 1].level - recent[i].level;
    if (drop > 0) totalConsumed += drop;
  }
  return totalConsumed / 7;
}

const STROKE_COLORS = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" } as const;

export default function InventorySection({ item }: { item: ProcurementItem }) {
  const daysRemaining = getDaysOfStockRemaining(item);
  const stockColor = getStockColor(daysRemaining);
  const hasConsumption = item.avgDailyConsumption > 0;
  const hasStockHistory = item.stockHistory.length > 1;
  const stockPct = item.maxStock > 0 ? Math.min(100, (item.currentStock / item.maxStock) * 100) : 0;
  const reorderPct = item.maxStock > 0 ? Math.min(100, (item.reorderPoint / item.maxStock) * 100) : 0;

  const consumption7d = useMemo(() => computeConsumption7d(item), [item]);
  const hasSpike =
    consumption7d !== null &&
    item.avgDailyConsumption90d > 0 &&
    consumption7d > item.avgDailyConsumption90d * 1.3;
  const spikePercent =
    hasSpike && consumption7d !== null && item.avgDailyConsumption90d > 0
      ? Math.round(((consumption7d - item.avgDailyConsumption90d) / item.avgDailyConsumption90d) * 100)
      : 0;

  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Inventory
      </h4>

      <div className={cn("gap-6", hasStockHistory ? "grid grid-cols-1 md:grid-cols-[1fr_1fr] md:items-stretch" : "space-y-3")}>
        {/* Left: metrics block */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-8">
              <div>
                <p className="text-[11px] text-muted-foreground">Days of stock</p>
                <p className={cn(
                  "mt-0.5 text-xl font-semibold tabular-nums",
                  daysRemaining <= 7 ? "text-amber-700" : "text-foreground"
                )}>
                  {daysRemaining === Infinity ? "—" : daysRemaining}
                  {daysRemaining !== Infinity && <span className="ml-1 text-[13px] font-normal text-muted-foreground">days</span>}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Current stock</p>
                <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground/85">
                  {item.currentStock.toLocaleString()}
                  <span className="ml-1 text-muted-foreground font-normal">/ {item.maxStock.toLocaleString()}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Reorder point</p>
                <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground/85">
                  {item.reorderPoint.toLocaleString()}
                </p>
              </div>
            </div>
            {hasStockHistory && (
              <p className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                90-day trend
              </p>
            )}
          </div>

          <div className="relative h-1.5 w-full overflow-hidden bg-muted">
            <div
              className={cn(
                "absolute inset-y-0 left-0",
                stockColor === "red" ? "bg-amber-500" : stockColor === "amber" ? "bg-amber-400" : "bg-emerald-500"
              )}
              style={{ width: `${stockPct}%` }}
            />
            {reorderPct > 0 && (
              <div className="absolute top-0 h-full w-px bg-foreground/30" style={{ left: `${reorderPct}%` }} />
            )}
          </div>

          {hasConsumption && (
            <div className="flex items-baseline gap-6">
              <div className="flex items-baseline gap-2">
                <p className="text-[11px] text-muted-foreground">Daily avg (30d)</p>
                <p className="text-[13px] font-medium tabular-nums text-foreground/85">
                  {item.avgDailyConsumption30d.toFixed(1)}
                </p>
                {item.avgDailyConsumption30d > item.avgDailyConsumption90d && (
                  <TrendingUp className="h-3 w-3 text-amber-500" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-[11px] text-muted-foreground">Daily avg (90d)</p>
                <p className="text-[13px] font-medium tabular-nums text-foreground/85">
                  {item.avgDailyConsumption90d.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {hasSpike && consumption7d !== null && (
            <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[12px] text-amber-700">
                Consumption spike — {spikePercent}% above baseline
              </p>
            </div>
          )}
        </div>

        {/* Right: sparkline — aligns with progress bar row, fills height */}
        {hasStockHistory && (
          <div className="flex min-h-[140px] flex-col min-w-0">
            <div className="min-h-0 flex-1">
              <Sparkline stockHistory={item.stockHistory} reorderPoint={item.reorderPoint} stockColor={stockColor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SPARK_W = 800;
const SPARK_H = 140;
const SPARK_PAD = { top: 8, right: 8, bottom: 24, left: 8 };
const SPARK_IW = SPARK_W - SPARK_PAD.left - SPARK_PAD.right;
const SPARK_IH = SPARK_H - SPARK_PAD.top - SPARK_PAD.bottom;

function Sparkline({
  stockHistory,
  reorderPoint,
  stockColor,
}: {
  stockHistory: ProcurementItem["stockHistory"];
  reorderPoint: number;
  stockColor: "red" | "amber" | "green";
}) {
  const { linePath, areaPath, reorderY, endPt, xLabels } = useMemo(() => {
    const levels = stockHistory.map((p) => p.level);
    const yMax = Math.ceil(Math.max(...levels, reorderPoint) * 1.1) || 1;
    const pts = stockHistory.map((p, i) => ({
      x: SPARK_PAD.left + (i / Math.max(stockHistory.length - 1, 1)) * SPARK_IW,
      y: SPARK_PAD.top + (1 - p.level / yMax) * SPARK_IH,
    }));
    const rY = SPARK_PAD.top + (1 - reorderPoint / yMax) * SPARK_IH;
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `M ${pts[0].x} ${SPARK_PAD.top + SPARK_IH} ` + pts.map((p) => `L ${p.x} ${p.y}`).join(" ") + ` L ${pts[pts.length - 1].x} ${SPARK_PAD.top + SPARK_IH} Z`;
    const first = new Date(stockHistory[0].date + "T00:00:00");
    const last = new Date(stockHistory[stockHistory.length - 1].date + "T00:00:00");
    const xl = [
      { x: SPARK_PAD.left, label: first.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
      { x: SPARK_PAD.left + SPARK_IW, label: last.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
    ];
    return { linePath: line, areaPath: area, reorderY: rY, endPt: pts[pts.length - 1], xLabels: xl };
  }, [stockHistory, reorderPoint]);

  const stroke = STROKE_COLORS[stockColor];
  const fill = stockColor === "red" ? "rgba(239,68,68,0.04)" : stockColor === "amber" ? "rgba(245,158,11,0.04)" : "rgba(16,185,129,0.04)";

  return (
    <div className="h-full min-h-[100px] w-full">
      <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <path d={areaPath} fill={fill} />
        {reorderPoint > 0 && (
          <line x1={SPARK_PAD.left} x2={SPARK_PAD.left + SPARK_IW} y1={reorderY} y2={reorderY} stroke="currentColor" strokeWidth={0.5} strokeDasharray="3 2" strokeOpacity={0.15} />
        )}
        <path d={linePath} fill="none" stroke={stroke} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
        {endPt && <circle cx={endPt.x} cy={endPt.y} r={2} fill={stroke} />}
        {xLabels.map((t, i) => (
          <text key={i} x={t.x} y={SPARK_H - 1} textAnchor={i === 0 ? "start" : "end"} className="fill-muted-foreground/50" fontSize={7}>{t.label}</text>
        ))}
      </svg>
    </div>
  );
}
