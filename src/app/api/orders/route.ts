import { NextResponse } from "next/server";
import { getAllOrders, addOrder, deleteOrders } from "@/lib/store";
import { Order } from "@/lib/types";
import { generateDefaultLineItems } from "@/lib/default-line-items";

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  const orderId = `ord-${Date.now()}`;
  const existingOrders = await getAllOrders();

  const lineItems =
    body.lineItems && body.lineItems.length > 0
      ? body.lineItems
      : generateDefaultLineItems(orderId);

  const order: Order = {
    id: orderId,
    orderNumber: `ORD-2026-${String(existingOrders.length + 43).padStart(4, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    emailSubject: body.emailSubject || "New Order",
    customer: body.customer || {
      id: `cust-${Date.now()}`,
      name: body.senderName || "Unknown",
      email: body.senderEmail || "unknown@example.com",
      phone: "",
      company: body.senderName?.split("@")[1] || "Unknown Company",
      billingAddress: "Not provided",
      shippingAddress: "Not provided",
    },
    attachments: body.attachments || [],
    lineItems,
    totalItems: lineItems.length,
  };

  const created = await addOrder(order);
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids[] required" }, { status: 400 });
  }
  await deleteOrders(ids);
  return NextResponse.json({ deleted: ids.length });
}
