import Link from "next/link";
import { getAllOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ResetOrdersButton } from "@/components/orders/ResetOrdersButton";
import { Search, Mail, ShoppingCart, Phone } from "lucide-react";
import { OrderSource, OrderStage } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEEDS_ATTENTION_STAGES: OrderStage[] = [
  "needs_clarification",
  "po_mismatch",
];

const STAGE_CONFIG: Record<
  OrderStage,
  { label: string; className: string }
> = {
  needs_clarification: {
    label: "Needs Clarification",
    className:
      "border-red-500/30 bg-red-500/10 text-red-700",
  },
  clarification_requested: {
    label: "Clarification Requested",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  clarification_received: {
    label: "Clarification Received",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  rfq_received: {
    label: "RFQ Received",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  quote_sent: {
    label: "Quote Sent",
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-700",
  },
  po_received: {
    label: "PO Received",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  po_mismatch: {
    label: "PO Mismatch",
    className:
      "border-red-500/30 bg-red-500/10 text-red-700",
  },
  pushed_to_mrp: {
    label: "Pushed to MRP",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  shipped: {
    label: "Shipped",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  delivered: {
    label: "Delivered",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
};

export default async function OrdersPage() {
  const orders = await getAllOrders();
  const attentionCount = orders.filter((o) =>
    NEEDS_ATTENTION_STAGES.includes(o.stage)
  ).length;

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-7 py-4">
        <div>
          <h1 className="font-display text-2xl font-medium leading-none text-foreground">
            Orders
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage incoming distributor orders and parsed line items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResetOrdersButton />
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              readOnly
              value="Search orders..."
              className="h-9 w-52 border-border bg-background pl-8 text-xs text-muted-foreground"
            />
          </div>
          <Badge
            variant="secondary"
            className={
              attentionCount > 0
                ? "gap-2 border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-700"
                : "gap-2 border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-600"
            }
          >
            <span className="text-xs font-semibold">
              {attentionCount > 0
                ? `${attentionCount} Need Review`
                : "All Clear"}
            </span>
          </Badge>
        </div>
      </div>

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

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-4 py-3">
          {orders.map((order) => {
            const personPart = order.customer.name.split(/\s+[-–]\s+/)[0];
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
                        {order.customer.name} &middot; {order.customer.company}
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
                    <p className="text-[12px] text-foreground/80">
                      {order.totalItems}
                    </p>
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
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

const SOURCE_CONFIG: Record<
  OrderSource,
  { icon: typeof Mail; label: string }
> = {
  email: { icon: Mail, label: "Email" },
  ecommerce: { icon: ShoppingCart, label: "Ecommerce" },
  phone: { icon: Phone, label: "Phone" },
};

function SourceBadge({ source }: { source?: OrderSource }) {
  const config = SOURCE_CONFIG[source ?? "email"];
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: OrderStage }) {
  const config = STAGE_CONFIG[stage];
  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 text-[11px] font-semibold ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
