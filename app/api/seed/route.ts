import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";
import { PRODUCTS } from "@/lib/products";

export async function POST() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "MONGODB_URI is not configured in .env.local" },
        { status: 503 }
      );
    }

    const count = await ProductModel.countDocuments();
    if (count > 0) {
      return NextResponse.json({
        message: `Database already has ${count} products. No changes made.`,
        count,
      });
    }

    const seeded = await ProductModel.insertMany(
      PRODUCTS.map((p) => ({
        ...p,
        frontImage: `/products/${p.handle}-front.jpg`,
        backImage: `/products/${p.handle}-back.jpg`,
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seeded.length} products to MongoDB`,
      count: seeded.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}
