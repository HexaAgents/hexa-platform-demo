import { getAllOrders } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orders = getAllOrders();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar orders={orders} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
