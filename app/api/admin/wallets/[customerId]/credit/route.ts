import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { creditWallet } from "@/lib/wallet";

type Context = { params: Promise<{ customerId: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    const body = await request.json();
    const { amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    if (!note) {
      return NextResponse.json({ error: "A reason/note is required for manual credits" }, { status: 400 });
    }

    await connectToDatabase();

    const idempotencyKey = `admin_credit_${customerId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const tx = await creditWallet({
      customerId,
      amount,
      reason: "admin_credit",
      referenceId: session.username, // Using admin username as reference
      referenceType: "manual",
      idempotencyKey,
      note,
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (error: any) {
    console.error("Admin Wallet Credit Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
