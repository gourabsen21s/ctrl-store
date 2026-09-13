"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { type Product } from "@/lib/products";

interface StoreCatalogViewProps {
  initialProducts: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  categories: string[];
  currentCategory: string;
  currentQuery: string;
  currentSort: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  catalogMinPrice: number;
  catalogMaxPrice: number;
}

export default function StoreCatalogView({
  initialProducts,
  total,
  totalPages,
  currentPage,
  categories,
  currentCategory,
  currentQuery,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
}: StoreCatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for search & price inputs
  const [searchVal, setSearchVal] = useState(currentQuery);
  const [minPriceInput, setMinPriceInput] = useState(
    currentMinPrice !== undefined ? String(currentMinPrice) : ""
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    currentMaxPrice !== undefined ? String(currentMaxPrice) : ""
  );
  const [showPriceFilter, setShowPriceFilter] = useState(
    currentMinPrice !== undefined || currentMaxPrice !== undefined
  );

  // Synchronize local input state with URL changes
  useEffect(() => {
    setSearchVal(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setMinPriceInput(currentMinPrice !== undefined ? String(currentMinPrice) : "");
    setMaxPriceInput(currentMaxPrice !== undefined ? String(currentMaxPrice) : "");
  }, [currentMinPrice, currentMaxPrice]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === null ||
        val === "" ||
        (key === "category" && val === "All") ||
        (key === "page" && val === "1") ||
        (key === "sortBy" && val === "newest")
      ) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleCategoryChange = (cat: string) => {
    updateFilters({ category: cat, page: "1" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchVal.trim() || null, page: "1" });
  };

  const handleClearSearch = () => {
    setSearchVal("");
    updateFilters({ q: null, page: "1" });
  };

  const handleSortChange = (newSort: string) => {
    updateFilters({ sortBy: newSort, page: "1" });
  };

  const handleApplyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const min = minPriceInput ? Number(minPriceInput) : null;
    const max = maxPriceInput ? Number(maxPriceInput) : null;
    updateFilters({
      minPrice: min !== null && !isNaN(min) ? String(min) : null,
      maxPrice: max !== null && !isNaN(max) ? String(max) : null,
      page: "1",
    });
  };

  const handleQuickPrice = (min: number | null, max: number | null) => {
    setMinPriceInput(min !== null ? String(min) : "");
    setMaxPriceInput(max !== null ? String(max) : "");
    updateFilters({
      minPrice: min !== null ? String(min) : null,
      maxPrice: max !== null ? String(max) : null,
      page: "1",
    });
  };

  const handleResetAll = () => {
    setSearchVal("");
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    updateFilters({ page: String(newPage) });
    const target = document.getElementById("store-top");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const hasActiveFilters =
    (currentCategory !== "All" && Boolean(currentCategory)) ||
    Boolean(currentQuery) ||
    currentMinPrice !== undefined ||
    currentMaxPrice !== undefined ||
    currentSort !== "newest";

  // Calculate items range indicator
  const fromItem = total === 0 ? 0 : (currentPage - 1) * 12 + 1;
  const toItem = Math.min(currentPage * 12, total);

  return (
    <div id="store-top" className="px-4 lg:px-6">
      {/* Category Pills & Search Row */}
      <div className="border-b border-current/20 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive =
                currentCategory.toLowerCase() === cat.toLowerCase() ||
                (cat === "All" && (!currentCategory || currentCategory === "All"));
              return (
                <button
                  key={cat}
                  type="button"
                  data-cursor
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-mono transition-all duration-200 border ${
                    isActive
                      ? "border-current bg-current text-cream dark:text-black font-bold shadow-sm"
                      : "border-current/25 hover:border-current/70 opacity-70 hover:opacity-100 bg-transparent"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Bar & Price Filter Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="SEARCH ARCHIVE..."
                data-cursor
                className="w-full sm:w-64 border border-current/30 bg-transparent px-3.5 py-2 text-xs uppercase font-mono tracking-wider placeholder:text-current/30 focus:border-current focus:outline-none"
              />
              {searchVal && (
                <button
                  type="button"
                  data-cursor
                  onClick={handleClearSearch}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 p-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                data-cursor
                className="border-y border-r border-current/30 px-3.5 py-2 text-xs uppercase font-mono tracking-widest hover:bg-current/10 transition-colors"
              >
                {isPending ? "..." : "SEARCH"}
              </button>
            </form>

            <button
              type="button"
              data-cursor
              onClick={() => setShowPriceFilter((prev) => !prev)}
              className={`border px-3.5 py-2 text-xs uppercase font-mono tracking-widest transition-colors ${
                showPriceFilter || currentMinPrice !== undefined || currentMaxPrice !== undefined
                  ? "border-current bg-current/10 font-bold"
                  : "border-current/30 hover:border-current"
              }`}
            >
              Price Filter {currentMinPrice !== undefined || currentMaxPrice !== undefined ? "●" : "▾"}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                aria-label="Sort products"
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                data-cursor
                className="appearance-none border border-current/30 bg-transparent px-4 py-2 pr-8 text-xs uppercase font-mono tracking-widest focus:border-current focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-cream dark:bg-black text-current">
                  Newest Drops
                </option>
                <option value="price-asc" className="bg-cream dark:bg-black text-current">
                  Price: Low to High
                </option>
                <option value="price-desc" className="bg-cream dark:bg-black text-current">
                  Price: High to Low
                </option>
                <option value="title-asc" className="bg-cream dark:bg-black text-current">
                  Name: A to Z
                </option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Price Filter Drawer */}
        {showPriceFilter && (
          <div className="mt-5 border border-current/20 bg-current/5 p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Quick price chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono opacity-50 tracking-wider mr-2">
                  Quick Presets:
                </span>
                <button
                  type="button"
                  data-cursor
                  onClick={() => handleQuickPrice(null, null)}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase border border-current/20 hover:border-current"
                >
                  All
                </button>
                <button
                  type="button"
                  data-cursor
                  onClick={() => handleQuickPrice(null, 1500)}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase border border-current/20 hover:border-current"
                >
                  Under ₹1,500
                </button>
                <button
                  type="button"
                  data-cursor
                  onClick={() => handleQuickPrice(1500, 3000)}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase border border-current/20 hover:border-current"
                >
                  ₹1,500 – ₹3,000
                </button>
                <button
                  type="button"
                  data-cursor
                  onClick={() => handleQuickPrice(3000, null)}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase border border-current/20 hover:border-current"
                >
                  Over ₹3,000
                </button>
              </div>

              {/* Custom Min / Max inputs */}
              <form onSubmit={handleApplyPriceFilter} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="MIN"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-20 border border-current/30 bg-transparent px-2 py-1 text-xs font-mono focus:border-current focus:outline-none"
                  />
                </div>
                <span className="opacity-40 font-mono">—</span>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span>₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="MAX"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-20 border border-current/30 bg-transparent px-2 py-1 text-xs font-mono focus:border-current focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  data-cursor
                  className="border border-current px-3 py-1 font-mono text-xs uppercase tracking-wider bg-current text-cream dark:text-black font-bold"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider">
            <div className="flex flex-wrap items-center gap-2">
              <span className="opacity-50">Active Filters:</span>
              {currentCategory && currentCategory !== "All" && (
                <span className="inline-flex items-center gap-1 border border-current/30 bg-current/10 px-2 py-0.5">
                  Category: {currentCategory}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("All")}
                    className="opacity-60 hover:opacity-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
              {currentQuery && (
                <span className="inline-flex items-center gap-1 border border-current/30 bg-current/10 px-2 py-0.5">
                  Query: &quot;{currentQuery}&quot;
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="opacity-60 hover:opacity-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
              {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 border border-current/30 bg-current/10 px-2 py-0.5">
                  Price: ₹{currentMinPrice ?? 0} — ₹{currentMaxPrice ?? "∞"}
                  <button
                    type="button"
                    onClick={() => handleQuickPrice(null, null)}
                    className="opacity-60 hover:opacity-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
              {currentSort !== "newest" && (
                <span className="inline-flex items-center gap-1 border border-current/30 bg-current/10 px-2 py-0.5">
                  Sort: {currentSort}
                  <button
                    type="button"
                    onClick={() => handleSortChange("newest")}
                    className="opacity-60 hover:opacity-100 ml-1"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              data-cursor
              onClick={handleResetAll}
              className="underline underline-offset-4 opacity-75 hover:opacity-100"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Meta Bar: Item Counts & Status */}
      <div className="my-6 flex items-center justify-between font-mono text-xs uppercase tracking-widest opacity-60">
        <div>
          Showing {fromItem}–{toItem} of {total} {total === 1 ? "Product" : "Products"}
        </div>
        <div>Page {currentPage} of {totalPages}</div>
      </div>

      {/* Products Grid or Empty State */}
      {initialProducts.length === 0 ? (
        <div className="my-24 border border-dashed border-current/20 p-12 text-center">
          <p className="text-2xl font-[900] uppercase tracking-tighter">No products matched your criteria</p>
          <p className="mt-3 text-sm font-mono opacity-60 max-w-md mx-auto">
            Try adjusting your search query, changing the category, or expanding your price range.
          </p>
          <div className="mt-8">
            <button
              type="button"
              data-cursor
              onClick={handleResetAll}
              className="border border-current px-6 py-3 font-mono text-xs uppercase tracking-widest bg-current text-cream dark:text-black font-bold hover:opacity-90"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <section className="mb-20 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {initialProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </section>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="my-16 border-t border-current/20 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs uppercase tracking-widest">
            <p className="opacity-60">
              Page {currentPage} of {totalPages} ({total} items in catalog)
            </p>

            <div className="flex items-center gap-2">
              {/* Prev Button */}
              <button
                type="button"
                data-cursor
                disabled={currentPage <= 1 || isPending}
                onClick={() => handlePageChange(currentPage - 1)}
                className="border border-current/30 px-4 py-2 hover:border-current disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                  // Keep UI clean: show first page, last page, current, and adjacent
                  const isVisible =
                    num === 1 ||
                    num === totalPages ||
                    Math.abs(num - currentPage) <= 1;

                  if (!isVisible) {
                    if (num === 2 || num === totalPages - 1) {
                      return (
                        <span key={num} className="px-1 opacity-40">
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  const isCurrent = currentPage === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      data-cursor
                      onClick={() => handlePageChange(num)}
                      className={`h-9 w-9 border text-center transition-all ${
                        isCurrent
                          ? "border-current bg-current text-cream dark:text-black font-bold"
                          : "border-current/25 hover:border-current/70"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                data-cursor
                disabled={currentPage >= totalPages || isPending}
                onClick={() => handlePageChange(currentPage + 1)}
                className="border border-current/30 px-4 py-2 hover:border-current disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
