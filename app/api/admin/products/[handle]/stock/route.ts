import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ handle: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handle } = await params;
    const body = await req.json();
    const stock = Math.max(0, Math.floor(Number(body.stock)));

    if (isNaN(stock)) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await ProductModel.findOneAndUpdate(
      { handle },
      { $set: { stock } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, stock: updated.stock, handle });
  } catch (err) {
    console.error("[PATCH stock]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
