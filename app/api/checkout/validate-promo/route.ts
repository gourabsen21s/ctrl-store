import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PromoModel } from "@/models/Promo";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const promo = await PromoModel.findOne({ code: code.toUpperCase().trim() });
    
    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (!promo.active) {
      return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    }

    if (promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = (subtotal * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
      }
    });

  } catch (error: any) {
    console.error("Validate Promo Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
