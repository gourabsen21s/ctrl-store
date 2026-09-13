import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WaitlistModel } from "@/models/Waitlist";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const waitlists = await WaitlistModel.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, waitlists });
  } catch (error: any) {
    console.error("Fetch Waitlists Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
