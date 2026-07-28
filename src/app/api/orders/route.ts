import { NextResponse } from "next/server";
import { createOrderRecord, getOrders, updateOrderStatus } from "@/lib/db";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const order = await createOrderRecord(payload);
  return NextResponse.json(order, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const { orderId, status } = payload;
  if (!orderId || !status) {
    return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
  }

  const order = await updateOrderStatus(orderId, status);
  return NextResponse.json(order);
}
