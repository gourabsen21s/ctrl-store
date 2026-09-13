import { Metadata } from "next";
import Footer from "@/components/Footer";
import StoreCatalogView from "@/components/StoreCatalogView";
import { getProducts, getCatalogMeta } from "@/lib/products-db";
import { BRAND } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Store — ${BRAND}®`,
  description: "Browse the full collection of archival streetwear, tactical carry, and signature drops.",
};

interface StorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    sortBy?: "newest" | "price-asc" | "price-desc" | "title-asc";
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const q = params?.q || "";
  const category = params?.category || "All";
  const page = parseInt(params?.page || "1", 10);
  const sortBy = params?.sortBy || "newest";
  const minPrice = params?.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : undefined;

  const [productsResult, catalogMeta] = await Promise.all([
    getProducts({
      q,
      category,
      page,
      limit: 12,
      sortBy,
      minPrice,
      maxPrice,
    }),
    getCatalogMeta(),
  ]);

  const { products, total, totalPages, currentPage } = productsResult;

  return (
    <main id="page" data-page="store" className="pt-28 md:pt-36">
      {/* Store Header */}
      <div className="px-4 lg:px-6 mb-12">
        <div className="border-b border-current/20 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest opacity-60">
                <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
                <span>ARCHIVE COLLECTION</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-[900] tracking-tighter uppercase leading-none">
                STORE / CATALOG
              </h1>
            </div>
            <p className="max-w-md text-xs sm:text-sm font-mono opacity-70 tracking-wide uppercase leading-relaxed">
              Full collection of heavy-gauge fleeces, oversized tees, headwear, and tactical luggage.
              Filter by category or price below.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Catalog View with Tabs, Filters, Products & Pagination */}
      <StoreCatalogView
        initialProducts={products}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        categories={catalogMeta.categories}
        currentCategory={category}
        currentQuery={q}
        currentSort={sortBy}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        catalogMinPrice={catalogMeta.minPrice}
        catalogMaxPrice={catalogMeta.maxPrice}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
