import "server-only";
import { connectToDatabase } from "@/lib/db";
import ProductModel from "@/models/Product";
import { PRODUCTS, type Product } from "@/lib/products";

/**
 * Ensures MongoDB is seeded with default catalog if currently empty.
 */
export async function ensureDbSeeded(): Promise<void> {
  const db = await connectToDatabase();
  if (!db) return;

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
 * Retrieves products with search, category filtering, and pagination from MongoDB,
 * falling back to static PRODUCTS if MongoDB is not configured or fails.
 */
export async function getProducts(options: QueryProductsOptions = {}): Promise<QueryProductsResult> {
  const { q = "", category = "All", page = 1, limit = 12, sortBy = "newest" } = options;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 12);

  try {
    const db = await connectToDatabase();
    if (db) {
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
  } catch (err) {
    console.warn("Falling back to static products due to DB error:", err);
  }

  // Fallback in-memory filtering
  let filtered = [...PRODUCTS];

  if (category && category !== "All") {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (q.trim()) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query)
    );
  }

  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const start = (safePage - 1) * safeLimit;
  const products = filtered.slice(start, start + safeLimit);

  return {
    products,
    total,
    totalPages: Math.ceil(total / safeLimit) || 1,
    currentPage: safePage,
  };
}

/**
 * Retrieves a single product by handle, querying MongoDB if connected.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const db = await connectToDatabase();
    if (db) {
      await ensureDbSeeded();
      const doc = await ProductModel.findOne({ handle }).lean();
      if (doc) {
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
    }
  } catch (err) {
    console.warn("DB error when fetching product by handle:", err);
  }

  const fallback = PRODUCTS.find((p) => p.handle === handle);
  return fallback || null;
}
