import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import HomeLoader from "@/components/HomeLoader";
import { PRODUCTS } from "@/lib/products";

/**
 * Two grid systems on purpose. A regular four-up sets the rhythm, then three
 * scatter rows break it with explicit column placement and deliberate empty
 * cells. Spans and start/end pairs are measured off the reference rather than
 * eyeballed — the gaps between items are as load-bearing as the items.
 *
 * Classes are written out in full because Tailwind only emits what it can see
 * as a literal string.
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

export default function Home() {
  const lead = PRODUCTS.slice(0, 4);
  const rest = PRODUCTS.slice(4, 13);

  return (
    <>
      <HomeLoader />
      <main id="page" data-page="home">
        <Hero />

        <div className="px-4 lg:px-6">
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
        </div>

        <Footer />
      </main>
    </>
  );
}
