import { NextResponse } from "next/server";
import { resetToBasicOrders } from "@/lib/store";

export async function POST() {
  await resetToBasicOrders();
  return NextResponse.json({ success: true });
}
