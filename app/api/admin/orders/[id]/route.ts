import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { sendOrderDispatchedEmail } from "@/lib/email";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    const order = await OrderModel.findOne({ orderId: id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (body.status) {
      order.fulfillment.status = body.status;
    }
    
    if (body.courierName !== undefined) {
      order.fulfillment.courierName = body.courierName;
    }
    
    if (body.trackingNumber !== undefined) {
      order.fulfillment.trackingNumber = body.trackingNumber;
    }
    
    if (body.trackingUrl !== undefined) {
      order.fulfillment.trackingUrl = body.trackingUrl;
    }

    if (body.status === "dispatched" && !order.fulfillment.dispatchedAt) {
      order.fulfillment.dispatchedAt = new Date();
      
      // Send dispatched email
      try {
        await sendOrderDispatchedEmail(order);
      } catch (e) {
        console.error("Failed to send dispatch email", e);
      }
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Admin Update Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
