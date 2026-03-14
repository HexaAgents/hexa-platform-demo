"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Check, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getSupplierHistoriesForItem,
} from "@/data/procurement-data";
import { cn } from "@/lib/utils";

interface SupplierComparisonTableProps {
  itemId: string;
  selectedSupplierIds: string[];
  onToggleSupplier: (supplierId: string) => void;
  isReadOnly?: boolean;
}

const NOW = new Date("2026-03-09");

function getRecencyLabel(dateStr: string): string {
  const diffMs = NOW.getTime() - new Date(dateStr).getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  return months < 2 ? "1mo ago" : `${months}mo ago`;
}

export default function SupplierComparisonTable({
  itemId,
  selectedSupplierIds,
  onToggleSupplier,
  isReadOnly = false,
}: SupplierComparisonTableProps) {
  const histories = useMemo(() => getSupplierHistoriesForItem(itemId), [itemId]);
  const recommended = useMemo(() => {
    if (histories.length === 0) return null;
    return [...histories].sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
  }, [histories]);

  if (histories.length === 0) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Supplier Comparison
        </h4>
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <p className="text-[13px] font-medium">No supplier history</p>
          <button className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Supplier
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Supplier Comparison
          </h4>
          {recommended && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
              <Star className="h-3 w-3" />
              <span>Recommended: <span className="font-medium">{recommended.supplier.name}</span></span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {!isReadOnly && <th className="w-8 px-3 py-2.5" />}
                <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Supplier
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Unit Price
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Lead Time
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  On-Time
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Score</span>
                    </TooltipTrigger>
                    <TooltipContent>Reliability score (0-100)</TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  MOQ
                </th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody>
              {histories.map((h) => {
                const selected = selectedSupplierIds.includes(h.supplierId);
                const isRecommended = recommended?.supplierId === h.supplierId;
                const priceTrend =
                  h.lastUnitPrice > h.previousUnitPrice
                    ? "up"
                    : h.lastUnitPrice < h.previousUnitPrice
                      ? "down"
                      : "flat";

                return (
                  <tr
                    key={h.id}
                    onClick={isReadOnly ? undefined : () => onToggleSupplier(h.supplierId)}
                    className={cn(
                      "border-b border-border transition-colors last:border-b-0",
                      isReadOnly
                        ? selected ? "bg-primary/5" : ""
                        : cn("cursor-pointer", selected ? "bg-primary/5" : "hover:bg-accent/40")
                    )}
                  >
                    {!isReadOnly && (
                      <td className="px-3 py-3">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center border transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card"
                          )}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </div>
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground/85">{h.supplier.name}</span>
                        {isRecommended && (
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600">
                            Best
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="tabular-nums text-foreground/85">${h.lastUnitPrice.toFixed(2)}</span>
                      {priceTrend === "up" && <TrendingUp className="ml-1 inline h-3 w-3 text-amber-500" />}
                      {priceTrend === "down" && <TrendingDown className="ml-1 inline h-3 w-3 text-emerald-500" />}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground/85">
                      {h.avgLeadTimeDays}d
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground/85">
                      {h.onTimeDeliveryRate}%
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          h.reliabilityScore >= 90
                            ? "text-emerald-600"
                            : h.reliabilityScore >= 75
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        )}
                      >
                        {h.reliabilityScore}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                      {h.moq.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right text-muted-foreground">
                      {getRecencyLabel(h.lastOrderDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
