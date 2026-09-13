import "server-only";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";
import { PRODUCTS, type Product } from "@/lib/products";

/**
 * Ensures MongoDB is seeded with default catalog if currently empty.
 */
export async function ensureDbSeeded(): Promise<void> {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error("Cannot seed database: MongoDB is not connected.");
  }

  const count = await ProductModel.countDocuments();
  if (count === 0) {
    await ProductModel.insertMany(
      PRODUCTS.map((p) => ({
        ...p,
        frontImage: p.frontImage,
        backImage: p.backImage,
      }))
    );
  }
}

export type QueryProductsOptions = {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "price-asc" | "price-desc";
};

export type QueryProductsResult = {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
};

/**
 * Retrieves products strictly from MongoDB.
 * No static fallback: MongoDB is the single source of truth.
 */
export async function getProducts(options: QueryProductsOptions = {}): Promise<QueryProductsResult> {
  const { q = "", category = "All", page = 1, limit = 12, sortBy = "newest" } = options;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 12);

  const db = await connectToDatabase();
  if (!db) {
    throw new Error("Database not connected. Please verify MONGODB_URI in environment variables.");
  }

  await ensureDbSeeded();

  // Build MongoDB query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (category && category !== "All") {
    filter.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  if (q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [{ title: regex }, { category: regex }, { description: regex }, { color: regex }];
  }

  // Sort criteria
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sort: Record<string, any> = { createdAt: -1 };
  if (sortBy === "price-asc") sort = { price: 1 };
  if (sortBy === "price-desc") sort = { price: -1 };

  const total = await ProductModel.countDocuments(filter);
  const docs = await ProductModel.find(filter)
    .sort(sort)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  const products: Product[] = docs.map((d) => ({
    handle: d.handle,
    title: d.title,
    price: d.price,
    category: d.category,
    color: d.color,
    sizes: d.sizes || ["One size"],
    aspect: d.aspect || "large",
    description: d.description || "",
    stock: d.stock !== undefined ? d.stock : 15,
    frontImage: d.frontImage || "",
    backImage: d.backImage || "",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return {
    products,
    total,
    totalPages: Math.ceil(total / safeLimit) || 1,
    currentPage: safePage,
  };
}

/**
 * Retrieves a single product strictly from MongoDB by handle.
 * No static fallback: returns null if not found in database.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error("Database not connected. Please verify MONGODB_URI in environment variables.");
  }

  await ensureDbSeeded();
  const doc = await ProductModel.findOne({ handle }).lean();
  if (!doc) {
    return null;
  }

  return {
    handle: doc.handle,
    title: doc.title,
    price: doc.price,
    category: doc.category,
    color: doc.color,
    sizes: doc.sizes || ["One size"],
    aspect: doc.aspect || "large",
    description: doc.description || "",
    stock: doc.stock !== undefined ? doc.stock : 15,
    frontImage: doc.frontImage || "",
    backImage: doc.backImage || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
