import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { WalletModel } from "@/models/Wallet";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    
    await connectToDatabase();

    let query: any = {};
    if (search) {
      // Find customers matching search, then get their wallets
      const { CustomerModel } = await import("@/models/Customer");
      const customers = await CustomerModel.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id").lean();
      const customerIds = customers.map(c => c._id);
      query.customerId = { $in: customerIds };
    }

    const skip = (page - 1) * limit;

    const [wallets, total] = await Promise.all([
      WalletModel.find(query)
        .populate("customerId", "name email")
        .sort({ balance: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletModel.countDocuments(query),
    ]);

    // Calculate global KPIs
    const kpis = await WalletModel.aggregate([
      {
        $group: {
          _id: null,
          totalCoinsInCirculation: { $sum: "$balance" },
          totalLifetimeEarned: { $sum: "$lifetimeEarned" }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      wallets,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      kpis: kpis[0] || { totalCoinsInCirculation: 0, totalLifetimeEarned: 0 }
    });
  } catch (error: any) {
    console.error("Admin Fetch Wallets Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
