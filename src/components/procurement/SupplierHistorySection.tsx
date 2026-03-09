"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Plus, Check, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSupplierHistoriesForItem } from "@/data/procurement-data";
import { cn } from "@/lib/utils";

interface SupplierHistorySectionProps {
  itemId: string;
  selectedSupplierIds: string[];
  onToggleSupplier: (supplierId: string) => void;
}

const NOW = new Date("2026-03-09");

function getRecency(dateStr: string): { label: string; color: "green" | "amber" | "red" } {
  const date = new Date(dateStr);
  const diffMs = NOW.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
  let label: string;
  if (diffDays <= 1) label = "1 day ago";
  else if (diffDays < 30) label = `${diffDays} days ago`;
  else if (diffMonths < 2) label = "1 month ago";
  else label = `${Math.round(diffMonths)} months ago`;
  if (diffMonths <= 3) return { label, color: "green" };
  if (diffMonths <= 12) return { label, color: "amber" };
  return { label, color: "red" };
}

function fmtPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default function SupplierHistorySection({ itemId, selectedSupplierIds, onToggleSupplier }: SupplierHistorySectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const histories = useMemo(() => getSupplierHistoriesForItem(itemId), [itemId]);
  const recommended = useMemo(() => {
    if (histories.length === 0) return null;
    return [...histories].sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
  }, [histories]);

  if (histories.length === 0) {
    return (
      <div className="border border-border bg-card p-6 shadow-sm">
        <h4 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suppliers</h4>
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <p className="text-[13px] font-medium">No supplier history for this item</p>
          <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Supplier
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suppliers</h4>
          <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        {recommended && (
          <div className="mb-4 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground/85">
                Recommended: <span className="text-emerald-700">{recommended.supplier.name}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Score {recommended.reliabilityScore}/100 &mdash; {recommended.onTimeDeliveryRate}% on-time across {recommended.totalOrders12mo} orders
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {histories.map((h) => {
            const recency = getRecency(h.lastOrderDate);
            const selected = selectedSupplierIds.includes(h.supplierId);
            const expanded = expandedId === h.id;
            const priceTrend = h.lastUnitPrice > h.previousUnitPrice ? "up" : h.lastUnitPrice < h.previousUnitPrice ? "down" : "flat";

            return (
              <div key={h.id} className={cn("border transition-colors", selected ? "border-primary/40 bg-primary/5" : "border-border bg-background/30")}>
                <div className="flex items-center px-4 py-3">
                  <button
                    onClick={() => onToggleSupplier(h.supplierId)}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors mr-3.5",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-muted-foreground"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground/85">{h.supplier.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {fmtPrice(h.lastUnitPrice)}
                      {priceTrend === "up" && <TrendingUp className="ml-1 inline h-2.5 w-2.5 text-amber-500" />}
                      {priceTrend === "down" && <TrendingDown className="ml-1 inline h-2.5 w-2.5 text-emerald-500" />}
                      <span className="ml-3">{h.avgLeadTimeDays}d lead</span>
                      <span className="ml-3">{h.onTimeDeliveryRate}% on-time</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn("text-[11px] tabular-nums", recency.color === "green" ? "text-emerald-600" : recency.color === "amber" ? "text-amber-600" : "text-muted-foreground")}>
                      {recency.label}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn("text-[12px] font-semibold tabular-nums", h.reliabilityScore >= 90 ? "text-emerald-600" : h.reliabilityScore >= 75 ? "text-amber-600" : "text-muted-foreground")}>
                          {h.reliabilityScore}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[220px]">Reliability score (0-100) based on on-time delivery, defect rate, volume, and price consistency</TooltipContent>
                    </Tooltip>
                    <button onClick={() => setExpandedId(expanded ? null : h.id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="grid grid-cols-4 gap-x-6 gap-y-2 text-[12px]">
                      <div>
                        <p className="text-muted-foreground">Orders (12mo)</p>
                        <p className="mt-0.5 font-medium tabular-nums text-foreground/85">{h.totalOrders12mo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg price</p>
                        <p className="mt-0.5 font-medium tabular-nums text-foreground/85">{fmtPrice(h.avgUnitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">MOQ</p>
                        <p className="mt-0.5 font-medium tabular-nums text-foreground/85">{h.moq.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Defect rate</p>
                        <p className={cn("mt-0.5 font-medium tabular-nums", h.defectRate <= 1 ? "text-emerald-600" : h.defectRate <= 5 ? "text-amber-600" : "text-foreground/85")}>{h.defectRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="mt-0.5 font-medium text-foreground/85">{h.paymentTerms}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="mt-0.5 text-foreground/70">{h.notes || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showAddForm && (
          <div className="mt-4 space-y-3 border border-border bg-background/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-medium text-foreground">Add New Supplier</h4>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Supplier name" className="h-8 text-[12px]" />
              <Input type="email" placeholder="Email" className="h-8 text-[12px]" />
              <Input type="tel" placeholder="Phone" className="h-8 text-[12px]" />
              <Input placeholder="Payment terms" className="h-8 text-[12px]" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)} className="border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-accent/60">Cancel</button>
              <button onClick={() => setShowAddForm(false)} className="bg-foreground px-3 py-1.5 text-[12px] font-medium text-background hover:opacity-90"><Plus className="mr-1 inline h-3 w-3" />Add</button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
