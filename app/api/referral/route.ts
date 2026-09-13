import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { CustomerModel } from "@/models/Customer";
import { ReferralModel } from "@/models/Referral";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const customer = await CustomerModel.findById(session.customerId).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const referrals = await ReferralModel.find({ referrerId: session.customerId })
      .populate("refereeId", "name createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      referralCode: customer.referralCode,
      referrals,
      stats: {
        total: referrals.length,
        rewarded: referrals.filter(r => r.status === "rewarded").length,
        pending: referrals.filter(r => r.status === "pending").length,
      },
    });
  } catch (error: any) {
    console.error("Fetch Referral Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
