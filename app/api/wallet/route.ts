import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { getWallet } from "@/lib/wallet";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const wallet = await getWallet(session.customerId);
    const transactions = await WalletTransactionModel.find({ customerId: session.customerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      wallet,
      transactions,
    });
  } catch (error: any) {
    console.error("Fetch Wallet Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
