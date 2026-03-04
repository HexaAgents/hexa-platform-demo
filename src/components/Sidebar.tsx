"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Order } from "@/lib/types";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ orders }: { orders: Order[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <Image
          src="/hexa-logo.png"
          alt="Hexa"
          width={28}
          height={28}
          className="invert"
        />
        <div>
          <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
            Hexa
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Order Management
          </p>
        </div>
      </div>

      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Orders
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {orders.map((order) => {
          const isActive = pathname === `/orders/${order.id}`;
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className={cn(
                "mb-px flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-foreground bg-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Package className="h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{order.orderNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.customer.company}
                </p>
              </div>
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  order.status === "pending" ? "bg-amber-400" : "bg-emerald-500"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
