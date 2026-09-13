import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Find all orders for this customer by email
    const orders = await OrderModel.find({ "customer.email": session.email })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Fetch Customer Orders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
