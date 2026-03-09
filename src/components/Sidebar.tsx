"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Order } from "@/lib/types";
import { Package, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ orders }: { orders: Order[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSelecting = selected.size > 0;

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }, [orders, selected.size]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const currentOrderId = pathname.match(/\/orders\/(.+)/)?.[1];
        setSelected(new Set());
        setConfirmOpen(false);
        if (currentOrderId && ids.includes(currentOrderId)) {
          router.push("/orders");
        }
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }, [selected, pathname, router]);

  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Image
          src="/hexa-logo.png"
          alt="Hexa"
          width={28}
          height={28}
        />
        <div>
          <h1 className="font-display text-base font-medium leading-none text-foreground">
            Hexa
          </h1>
          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            Order Management
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Orders
        </p>
        {isSelecting ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              {selected.size}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={selectAll}
            className="text-[11px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            Select
          </button>
        )}
      </div>

      {isSelecting && (
        <div className="flex items-center gap-2 px-5 pb-2">
          <button
            onClick={selectAll}
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {selected.size === orders.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {orders.map((order) => {
          const isActive = pathname === `/orders/${order.id}`;
          const isChecked = selected.has(order.id);
          return (
            <div
              key={order.id}
              className={cn(
                "group mb-px flex items-center border-l-2 text-[13px] transition-colors",
                isActive
                  ? "border-l-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {isSelecting && (
                <button
                  onClick={() => toggle(order.id)}
                  className="flex shrink-0 items-center justify-center pl-3"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isChecked
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30 hover:border-muted-foreground/60"
                    )}
                  >
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              )}
              <Link
                href={`/orders/${order.id}`}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 py-2.5",
                  isSelecting ? "pl-2 pr-4" : "px-4"
                )}
              >
                <Package className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{order.orderNumber}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
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
            </div>
          );
        })}
      </nav>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
            <h3 className="text-[15px] font-medium text-foreground">
              Delete {selected.size} order{selected.size > 1 ? "s" : ""}?
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              This action cannot be undone. The selected order{selected.size > 1 ? "s" : ""} and
              all associated data will be permanently removed.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-md border border-border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
