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
    <div className="mt-8 mb-24 border-t border-current/20 pt-8">
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs uppercase tracking-widest mb-10">
          {/* Status Count */}
          <div className="opacity-60 text-center sm:text-left">
            Page {currentPage} of {totalPages} — {total} Total Pieces
          </div>

          {/* Pager */}
          <div className="flex items-center gap-4">
            {hasPrev ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                data-cursor
                className="link-hover font-bold"
              >
                ← Prev
              </Link>
            ) : (
              <span className="opacity-20 cursor-not-allowed">← Prev</span>
            )}

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                const isCurrent = currentPage === num;
                return (
                  <Link
                    key={num}
                    href={buildPageUrl(num)}
                    data-cursor
                    className={`px-2 py-0.5 text-xs transition-colors ${
                      isCurrent
                        ? "bg-current text-cream dark:text-black font-bold"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {String(num).padStart(2, "0")}
                  </Link>
                );
              })}
            </div>

            {hasNext ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                data-cursor
                className="link-hover font-bold"
              >
                Next →
              </Link>
            ) : (
              <span className="opacity-20 cursor-not-allowed">Next →</span>
            )}
          </div>
        </div>
      )}

      {/* Gateway to Full Store */}
      <div className="border border-current/20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-red">
            <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
            <span>FULL ARCHIVE ACCESS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-[900] tracking-tighter uppercase leading-tight">
            Explore Complete Store &amp; Hardware
          </h3>
          <p className="mt-1.5 text-xs font-mono opacity-60 max-w-xl">
            Filter by garment category, hardware spec, price range, and real-time archival stock.
          </p>
        </div>

        <Link
          href="/store"
          data-cursor
          className="inline-flex items-center justify-center border border-current px-6 py-3.5 text-xs font-mono font-bold uppercase tracking-widest hover:bg-current hover:text-cream dark:hover:text-black transition-colors shrink-0"
        >
          <span>OPEN STORE DIRECTORY</span>
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  );
}
