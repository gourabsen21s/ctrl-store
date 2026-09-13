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
  sortBy?: "newest" | "price-asc" | "price-desc" | "title-asc";
  minPrice?: number;
  maxPrice?: number;
};

export type QueryProductsResult = {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export type CatalogMeta = {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  totalProducts: number;
};

/**
 * Retrieves products strictly from MongoDB with full pagination, search, price range, and sorting.
 * No static fallback: MongoDB is the single source of truth.
 */
export async function getProducts(options: QueryProductsOptions = {}): Promise<QueryProductsResult> {
  const {
    q = "",
    category = "All",
    page = 1,
    limit = 12,
    sortBy = "newest",
    minPrice,
    maxPrice,
  } = options;
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

  // Price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceFilter: Record<string, any> = {};
    if (minPrice !== undefined && !isNaN(minPrice)) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined && !isNaN(maxPrice)) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }
  }

  if (q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [
      { title: regex },
      { category: regex },
      { description: regex },
      { color: regex },
      { handle: regex },
    ];
  }

  // Sort criteria
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sort: Record<string, any> = { createdAt: -1 };
  if (sortBy === "price-asc") sort = { price: 1 };
  if (sortBy === "price-desc") sort = { price: -1 };
  if (sortBy === "title-asc") sort = { title: 1 };

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
    dropDate: d.dropDate ? new Date(d.dropDate).toISOString() : undefined,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return {
    products,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    currentPage: safePage,
  };
}

/**
 * Returns metadata about the entire catalog (all distinct categories, min price, max price).
 */
export async function getCatalogMeta(): Promise<CatalogMeta> {
  const db = await connectToDatabase();
  if (!db) {
    return { categories: ["All"], minPrice: 0, maxPrice: 10000, totalProducts: 0 };
  }

  await ensureDbSeeded();

  const [distinctCategories, priceStats, totalProducts] = await Promise.all([
    ProductModel.distinct("category"),
    ProductModel.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]),
    ProductModel.countDocuments(),
  ]);

  const rawCategories = (distinctCategories as string[]).filter(Boolean);
  const categories = ["All", ...rawCategories.sort()];
  const minPrice = priceStats[0]?.minPrice ?? 0;
  const maxPrice = priceStats[0]?.maxPrice ?? 5000;

  return {
    categories,
    minPrice,
    maxPrice,
    totalProducts,
  };
}

/**
 * Retrieves the nearest upcoming drop (earliest dropDate in the future).
 */
export async function getUpcomingDrop(): Promise<Product | null> {
  const db = await connectToDatabase();
  if (!db) return null;

  await ensureDbSeeded();

  const doc = await ProductModel.findOne({ dropDate: { $gt: new Date() } })
    .sort({ dropDate: 1 })
    .lean();

  if (!doc) return null;

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
    dropDate: doc.dropDate ? new Date(doc.dropDate).toISOString() : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
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
    dropDate: doc.dropDate ? new Date(doc.dropDate).toISOString() : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
