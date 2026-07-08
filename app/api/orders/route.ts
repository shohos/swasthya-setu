import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders GET failed:", err);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    items?: { name: string; strength?: string; qty: number; price: number }[];
    customerName?: string;
    phone?: string;
    address?: string;
    paymentMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = (body.items ?? []).filter((i) => i && i.name && i.qty > 0);
  if (items.length === 0 || !body.customerName || !body.phone || !body.address) {
    return NextResponse.json(
      { error: "items, customerName, phone and address are required" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 60;

  try {
    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(items),
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        paymentMethod: body.paymentMethod || "bKash",
      },
    });
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Orders POST failed:", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
