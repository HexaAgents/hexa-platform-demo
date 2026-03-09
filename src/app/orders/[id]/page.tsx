import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { CustomerCard } from "@/components/CustomerCard";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { LineItemsPanel } from "@/components/LineItemsPanel";
import { ArrowLeft, Calendar, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-7">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[22px] font-medium leading-none text-foreground">
              {order.orderNumber}
            </h1>
            <Badge
              variant="outline"
              className={
                order.status === "pending"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              }
            >
              {order.status === "pending" ? "Pending Review" : "Fulfilled"}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {order.emailSubject}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Customer Details
        </h2>
        <CustomerCard customer={order.customer} />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <div className="border border-border bg-card p-6 shadow-sm">
            <AttachmentViewer attachments={order.attachments} />
          </div>
        </div>
        <div className="xl:col-span-3">
          <div className="border border-border bg-card p-6 shadow-sm">
            <LineItemsPanel items={order.lineItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
