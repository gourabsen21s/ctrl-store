import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } from "@/models/SiteSettings";

// Public endpoint — returns only the displayable reward values, no sensitive config
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne().lean();
    const w = (settings?.walletSettings as any) || DEFAULT_WALLET_SETTINGS;

    return NextResponse.json({
      success: true,
      rewards: {
        signupBonus: w.signupBonus,
        referrerReward: w.referrerReward,
        refereeReward: w.refereeReward,
        maxRedemptionPercentage: w.maxRedemptionPercentage,
      },
    }, {
      headers: {
        // Cache for 5 minutes — values change rarely, admin controls them
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
