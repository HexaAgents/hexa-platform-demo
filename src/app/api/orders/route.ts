import { NextResponse } from "next/server";
import { getAllOrders, addOrder, deleteOrders } from "@/lib/store";
import { Order } from "@/lib/types";
import { generateDefaultLineItems, getDemoLineItemsForSubject } from "@/lib/default-line-items";
import {
  mapParsedLineItemsToOrderLines,
  parsePurchaseOrderWithFallback,
} from "@/lib/po-parser";

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  const orderId = `ord-${Date.now()}`;
  const existingOrders = await getAllOrders();
  const parsedPo =
    body.parsedPoData && typeof body.parsedPoData === "object"
      ? body.parsedPoData
      : parsePurchaseOrderWithFallback({
          streamLabel: body.source,
          subject: body.emailSubject,
          bodyText: body.emailBody,
          extraText: body.rawInputText ? [body.rawInputText] : undefined,
          attachments: body.attachments,
        });

  const demoItems = getDemoLineItemsForSubject(body.emailSubject ?? "", orderId);
  const lineItems = demoItems
    ?? (Array.isArray(body.lineItems) && body.lineItems.length > 0
      ? body.lineItems
      : parsedPo.lineItems.length > 0
        ? mapParsedLineItemsToOrderLines(parsedPo.lineItems, orderId)
        : generateDefaultLineItems(orderId));

  const defaultStage = "rfq_received";

  const fallbackCustomer = {
    id: `cust-${Date.now()}`,
    name: body.senderName || "Unknown",
    email: body.senderEmail || "unknown@example.com",
    phone: "",
    company: body.senderName?.split("@")[1] || "Unknown Company",
    billingAddress: "Not provided",
    shippingAddress: parsedPo.shipTo || "Not provided",
  };
  const customer = body.customer
    ? {
        ...body.customer,
        shippingAddress:
          body.customer.shippingAddress === "Not provided" && parsedPo.shipTo
            ? parsedPo.shipTo
            : body.customer.shippingAddress,
      }
    : fallbackCustomer;

  const order: Order = {
    id: orderId,
    orderNumber: `ORD-2026-${String(existingOrders.length + 43).padStart(4, "0")}`,
    stage: body.stage ?? defaultStage,
    source: body.source || "email",
    createdAt: new Date().toISOString(),
    emailSubject: body.emailSubject || "New Order",
    customer,
    attachments: body.attachments || [],
    lineItems,
    totalItems: lineItems.length,
    poNumber: body.poNumber ?? parsedPo.poNumber ?? null,
    dueDate: body.dueDate ?? parsedPo.dueDate ?? null,
    shipTo: body.shipTo ?? parsedPo.shipTo ?? customer.shippingAddress ?? null,
    shipVia: body.shipVia ?? parsedPo.shipVia ?? null,
    paymentTerms: body.paymentTerms ?? parsedPo.paymentTerms ?? null,
    parseConfidence: body.parseConfidence ?? parsedPo.overallConfidence ?? 0,
    parseFieldConfidence: body.parseFieldConfidence ?? parsedPo.fieldConfidence ?? {},
    parseMissingFields: body.parseMissingFields ?? parsedPo.missingFields ?? [],
    mrpRoutedAt: new Date().toISOString(),
    ingestionSourceLabel: body.ingestionSourceLabel ?? body.source ?? "email",
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
