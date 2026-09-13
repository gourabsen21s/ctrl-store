import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Preloader from "@/components/Preloader";
import ReferralBanner from "@/components/ReferralBanner";
import HomePagination from "@/components/HomePagination";
import { getProducts } from "@/lib/products-db";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Two grid systems on purpose. A regular four-up sets the rhythm, then three
 * scatter rows break it with explicit column placement and deliberate empty
 * cells. Spans and start/end pairs are measured off the reference rather than
 * eyeballed — the gaps between items are as load-bearing as the items.
 */
const SCATTER: string[][] = [
  [
    "col-span-4 md:col-span-3",
    "col-span-4 md:col-span-3",
    "col-span-8 md:col-start-9 md:[grid-column-end:-1]",
  ],
  [
    "col-span-4 md:col-span-3",
    "col-start-3 col-end-6 md:col-start-6 md:col-end-9",
    "col-start-6 col-end-9 md:col-start-9 md:col-end-12",
  ],
  [
    "col-span-5",
    "col-start-2 col-end-5 md:col-start-11 md:col-end-[14]",
    "col-start-5 col-end-9 md:col-start-[14] md:col-end-[17]",
  ],
];

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params?.q || "";
  const category = params?.category || "All";
  const page = parseInt(params?.page || "1", 10);

  const { products, total, totalPages, currentPage } = await getProducts({
    q,
    category,
    page,
    limit: 13,
  });

  const isFiltered = (category !== "All" && Boolean(category)) || Boolean(q.trim()) || page > 1;

  // On default unfiltered view (page 1), use the bespoke scatter layout
  const lead = products.slice(0, 4);
  const rest = products.slice(4, 13);
  const extra = products.slice(13);

  return (
    <>
      <Preloader />
      <main id="page" data-page="home">
        <Hero />

        {/* Latest Drops Section Header */}
        <div className="px-4 lg:px-6 mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-current/20 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest opacity-60">
                <span className="h-2 w-2 rounded-full bg-red animate-pulse" />
                <span>SIGNATURE CURATION</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-[900] tracking-tighter uppercase leading-none">
                LATEST DROPS
              </h2>
            </div>
            <Link
              href="/store"
              data-cursor
              className="inline-flex items-center gap-2 border border-current/30 px-5 py-2.5 font-mono text-xs uppercase tracking-widest hover:bg-current/10 transition-colors w-fit"
            >
              <span>OPEN FULL STORE &amp; FILTERS</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          {products.length === 0 ? (
            <div className="my-24 text-center">
              <p className="text-xl uppercase tracking-wider opacity-60">No products found</p>
              <p className="mt-2 text-xs opacity-40">Try searching for a different term or resetting category filters.</p>
            </div>
          ) : isFiltered ? (
            /* Clean responsive catalogue grid when filtered or searching */
            <section className="mb-34 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </section>
          ) : (
            /* Default signature editorial scatter layout */
            <>
              <section className="mb-34 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {lead.map((p) => (
                  <ProductCard key={p.handle} product={p} />
                ))}
              </section>

              {SCATTER.map((row, rowIndex) => (
                <div key={rowIndex} className="mb-34 grid grid-cols-8 gap-6 md:grid-cols-16">
                  {row.map((cell, i) => {
                    const product = rest[rowIndex * 3 + i];
                    if (!product) return null;
                    return (
                      <div key={product.handle} className={cell}>
                        <ProductCard product={product} />
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Any additional products beyond 13 on page 1 */}
              {extra.length > 0 && (
                 <section className="mb-34 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                   {extra.map((p) => (
                     <ProductCard key={p.handle} product={p} />
                   ))}
                 </section>
               )}
             </>
           )}

          {/* Bottom Pagination & Store CTA */}
          {products.length > 0 && (
            <HomePagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              category={category}
              query={q}
            />
          )}
        </div>

        <ReferralBanner />
        <Footer />
      </main>
    </>
  );
}
