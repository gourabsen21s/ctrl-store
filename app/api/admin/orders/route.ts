import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    const statusFilter = searchParams.get("status"); // e.g. "paid", "pending"
    const fulfillmentFilter = searchParams.get("fulfillment"); // e.g. "processing", "dispatched"

    if (statusFilter && statusFilter !== "All") {
      query["payment.status"] = statusFilter.toLowerCase();
    }
    
    if (fulfillmentFilter && fulfillmentFilter !== "All") {
      query["fulfillment.status"] = fulfillmentFilter.toLowerCase();
    }

    await connectToDatabase();

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await OrderModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      orders,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Admin Fetch Orders Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
