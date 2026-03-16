import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/store";
import { CollapsibleCustomerCard } from "@/components/CollapsibleCustomerCard";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { OrderDetailClient } from "@/components/orders/OrderDetailClient";
import { ArrowLeft } from "lucide-react";

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

      {order.customer && <CollapsibleCustomerCard customer={order.customer} />}

      <OrderDetailClient
        order={order}
        leftPanel={
          order.source !== "phone" ? (
            <div className="border border-border bg-card p-6 shadow-sm">
              <AttachmentViewer attachments={order.attachments ?? []} />
            </div>
          ) : null
        }
      />
    </div>
  );
}
