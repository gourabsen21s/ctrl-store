import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WaitlistModel } from "@/models/Waitlist";
import { ProductModel } from "@/models/Product";

export async function POST(request: Request) {
  try {
    const { email, productHandle } = await request.json();

    if (!email || !productHandle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await ProductModel.findOne({ handle: productHandle });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Try to create the waitlist entry
    try {
      await WaitlistModel.create({
        email,
        productHandle,
        productTitle: product.title,
      });
      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      if (dbError.code === 11000) {
        // Duplicate key error - already on waitlist
        return NextResponse.json({ success: true, message: "Already on waitlist" });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Waitlist Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
