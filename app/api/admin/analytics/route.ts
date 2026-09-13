import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Get all paid orders
    const paidOrders = await OrderModel.find({ "payment.status": "paid" }).lean();
    
    const totalOrders = paidOrders.length;
    const grossRevenue = paidOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    // 2. Get recent orders (last 5)
    const recentOrders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 3. Get low stock products (stock <= 5)
    const lowStockProducts = await ProductModel.find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // 4. Monthly revenue for a simple chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPaidOrders = await OrderModel.find({
      "payment.status": "paid",
      createdAt: { $gte: sixMonthsAgo }
    }).lean();

    const monthlyData: Record<string, number> = {};
    recentPaidOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (order.pricing?.total || 0);
    });

    const revenueChart = Object.keys(monthlyData).map(key => ({
      name: key,
      total: monthlyData[key]
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        grossRevenue,
        averageOrderValue,
        recentOrders,
        lowStockProducts,
        revenueChart
      }
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
