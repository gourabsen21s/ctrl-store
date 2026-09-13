import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { CustomerModel } from "@/models/Customer";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const customer = await CustomerModel.findById(session.customerId).select("-password").lean();
    
    if (!customer) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: customer });
  } catch (error: any) {
    console.error("Get Me Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
