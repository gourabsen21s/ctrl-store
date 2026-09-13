import Link from "next/link";

interface HomePaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  category?: string;
  query?: string;
}

export default function HomePagination({
  currentPage,
  totalPages,
  total,
  category = "All",
  query = "",
}: HomePaginationProps) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category && category !== "All") params.set("category", category);
    if (query) params.set("q", query);
    const qs = params.toString();
    return `/${qs ? `?${qs}` : ""}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-12 mb-28 border-t border-current/20 pt-8">
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs uppercase tracking-widest mb-12">
          {/* Status Count */}
          <div className="opacity-60 text-center md:text-left">
            Page {currentPage} of {totalPages} — {total} Total Products
          </div>

          {/* Pager Buttons */}
          <div className="flex items-center gap-3">
          {hasPrev ? (
            <Link
              href={buildPageUrl(currentPage - 1)}
              data-cursor
              className="border border-current/30 px-5 py-2.5 hover:border-current hover:bg-current/5 transition-all text-xs font-bold"
            >
              ← Prev Page
            </Link>
          ) : (
            <span className="border border-current/10 px-5 py-2.5 opacity-20 cursor-not-allowed">
              ← Prev Page
            </span>
          )}

          {/* Numbered Pills */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
              const isCurrent = currentPage === num;
              return (
                <Link
                  key={num}
                  href={buildPageUrl(num)}
                  data-cursor
                  className={`h-9 w-9 flex items-center justify-center border text-xs transition-all ${
                    isCurrent
                      ? "border-current bg-current text-cream dark:text-black font-bold"
                      : "border-current/20 hover:border-current/60"
                  }`}
                >
                  {num}
                </Link>
              );
            })}
          </div>

          {hasNext ? (
            <Link
              href={buildPageUrl(currentPage + 1)}
              data-cursor
              className="border border-current/30 px-5 py-2.5 hover:border-current hover:bg-current/5 transition-all text-xs font-bold"
            >
              Next Page →
            </Link>
          ) : (
            <span className="border border-current/10 px-5 py-2.5 opacity-20 cursor-not-allowed">
              Next Page →
            </span>
          )}
        </div>
      </div>
      )}

      {/* CTA to Full Store with Advanced Filters */}
      <div className="mt-12 border border-current/15 bg-current/5 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-widest opacity-60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>FULL ARCHIVE &amp; HARDWARE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-[900] tracking-tighter uppercase">
            Looking for specific styles or price ranges?
          </h3>
          <p className="mt-1 text-xs font-mono opacity-60 max-w-lg">
            Use the dedicated Store to filter by price, category tabs, and real-time production search.
          </p>
        </div>

        <Link
          href="/store"
          data-cursor
          className="inline-flex items-center justify-center bg-black text-cream dark:bg-cream dark:text-black red:bg-red red:text-cream px-6 py-3.5 text-xs font-[900] uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shrink-0"
        >
          Open Store &amp; Filters →
        </Link>
      </div>
    </div>
  );
}
