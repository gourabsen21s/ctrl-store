"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { imageFor, money, type Product } from "@/lib/products";
import { useBag } from "@/components/providers/BagProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import ShareButton from "@/components/ShareButton";
import ProductReviews from "@/components/ProductReviews";

/**
 * Scrolling image column against a sticky info column. The stick is on an
 * inner wrapper rather than the column itself so it releases naturally at the
 * end of the gallery instead of jamming against the footer.
 */
export default function ProductDetail({ product }: { product: Product }) {
  const { add } = useBag();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.handle);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const gallery: ("front" | "back")[] = ["front", "back", "front"];

  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const maxStock = product.stock !== undefined ? product.stock : 99;

  const onAdd = () => {
    if (isSoldOut) return;
    add({
      handle: product.handle,
      title: product.title,
      price: product.price,
      size,
      qty,
      image: imageFor(product, "front"),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto mt-28 mb-40 px-4 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-16">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {gallery.map((face, i) => (
            <Image
              key={i}
              src={imageFor(product, face)}
              alt={`${product.title} — view ${i + 1}`}
              width={900}
              height={1200}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-large w-full object-cover"
            />
          ))}
        </div>

        <div className="lg:col-span-7 lg:col-start-10">
          <div className="lg:sticky lg:top-28">
            <Link
              href="/"
              data-cursor
              className="mb-8 inline-flex items-center gap-2 text-xs uppercase"
            >
              <span aria-hidden>←</span> Return to Shop
            </Link>

            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-[900] tracking-tighter">
              {product.title}
            </h1>
            <p className="mt-3 text-3xl">{money(product.price)}</p>

            {/* Inventory / Stock Status Indicator */}
            {isSoldOut ? (
              <div className="mt-4 inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Sold Out — Currently out of stock</span>
              </div>
            ) : isLowStock ? (
              <div className="mt-4 inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Limited Drop: Only {product.stock} left in stock</span>
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>In Stock ({product.stock ?? 15} units available)</span>
              </div>
            )}

            <p className="mt-5 max-w-[46ch] text-base">{product.description}</p>

            <dl className="mt-10 text-sm">
              <div className="flex items-center justify-between border-t border-current/30 py-4">
                <dt>Color</dt>
                <dd>{product.color}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-current/30 py-4">
                <dt>Size</dt>
                <dd className="flex flex-wrap justify-end gap-4">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-cursor
                      disabled={isSoldOut}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`transition-opacity duration-200 ${
                        size === s ? "underline underline-offset-4" : "opacity-45 hover:opacity-100"
                      } ${isSoldOut ? "cursor-not-allowed opacity-30" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>

            {!isSoldOut && (
              <div className="flex items-center gap-6 border-t border-current/30 py-5 text-xl">
                <button
                  type="button"
                  data-cursor
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="leading-none"
                >
                  −
                </button>
                <span className="tabular-nums">{qty}</span>
                <button
                  type="button"
                  data-cursor
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
                  disabled={qty >= maxStock}
                  className="leading-none disabled:opacity-30"
                >
                  +
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-current/30 pt-5">
              <button
                type="button"
                data-cursor
                disabled={isSoldOut}
                onClick={onAdd}
                className={`text-left text-2xl transition-opacity duration-200 ${
                  isSoldOut
                    ? "opacity-35 cursor-not-allowed text-neutral-400"
                    : "hover:opacity-60"
                }`}
              >
                {isSoldOut ? (
                  "Sold Out"
                ) : added ? (
                  "Added to Bag"
                ) : (
                  <>
                    Add to Bag <span aria-hidden>↗</span>
                  </>
                )}
              </button>

              <button
                type="button"
                data-cursor
                onClick={() => toggleWishlist(product)}
                aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider py-2 transition-all ${
                  isSaved
                    ? "text-red font-bold"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <svg
                  className={`h-4 w-4 transition-transform ${isSaved ? "fill-current scale-110" : "fill-none stroke-current stroke-2"}`}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <span>{isSaved ? "Saved in Wishlist" : "Save to Wishlist"}</span>
              </button>
            </div>

            {/* WhatsApp & Social Share */}
            <ShareButton product={product} />
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <ProductReviews productHandle={product.handle} productTitle={product.title} />
    </div>
  );
}
