"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, ShoppingCart, Phone, ListFilter, ArrowUpDown } from "lucide-react";
import type { Order, OrderSource, OrderStage } from "@/lib/types";

const STAGE_CONFIG: Record<OrderStage, { label: string; className: string }> = {
  needs_clarification: {
    label: "Needs Clarification",
    className: "border-red-500/30 bg-red-500/10 text-red-700",
  },
  clarification_requested: {
    label: "Clarification Requested",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  clarification_received: {
    label: "Clarification Received",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  },
  rfq_received: {
    label: "RFQ Received",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  quote_sent: {
    label: "Quote Sent",
    className: "border-violet-500/30 bg-violet-500/10 text-violet-700",
  },
  quote_prepared: {
    label: "Quote Prepared",
    className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700",
  },
  po_received: {
    label: "PO Received",
    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700",
  },
  po_mismatch: {
    label: "PO Mismatch",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-700",
  },
  pushed_to_mrp: {
    label: "Pushed to MRP",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  po_validated: {
    label: "PO Validated",
    className: "border-teal-500/30 bg-teal-500/10 text-teal-700",
  },
  shipped: {
    label: "Shipped",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-700",
  },
  delivered: {
    label: "Delivered",
    className: "border-green-500/30 bg-green-500/10 text-green-700",
  },
};

const SOURCE_CONFIG: Record<OrderSource, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: "Email" },
  ecommerce: { icon: ShoppingCart, label: "Ecommerce" },
  phone: { icon: Phone, label: "Phone" },
};

function SourceBadge({ source }: { source?: OrderSource }) {
  const config = SOURCE_CONFIG[source ?? "email"] ?? SOURCE_CONFIG["email"];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: OrderStage }) {
  const config = STAGE_CONFIG[stage] ?? {
    label: stage ?? "Unknown",
    className: "border-border bg-muted/40 text-muted-foreground",
  };
  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

type DateSort = "newest" | "oldest";

export function OrdersListClient({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("email");
  const [dateSort, setDateSort] = useState<DateSort>("newest");

  const availableStages = useMemo(() => {
    const stages = new Set(orders.map((o) => o.stage));
    return Object.keys(STAGE_CONFIG).filter((s) => stages.has(s as OrderStage)) as OrderStage[];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.stage === statusFilter);
    }
    if (sourceFilter !== "all") {
      result = result.filter((o) => o.source === sourceFilter);
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return dateSort === "newest" ? db - da : da - db;
    });

    return result;
  }, [orders, statusFilter, sourceFilter, dateSort]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-border px-7 py-2.5">
        <ListFilter size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Filters
        </span>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[160px] text-[12px] border-border bg-background">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {availableStages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_CONFIG[stage].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger size="sm" className="h-7 min-w-[130px] text-[12px] border-border bg-background">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(SOURCE_CONFIG).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <Select value={dateSort} onValueChange={(v) => setDateSort(v as DateSort)}>
            <SelectTrigger size="sm" className="h-7 min-w-[140px] text-[12px] border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center border-b border-border px-7 py-2">
        <div className="flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Order
        </div>
        <div className="w-24 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Source
        </div>
        <div className="w-60 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Subject
        </div>
        <div className="w-16 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Items
        </div>
        <div className="w-44 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="w-28 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Date
        </div>
      </div>

      {/* Order list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ListFilter size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No orders match the current filters</p>
              <p className="mt-1 text-xs opacity-70">Try adjusting or clearing your filters</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const personPart = (order.customer?.name ?? "").split(/\s+[-–]\s+/)[0];
              const letters = personPart
                .split(/\s+/)
                .filter((w) => /^[A-Za-z]/.test(w))
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .replace(/[^A-Z]/g, "");
              const initials = letters.slice(0, 2) || "?";

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block w-full border text-left transition-all duration-200 border-border bg-background/30 cursor-pointer hover:border-primary/60 hover:bg-primary/5"
                >
                  <div className="flex items-center px-4 py-3.5">
                    <div className="flex flex-1 items-center gap-3.5">
                      <Avatar className="h-9 w-9 shrink-0 overflow-hidden">
                        <AvatarFallback className="flex size-full min-w-0 items-center justify-center overflow-hidden bg-muted text-[10px] font-semibold leading-none tracking-tight text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-medium leading-tight text-foreground/85">
                          {order.orderNumber}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {order.customer?.name ?? "Unknown"} &middot;{" "}
                          {order.customer?.company ?? "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="w-24 flex justify-center">
                      <SourceBadge source={order.source} />
                    </div>

                    <div className="w-60 text-right">
                      <p className="truncate text-[12px] text-muted-foreground">
                        {order.emailSubject}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                        {order.paymentTerms || "Terms n/a"} &middot;{" "}
                        {order.shipVia || "Ship-via n/a"}
                      </p>
                    </div>

                    <div className="w-16 text-right">
                      <p className="text-[12px] text-foreground/80">{order.totalItems}</p>
                    </div>

                    <div className="w-44 flex justify-end">
                      <StageBadge stage={order.stage} />
                    </div>

                    <div className="w-28 text-right">
                      <p className="text-[12px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </>
  );
}
