import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ReviewModel from "@/models/Review";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const reviews = await ReviewModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reviews, total: reviews.length });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin credentials required." }, { status: 401 });
    }

    const body = await req.json();
    const { productHandle, productTitle, author, rating, title, comment, verifiedPurchase } = body;

    if (!productHandle || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Product, star rating, headline, and comment are required." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const review = await ReviewModel.create({
      productHandle: productHandle.toLowerCase().trim(),
      productTitle: (productTitle || productHandle).trim(),
      author: author?.trim() || "Verified Buyer",
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: verifiedPurchase !== undefined ? Boolean(verifiedPurchase) : true,
      status: "approved",
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/reviews error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create review";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
