import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } from "@/models/SiteSettings";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await SiteSettingsModel.findOne().lean();
    const walletSettings = settings?.walletSettings || DEFAULT_WALLET_SETTINGS;

    return NextResponse.json({ success: true, walletSettings });
  } catch (error: any) {
    console.error("Admin Fetch Rewards Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const {
      referrerReward,
      refereeReward,
      signupBonus,
      maxRedemptionPercentage,
      rewardTrigger,
    } = body;

    let settings = await SiteSettingsModel.findOne();
    if (!settings) {
      settings = new SiteSettingsModel();
    }

    settings.walletSettings = {
      ...settings.walletSettings,
      ...(referrerReward !== undefined && { referrerReward: Number(referrerReward) }),
      ...(refereeReward !== undefined && { refereeReward: Number(refereeReward) }),
      ...(signupBonus !== undefined && { signupBonus: Number(signupBonus) }),
      ...(maxRedemptionPercentage !== undefined && { maxRedemptionPercentage: Number(maxRedemptionPercentage) }),
      ...(rewardTrigger !== undefined && { rewardTrigger }),
    };

    await settings.save();

    return NextResponse.json({ success: true, walletSettings: settings.walletSettings });
  } catch (error: any) {
    console.error("Admin Update Rewards Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
