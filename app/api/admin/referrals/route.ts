import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ReferralModel } from "@/models/Referral";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    
    await connectToDatabase();

    const skip = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
      ReferralModel.find({})
        .populate("referrerId", "name email")
        .populate("refereeId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReferralModel.countDocuments({}),
    ]);

    return NextResponse.json({
      success: true,
      referrals,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Admin Fetch Referrals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
