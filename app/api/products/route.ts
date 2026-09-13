import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";
import { type Product } from "@/lib/products";
import { getProducts, ensureDbSeeded } from "@/lib/products-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const sortBy = (searchParams.get("sortBy") as "newest" | "price-asc" | "price-desc") || "newest";

    const result = await getProducts({ q, category, page, limit, sortBy });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      handle,
      price,
      category,
      color,
      sizes,
      aspect,
      description,
      frontImage,
      backImage,
    } = body;

    if (!title || !price || !category || !color) {
      return NextResponse.json(
        { error: "Missing required fields: title, price, category, and color are mandatory." },
        { status: 400 }
      );
    }

    // Auto-generate slug/handle if not provided
    const cleanHandle = (handle || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        {
          error: "Database not connected. Please set MONGODB_URI in .env.local to persist new products.",
        },
        { status: 503 }
      );
    }

    await ensureDbSeeded();

    // Check if handle is taken
    const existing = await ProductModel.findOne({ handle: cleanHandle });
    if (existing) {
      return NextResponse.json(
        { error: `Product handle '${cleanHandle}' already exists. Please choose a different title or handle.` },
        { status: 409 }
      );
    }

    const newProduct = await ProductModel.create({
      handle: cleanHandle,
      title: title.trim(),
      price: Number(price),
      category: category.trim(),
      color: color.trim(),
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ["One size"],
      aspect: aspect || "large",
      description: description?.trim() || "",
      frontImage: frontImage?.trim() || `/products/${cleanHandle}-front.jpg`,
      backImage: backImage?.trim() || `/products/${cleanHandle}-back.jpg`,
    });

    const formatted: Product = {
      handle: newProduct.handle,
      title: newProduct.title,
      price: newProduct.price,
      category: newProduct.category,
      color: newProduct.color,
      sizes: newProduct.sizes,
      aspect: newProduct.aspect,
      description: newProduct.description,
      frontImage: newProduct.frontImage,
      backImage: newProduct.backImage,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    };

    return NextResponse.json({ success: true, product: formatted }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/products error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
