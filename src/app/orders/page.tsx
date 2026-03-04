import Link from "next/link";
import { getAllOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage incoming distributor orders and review parsed line items.
        </p>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[140px]">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="group border-border">
                <TableCell>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-2 font-medium hover:underline"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.customer.company}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {order.emailSubject}
                </TableCell>
                <TableCell className="text-center">
                  {order.totalItems}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      order.status === "pending"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }
                  >
                    {order.status === "pending" ? "Pending" : "Fulfilled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Link href={`/orders/${order.id}`}>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
