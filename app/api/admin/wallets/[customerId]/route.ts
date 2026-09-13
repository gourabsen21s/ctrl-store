import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getWallet } from "@/lib/wallet";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { CustomerModel } from "@/models/Customer";

type Context = { params: Promise<{ customerId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    await connectToDatabase();

    const customer = await CustomerModel.findById(customerId).select("name email").lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const wallet = await getWallet(customerId);
    const transactions = await WalletTransactionModel.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      wallet,
      customer,
      transactions,
    });
  } catch (error: any) {
    console.error("Admin Fetch Wallet Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
