import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { getWallet } from "@/lib/wallet";
import { SiteSettingsModel, DEFAULT_WALLET_SETTINGS } from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subtotalAfterDiscount, coinsToRedeem } = await request.json();
    if (coinsToRedeem <= 0) {
      return NextResponse.json({ success: true, validAmount: 0 });
    }

    await connectToDatabase();

    const wallet = await getWallet(session.customerId);
    const settingsDoc = await SiteSettingsModel.findOne();
    const settings = settingsDoc?.walletSettings || DEFAULT_WALLET_SETTINGS;

    const maxRedeemAmount = Math.floor(subtotalAfterDiscount * (settings.maxRedemptionPercentage / 100));
    
    // Valid amount is min of requested, wallet balance, and cap
    const validAmount = Math.max(0, Math.min(coinsToRedeem, wallet.balance, maxRedeemAmount));

    return NextResponse.json({
      success: true,
      validAmount,
      walletBalance: wallet.balance,
      maxAllowed: maxRedeemAmount,
    });
  } catch (error: any) {
    console.error("Validate Redeem Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
