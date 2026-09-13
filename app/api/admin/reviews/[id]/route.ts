import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ReviewModel from "@/models/Review";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const deleted = await ReviewModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete review";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
