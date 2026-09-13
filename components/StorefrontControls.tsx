"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/products";

interface StorefrontControlsProps {
  total: number;
  currentCategory: string;
  currentQuery: string;
  currentPage: number;
  totalPages: number;
}

export default function StorefrontControls({
  total,
  currentCategory,
  currentQuery,
  currentPage,
  totalPages,
}: StorefrontControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(currentQuery);

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "category" && val === "All") || (key === "page" && val === "1")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: q.trim() || null, page: "1" });
  };

  const handleCategoryClick = (cat: string) => {
    updateParams({ category: cat, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const hasFilters = currentCategory !== "All" || currentQuery !== "";

  return (
    <div className="mb-12 px-4 lg:px-6">
      {/* Search and Category Filter Bar */}
      <div className="flex flex-col gap-6 border-b border-current/20 pb-6 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                data-cursor
                onClick={() => handleCategoryClick(cat)}
                className={`text-xs uppercase tracking-wider transition-all duration-200 px-3 py-1.5 border ${
                  isActive
                    ? "border-current bg-current text-cream dark:text-black font-bold"
                    : "border-current/20 hover:border-current/60 opacity-60 hover:opacity-100"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search catalog..."
              data-cursor
              className="w-full sm:w-56 border border-current/30 bg-transparent px-3 py-1.5 text-xs placeholder:text-current/40 focus:border-current focus:outline-none uppercase tracking-wide"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  updateParams({ q: null, page: "1" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            data-cursor
            className="border border-current/40 px-3.5 py-1.5 text-xs uppercase tracking-wider hover:border-current transition-colors"
          >
            {isPending ? "..." : "Find"}
          </button>
        </form>
      </div>

      {/* Filter Status Summary */}
      {hasFilters && (
        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wider opacity-70">
          <p>
            Filtering by: <span className="font-bold underline">{currentCategory}</span>
            {currentQuery && (
              <span>
                {" "}
                matching &quot;<span className="font-bold">{currentQuery}</span>&quot;
              </span>
            )}{" "}
            — {total} {total === 1 ? "result" : "results"}
          </p>
          <button
            type="button"
            data-cursor
            onClick={() => {
              setQ("");
              updateParams({ category: null, q: null, page: "1" });
            }}
            className="underline underline-offset-4 opacity-75 hover:opacity-100"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-current/15 pt-6 text-xs uppercase tracking-wider">
          <p className="opacity-60">
            Page {currentPage} of {totalPages} ({total} items)
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-cursor
              disabled={currentPage <= 1 || isPending}
              onClick={() => handlePageChange(currentPage - 1)}
              className="border border-current/30 px-3 py-1 hover:border-current disabled:opacity-20 transition-opacity"
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  data-cursor
                  onClick={() => handlePageChange(num)}
                  className={`h-7 w-7 border text-center transition-all ${
                    currentPage === num
                      ? "border-current bg-current text-cream dark:text-black font-bold"
                      : "border-current/20 hover:border-current/60"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              type="button"
              data-cursor
              disabled={currentPage >= totalPages || isPending}
              onClick={() => handlePageChange(currentPage + 1)}
              className="border border-current/30 px-3 py-1 hover:border-current disabled:opacity-20 transition-opacity"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
