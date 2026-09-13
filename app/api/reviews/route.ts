import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ReviewModel from "@/models/Review";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ reviews: [], averageRating: 5.0, totalReviews: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { status: "approved" };
    if (handle) {
      filter.productHandle = handle.toLowerCase().trim();
    }

    const reviews = await ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalReviews = reviews.length;
    let averageRating = 5.0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
        // @ts-expect-error key index
        breakdown[rating] = (breakdown[rating] || 0) + 1;
        return acc + r.rating;
      }, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews,
      breakdown,
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productHandle, productTitle, author, rating, title, comment } = body;

    if (!productHandle || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Please provide product handle, rating, review title, and comment." },
        { status: 400 }
      );
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please check configuration." },
        { status: 503 }
      );
    }

    const newReview = await ReviewModel.create({
      productHandle: productHandle.toLowerCase().trim(),
      productTitle: (productTitle || productHandle).trim(),
      author: author?.trim() || "Verified Buyer",
      rating: numRating,
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      status: "approved",
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
