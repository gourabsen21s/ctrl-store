import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const order = await OrderModel.findOne({ orderId: id }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Convert objectid and dates to string for safe serialization
    const sanitizedOrder = JSON.parse(JSON.stringify(order));

    return NextResponse.json({ success: true, order: sanitizedOrder });
  } catch (error: any) {
    console.error("Fetch Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
