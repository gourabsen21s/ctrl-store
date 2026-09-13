import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { PromoModel } from "@/models/Promo";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const promos = await PromoModel.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, promos });
  } catch (error: any) {
    console.error("Fetch Promos Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const existingPromo = await PromoModel.findOne({ code: body.code.toUpperCase() });
    if (existingPromo) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });
    }

    const newPromo = await PromoModel.create({
      code: body.code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      usageLimit: body.usageLimit || 0,
      active: true,
    });

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (error: any) {
    console.error("Create Promo Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
