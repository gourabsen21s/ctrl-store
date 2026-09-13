import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";
import { getProductByHandle } from "@/lib/products-db";

type Context = {
  params: Promise<{ handle: string }>;
};

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { handle } = await params;
    const product = await getProductByHandle(handle);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[handle] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { handle } = await params;
    const body = await req.json();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please configure MONGODB_URI." },
        { status: 503 }
      );
    }

    const updated = await ProductModel.findOneAndUpdate(
      { handle },
      {
        $set: {
          title: body.title,
          price: body.price !== undefined ? Number(body.price) : undefined,
          category: body.category,
          color: body.color,
          sizes: body.sizes,
          aspect: body.aspect,
          description: body.description,
          frontImage: body.frontImage,
          backImage: body.backImage,
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found to update" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    console.error("PUT /api/products/[handle] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { handle } = await params;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected. Please configure MONGODB_URI." },
        { status: 503 }
      );
    }

    const deleted = await ProductModel.findOneAndDelete({ handle });
    if (!deleted) {
      return NextResponse.json({ error: "Product not found to delete" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Product ${handle} deleted successfully` });
  } catch (error: unknown) {
    console.error("DELETE /api/products/[handle] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
